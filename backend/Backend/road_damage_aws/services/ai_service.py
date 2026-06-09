import os
import io
from PIL import Image, ImageOps
from fastapi import UploadFile
from dotenv import load_dotenv
from ultralytics import YOLO

load_dotenv()

# We can load the custom trained YOLO model
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../ai-model/best.pt"))
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    model = None

# Class names mapping from best.pt classes to frontend display names
CLASS_MAPPING = {
    "longitudinal_crack": "Longitudinal Cracks",
    "transverse_crack": "Transverse Cracks",
    "alligator_crack": "Alligator Cracks",
    "pothole": "Pothole"
}

async def analyze_image_with_ai(file: UploadFile):
    """
    Sends the image to the YOLO AI model and returns the predictions.
    """
    file_content = await file.read()
    await file.seek(0)
    
    default_result = {
        "damage_type": "None",
        "confidence": 1.0,
        "severity": "None",
        "analysis": {
            "detected_issues": []
        }
    }
    
    if not model:
        return default_result

    try:
        # Load image via PIL, apply EXIF transposition, and convert to RGB
        raw_img = Image.open(io.BytesIO(file_content))
        img = ImageOps.exif_transpose(raw_img).convert("RGB")
        img_width, img_height = img.size
        
        # Run YOLO inference at resolution 640 and confidence 0.1 for single images
        results = model(img, conf=0.1, imgsz=640)
        
        detected_issues = []
        has_pothole = False
        pothole_highest_conf = 0.0
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # get box coordinates in (x, y, w, h)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                w = x2 - x1
                h = y2 - y1
                # get confidence
                conf = float(box.conf[0])
                # get class
                cls = int(box.cls[0])
                raw_class_name = model.names.get(cls, "unknown")
                issue_type = CLASS_MAPPING.get(raw_class_name, raw_class_name.replace('_', ' ').title())
                
                bbox_area = w * h
                img_area = img_width * img_height
                relative_area = (bbox_area / img_area) * 100 if img_area > 0 else 0
                
                # Potholes are always High severity (priority fix) regardless of confidence/area
                if issue_type == "Pothole":
                    severity = "High"
                    has_pothole = True
                    if conf > pothole_highest_conf:
                        pothole_highest_conf = conf
                else:
                    severity = calculate_severity(conf, relative_area)
                
                # Convert bbox coordinates to percentages for the frontend
                x_pct = (x1 / img_width) * 100
                y_pct = (y1 / img_height) * 100
                w_pct = (w / img_width) * 100
                h_pct = (h / img_height) * 100
                
                detected_issues.append({
                    "type": issue_type,
                    "severity": severity,
                    "confidence": conf,
                    "bbox": [x_pct, y_pct, w_pct, h_pct]
                })

        # Determine primary damage and severity (Potholes take priority)
        highest_conf = 0.0
        primary_damage = "None"
        primary_severity = "None"

        if has_pothole:
            primary_damage = "Pothole"
            primary_severity = "High"
            highest_conf = pothole_highest_conf
        else:
            for issue in detected_issues:
                if issue["confidence"] > highest_conf:
                    highest_conf = issue["confidence"]
                    primary_damage = issue["type"]
                    primary_severity = issue["severity"]

        # Generate YOLO-annotated image with native bounding boxes
        annotated_image_bytes = None
        try:
            annotated_np = results[0].plot()  # numpy array (BGR) with boxes drawn by YOLO
            annotated_pil = Image.fromarray(annotated_np[..., ::-1])  # BGR to RGB
            img_buf = io.BytesIO()
            annotated_pil.save(img_buf, format="JPEG", quality=90)
            annotated_image_bytes = img_buf.getvalue()
        except Exception as plot_err:
            print(f"YOLO plot error: {plot_err}")
                    
        if not detected_issues:
            return {
                "damage_type": "None",
                "confidence": 1.0,
                "severity": "None",
                "annotated_image": None,
                "analysis": {
                    "image_width": img_width,
                    "image_height": img_height,
                    "detected_issues": []
                }
            }
            
        return {
            "damage_type": primary_damage,
            "confidence": highest_conf,
            "severity": primary_severity,
            "annotated_image": annotated_image_bytes,
            "analysis": {
                "image_width": img_width,
                "image_height": img_height,
                "detected_issues": detected_issues
            }
        }
    except Exception as e:
        print(f"YOLO inference error: {e}")
        return default_result

def analyze_frame_with_ai(img) -> dict:
    """Synchronous helper to analyze a raw cv2 frame or PIL Image for video processing."""
    # Determine dimensions
    if hasattr(img, 'shape'):
        img_height, img_width = img.shape[:2]
    elif hasattr(img, 'size'):
        img_width, img_height = img.size
    else:
        img_width, img_height = 640, 480

    default_result = {
        "damage_type": "None",
        "confidence": 1.0,
        "severity": "None",
        "analysis": {
            "image_width": img_width,
            "image_height": img_height,
            "detected_issues": []
        }
    }
    
    if not model:
        return default_result

    try:
        results = model(img, conf=0.15, imgsz=640)
        detected_issues = []
        has_pothole = False
        pothole_highest_conf = 0.0
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                w = x2 - x1
                h = y2 - y1
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                raw_class_name = model.names.get(cls, "unknown")
                issue_type = CLASS_MAPPING.get(raw_class_name, raw_class_name.replace('_', ' ').title())
                
                bbox_area = w * h
                img_area = img_width * img_height
                relative_area = (bbox_area / img_area) * 100 if img_area > 0 else 0
                
                # Potholes are always High severity (priority fix) regardless of confidence/area
                if issue_type == "Pothole":
                    severity = "High"
                    has_pothole = True
                    if conf > pothole_highest_conf:
                        pothole_highest_conf = conf
                else:
                    severity = calculate_severity(conf, relative_area)
                
                # Convert bbox coordinates to percentages for the frontend
                x_pct = (x1 / img_width) * 100
                y_pct = (y1 / img_height) * 100
                w_pct = (w / img_width) * 100
                h_pct = (h / img_height) * 100
                
                detected_issues.append({
                    "type": issue_type,
                    "severity": severity,
                    "confidence": conf,
                    "bbox": [x_pct, y_pct, w_pct, h_pct]
                })

        # Determine primary damage and severity (Potholes take priority)
        highest_conf = 0.0
        primary_damage = "None"
        primary_severity = "None"

        if has_pothole:
            primary_damage = "Pothole"
            primary_severity = "High"
            highest_conf = pothole_highest_conf
        else:
            for issue in detected_issues:
                if issue["confidence"] > highest_conf:
                    highest_conf = issue["confidence"]
                    primary_damage = issue["type"]
                    primary_severity = issue["severity"]
                    
        if not detected_issues:
            return default_result
            
        return {
            "damage_type": primary_damage,
            "confidence": highest_conf,
            "severity": primary_severity,
            "analysis": {
                "image_width": img_width,
                "image_height": img_height,
                "detected_issues": detected_issues
            }
        }
    except Exception as e:
        print(f"YOLO frame inference error: {e}")
        return default_result

def calculate_severity(confidence: float, relative_area: float) -> str:
    """
    Calculates severity based on confidence thresholds:
    - Low: < 35% (< 0.35)
    - Medium: 35% to 65% (0.35 - 0.65)
    - High (Critical): >= 65% (>= 0.65)
    """
    if confidence >= 0.65:
        return "High"
    elif confidence >= 0.35:
        return "Medium"
    else:
        return "Low"

