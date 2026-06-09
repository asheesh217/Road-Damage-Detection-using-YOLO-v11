
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from services.s3_service import upload_image_to_s3, upload_bytes_to_s3
from services.ai_service import analyze_image_with_ai, analyze_frame_with_ai
import uuid
import os
import json
import imageio
from starlette.concurrency import run_in_threadpool

router = APIRouter(
    prefix="/api/reports",
    tags=["Road Damage Reports"]
)

# Constants for validation
ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/", response_model=schemas.RoadDamageOut, status_code=status.HTTP_201_CREATED)
async def create_damage_report(
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Uploads an image, sends it to AI for detection, saves to AWS S3 Storage, and stores in PostgreSQL.
    """
    try:
        # 1. Validate file type and size
        if file.content_type not in ALLOWED_FILE_TYPES:
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are allowed.")
        
        file.file.seek(0, 2)
        file_size = file.file.tell()
        await file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

        # 2. Forward image to AI model service
        ai_result = await analyze_image_with_ai(file)
        
        # 3. Upload original image to AWS S3 Storage
        s3_url = await upload_image_to_s3(file)
        
        # 4. Upload YOLO-annotated image (with detection boxes) to S3
        annotated_url = None
        annotated_bytes = ai_result.get("annotated_image")
        if annotated_bytes:
            try:
                annotated_url = await upload_bytes_to_s3(annotated_bytes, extension="jpg")
            except Exception as ann_err:
                print(f"Failed to upload annotated image: {ann_err}")
        
        # 5. Store metadata in database (including detection bboxes)
        detection_issues = ai_result.get("analysis", {}).get("detected_issues", [])
        db_report = models.RoadDamage(
            image_url=s3_url,
            damage_type=ai_result["damage_type"],
            severity=ai_result["severity"],
            latitude=latitude,
            longitude=longitude,
            confidence=ai_result["confidence"],
            detection_data=json.dumps(detection_issues) if detection_issues else None,
            annotated_image_url=annotated_url
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        report_dict = {
            "id": db_report.id,
            "damage_type": db_report.damage_type,
            "severity": db_report.severity,
            "latitude": db_report.latitude,
            "longitude": db_report.longitude,
            "confidence": db_report.confidence,
            "image_url": db_report.image_url,
            "created_at": db_report.created_at,
            "analysis": ai_result.get("analysis", {})
        }
        
        return report_dict
        
    except Exception as e:
        import traceback
        try:
            log_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            log_path = os.path.join(log_dir, "backend_err.txt")
            with open(log_path, "w") as f:
                traceback.print_exc(file=f)
        except Exception:
            pass
        db.rollback()
        return JSONResponse(status_code=500, content={"detail": f"LOCAL: {str(e)}"})

@router.get("/", response_model=list[schemas.RoadDamageOut])
def get_all_reports(
    severity: str | None = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """API to fetch all damage reports with optional severity filter."""
    query = db.query(models.RoadDamage)
    
    if severity:
        query = query.filter(models.RoadDamage.severity == severity.capitalize())
        
    reports = query.order_by(models.RoadDamage.created_at.desc()).offset(skip).limit(limit).all()
    return reports

@router.get("/{report_id}", response_model=schemas.RoadDamageOut)
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    """API to fetch a single report by ID."""
    report = db.query(models.RoadDamage).filter(models.RoadDamage.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return report

def _compress_download_image(image_source, max_size=(1280, 960), quality=75):
    """Resizes and compresses image for download to save bandwidth and storage."""
    from PIL import Image as PILImage
    import io
    try:
        img = PILImage.open(image_source)
        img.thumbnail(max_size, PILImage.Resampling.LANCZOS)
        out_buf = io.BytesIO()
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        img.save(out_buf, format="JPEG", quality=quality, optimize=True)
        out_buf.seek(0)
        return out_buf
    except Exception as e:
        print(f"Error compressing download image: {e}")
        if isinstance(image_source, io.BytesIO):
            image_source.seek(0)
            return image_source
        return None

@router.get("/{report_id}/download-image")
def download_report_image(report_id: int, db: Session = Depends(get_db)):
    """Download the original image from S3 or local storage, compressed for efficiency."""
    import requests as http_requests
    from fastapi.responses import StreamingResponse
    import io

    report = db.query(models.RoadDamage).filter(models.RoadDamage.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Prioritize annotated image (with bounding boxes) over original image
    image_url = report.annotated_image_url or report.image_url

    # If it's an S3 URL, fetch from S3
    if image_url.startswith("http"):
        try:
            resp = http_requests.get(image_url, timeout=15)
            resp.raise_for_status()
            
            # Compress the image bytes
            compressed_buf = _compress_download_image(io.BytesIO(resp.content))
            filename = f"road_damage_report_{report_id}.jpg"
            return StreamingResponse(
                compressed_buf,
                media_type="image/jpeg",
                headers={"Content-Disposition": f'attachment; filename="{filename}"'}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch or compress image from S3: {str(e)}")
    else:
        # Local file — strip leading slashes for cross-platform compatibility
        cleaned = image_url.lstrip("/").lstrip("\\")
        local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", cleaned)
        local_path = os.path.normpath(local_path)
        if not os.path.exists(local_path):
            raise HTTPException(status_code=404, detail="Image file not found on server")
        
        try:
            compressed_buf = _compress_download_image(local_path)
            if compressed_buf is None:
                # Fallback to original local file if compression fails
                from fastapi.responses import FileResponse
                ext = local_path.rsplit(".", 1)[-1] if "." in local_path else "jpg"
                return FileResponse(
                    local_path,
                    media_type=f"image/{ext}",
                    filename=f"road_damage_report_{report_id}.{ext}",
                    headers={"Content-Disposition": f'attachment; filename="road_damage_report_{report_id}.{ext}"'}
                )
            
            filename = f"road_damage_report_{report_id}.jpg"
            return StreamingResponse(
                compressed_buf,
                media_type="image/jpeg",
                headers={"Content-Disposition": f'attachment; filename="{filename}"'}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process or compress local image: {str(e)}")



@router.get("/{report_id}/download-pdf")
def download_report_pdf(report_id: int, db: Session = Depends(get_db)):
    """Generate and download a professional PDF report with YOLO detection bounding boxes."""
    from fastapi.responses import StreamingResponse
    from services.pdf_service import generate_report_pdf

    report = db.query(models.RoadDamage).filter(models.RoadDamage.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    buffer = generate_report_pdf(report)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="StreetScan_Report_{report_id}.pdf"'}
    )


def _process_video_sync(temp_file_path: str) -> dict:
    """CPU-bound helper to extract and analyze video frames synchronously in a background thread."""
    from PIL import Image as PILImage
    reader = None
    try:
        reader = imageio.get_reader(temp_file_path)
        meta = reader.get_meta_data()
        fps = meta.get("fps", 30.0)
        total_frames = reader.get_length()
        if fps <= 0:
            fps = 30.0 # fallback
            
        timeline = []
        frame_interval = max(1, int(fps / 5)) # analyze 5 frames per second
        frames_scanned = 0
        damage_frames = 0
        highest_conf = 0.0
        worst_severity = "Low"
        best_frame_data = None  # Will hold the raw frame with highest confidence
        best_frame_conf = 0.0
        
        current_frame = 0
        timestamp = 0.0
        while True:
            if isinstance(total_frames, (int, float)) and total_frames != float('inf'):
                if current_frame >= total_frames:
                    break
            
            try:
                frame = reader.get_data(current_frame)
            except (IndexError, RuntimeError):
                break
                
            frames_scanned += 1
            timestamp = current_frame / fps
            
            ai_result = analyze_frame_with_ai(frame)
            detected_issues = ai_result.get("analysis", {}).get("detected_issues", [])
            
            if detected_issues:
                damage_frames += 1
                timeline.append({
                    "frame_index": current_frame,
                    "timestamp": round(timestamp, 2),
                    "detected_issues": detected_issues
                })
                
                # Track worst severity and peak confidence across all frames
                frame_max_conf = 0.0
                for issue in detected_issues:
                    if issue["confidence"] > highest_conf:
                        highest_conf = issue["confidence"]
                    if issue["confidence"] > frame_max_conf:
                        frame_max_conf = issue["confidence"]
                    if issue["severity"] == "High":
                        worst_severity = "High"
                    elif issue["severity"] == "Medium" and worst_severity != "High":
                        worst_severity = "Medium"
                
                # Capture the frame with highest confidence as the "best frame"
                if frame_max_conf > best_frame_conf:
                    best_frame_conf = frame_max_conf
                    best_frame_data = frame.copy()
                        
            # Cap at max 30 seconds of processing for demo to avoid timeouts
            if timestamp > 30:
                break
                
            current_frame += frame_interval
        
        # Convert best frame to JPEG bytes
        best_frame_bytes = None
        best_frame_annotated = None
        if best_frame_data is not None:
            try:
                pil_img = PILImage.fromarray(best_frame_data)
                import io as _io
                buf = _io.BytesIO()
                pil_img.save(buf, format="JPEG", quality=90)
                best_frame_bytes = buf.getvalue()
                
                # Run YOLO on best frame for annotated version
                from services.ai_service import model
                if model:
                    results = model(pil_img, conf=0.15, imgsz=1280)
                    annotated_np = results[0].plot()
                    annotated_pil = PILImage.fromarray(annotated_np[..., ::-1])
                    abuf = _io.BytesIO()
                    annotated_pil.save(abuf, format="JPEG", quality=90)
                    best_frame_annotated = abuf.getvalue()
            except Exception as e:
                print(f"Best frame capture error: {e}")
            
        return {
            "duration_seconds": round(timestamp, 2),
            "frames_scanned": frames_scanned,
            "damage_frames": damage_frames,
            "worst_severity": worst_severity if damage_frames > 0 else "None",
            "peak_confidence": round(highest_conf * 100) if damage_frames > 0 else 0,
            "timeline": timeline,
            "best_frame_bytes": best_frame_bytes,
            "best_frame_annotated": best_frame_annotated,
        }
    finally:
        if reader is not None:
            try:
                reader.close()
            except Exception:
                pass

@router.post("/video")
async def process_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Process video with YOLO, save to AWS S3, and store results in database."""
    import tempfile
    from services.s3_service import upload_video_to_s3, upload_bytes_to_s3
    
    ALLOWED_VIDEO_TYPES = ["video/mp4", "video/avi", "video/quicktime", "video/webm", "video/x-msvideo", "video/x-matroska"]
    if file.content_type and file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail="Invalid video format. Supported: MP4, AVI, MOV, WebM")
    
    temp_dir = tempfile.gettempdir()
    temp_file_name = f"{uuid.uuid4()}_{file.filename}"
    temp_file_path = os.path.join(temp_dir, temp_file_name)
    
    try:
        # 1. Save uploaded video to temp file for processing
        with open(temp_file_path, "wb") as buffer:
            buffer.write(await file.read())
            
        # 2. Run YOLO video analysis in threadpool
        result_data = await run_in_threadpool(_process_video_sync, temp_file_path)
        
        # 3. Upload original video to AWS S3
        await file.seek(0)
        try:
            video_url = await upload_video_to_s3(file)
        except Exception as s3_err:
            print(f"S3 video upload failed: {s3_err}")
            video_url = ""
        
        # 4. Upload best frame images to S3
        best_frame_url = None
        best_frame_annotated_url = None
        if result_data.get("best_frame_bytes"):
            try:
                best_frame_url = await upload_bytes_to_s3(result_data["best_frame_bytes"], extension="jpg")
            except Exception:
                pass
        if result_data.get("best_frame_annotated"):
            try:
                best_frame_annotated_url = await upload_bytes_to_s3(result_data["best_frame_annotated"], extension="jpg")
            except Exception:
                pass
        
        # 5. Save to database
        db_video = models.VideoReport(
            video_url=video_url,
            filename=file.filename or "unknown.mp4",
            duration_seconds=result_data.get("duration_seconds"),
            frames_scanned=result_data.get("frames_scanned", 0),
            damage_frames=result_data.get("damage_frames", 0),
            worst_severity=result_data.get("worst_severity", "None"),
            peak_confidence=result_data.get("peak_confidence", 0),
            timeline_data=json.dumps(result_data.get("timeline", [])),
            best_frame_url=best_frame_url,
            best_frame_annotated_url=best_frame_annotated_url,
        )
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        
        # Strip binary data before returning JSON response
        response_data = {k: v for k, v in result_data.items() if k not in ("best_frame_bytes", "best_frame_annotated")}

        return {
            "success": True,
            "video_report_id": db_video.id,
            "data": response_data
        }
        
    except Exception as e:
        print(f"Video processing error: {e}")
        return JSONResponse(status_code=500, content={"detail": f"Video processing failed: {str(e)}"})
        
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                print(f"Error removing temp file: {e}")


# ──────────────────────────────────────────────
# Video Report Endpoints
# ──────────────────────────────────────────────
@router.get("/videos/list", response_model=list[schemas.VideoReportOut])
def list_video_reports(db: Session = Depends(get_db)):
    """List all saved video analysis reports."""
    return db.query(models.VideoReport).order_by(models.VideoReport.created_at.desc()).all()


@router.get("/videos/{video_id}", response_model=schemas.VideoReportOut)
def get_video_report(video_id: int, db: Session = Depends(get_db)):
    """Get a single video report by ID."""
    report = db.query(models.VideoReport).filter(models.VideoReport.id == video_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Video report not found")
    return report


@router.get("/videos/{video_id}/download")
def download_video(video_id: int, db: Session = Depends(get_db)):
    """Download the original video from S3."""
    import requests as http_requests
    from fastapi.responses import StreamingResponse
    
    report = db.query(models.VideoReport).filter(models.VideoReport.id == video_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Video report not found")
    
    video_url = report.video_url
    if not video_url:
        raise HTTPException(status_code=404, detail="Video file not available")

    ext = video_url.rsplit(".", 1)[-1] if "." in video_url else "mp4"
    content_type_map = {
        "mp4": "video/mp4", "avi": "video/x-msvideo",
        "mov": "video/quicktime", "webm": "video/webm",
    }
    content_type = content_type_map.get(ext, "video/mp4")
    filename = report.filename or f"video_{video_id}.{ext}"

    if video_url.startswith("http"):
        try:
            resp = http_requests.get(video_url, stream=True, timeout=30)
            resp.raise_for_status()
            return StreamingResponse(
                resp.iter_content(chunk_size=8192),
                media_type=content_type,
                headers={"Content-Disposition": f'attachment; filename="{filename}"'}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch video: {str(e)}")
    else:
        cleaned = video_url.lstrip("/").lstrip("\\")
        local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", cleaned)
        local_path = os.path.normpath(local_path)
        if not os.path.exists(local_path):
            raise HTTPException(status_code=404, detail="Video file not found on server")
        from fastapi.responses import FileResponse
        return FileResponse(local_path, media_type=content_type, filename=filename)


@router.get("/videos/{video_id}/download-pdf")
def download_video_pdf(video_id: int, db: Session = Depends(get_db)):
    """Generate a professional PDF report for a video analysis."""
    from fastapi.responses import StreamingResponse
    from services.pdf_service import generate_video_report_pdf

    report = db.query(models.VideoReport).filter(models.VideoReport.id == video_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Video report not found")

    buffer = generate_video_report_pdf(report)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="StreetScan_Video_Report_{video_id}.pdf"'}
    )