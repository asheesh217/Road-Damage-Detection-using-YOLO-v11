from pydantic import BaseModel, field_validator, computed_field
from datetime import datetime, timezone
from typing import Optional
import json

class RoadDamageBase(BaseModel):
    damage_type: str
    severity: str
    latitude: float
    longitude: float
    confidence: float

class RoadDamageCreate(RoadDamageBase):
    image_url: str

class RoadDamageOut(RoadDamageBase):
    id: int
    image_url: str
    created_at: datetime
    analysis: Optional[dict] = None
    detection_data: Optional[str] = None
    annotated_image_url: Optional[str] = None

    @field_validator('created_at')
    @classmethod
    def ensure_utc(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    @computed_field
    @property
    def advisory_note(self) -> str:
        if not self.damage_type or self.damage_type == "None":
            return (
                "Road surface is structurally sound. Continue routine scans. "
                "Preventative maintenance scans every 60 days are advised to detect micro-distress early."
            )

        types = []
        if self.detection_data:
            try:
                dets = json.loads(self.detection_data)
                types = [d.get("type") for d in dets if d.get("type")]
            except Exception:
                pass

        has_pothole = "Pothole" in types or self.damage_type == "Pothole"
        has_alligator = "Alligator Cracks" in types
        has_longitudinal = "Longitudinal Cracks" in types
        has_transverse = "Transverse Cracks" in types

        if has_pothole and (has_alligator or has_longitudinal or has_transverse):
            return (
                "Urgent combined distress detected. The presence of cracks alongside active potholes indicates advanced surface failure. "
                "The pothole must be treated as an immediate emergency fix (patch within 48h), while the surrounding cracks should be scheduled "
                "for sealing in routine cycles to prevent secondary potholes from emerging."
            )
        
        if has_pothole:
            return (
                "Potholes pose immediate, high-severity hazard risks to traffic and pedestrians. Emergency patching must be executed "
                "within 48 hours to prevent severe vehicle chassis damage or accidents, whereas longitudinal/transverse cracks can be monitored "
                "and batched in regular seasonal maintenance cycles."
            )
        
        if has_alligator and (has_longitudinal or has_transverse):
            return (
                "Mixed cracking types detected. The combination of longitudinal/transverse structural joints with alligator fatigue cracks "
                "indicates deteriorating subgrade support. Routine patching should be escalated to a planned resurfacing schedule."
            )
            
        if has_alligator:
            return (
                "Alligator cracks indicate structural fatigue of the road base or subgrade. Sealing is not sufficient; this area "
                "requires local reconstruction or deep patching in the next scheduled rehabilitation cycle. Monitor closely as alligator "
                "cracking is the primary precursor to pothole formation."
            )
            
        if has_longitudinal:
            return (
                "Longitudinal cracks run parallel to the centerline, typically caused by joint failure, thermal contraction, or edge settlement. "
                "These should be treated with routine crack-sealing within 30 days to prevent water infiltration into the subgrade."
            )
            
        if has_transverse:
            return (
                "Transverse cracks run perpendicular to the centerline, often caused by thermal contraction. These can be treated in routine "
                "maintenance via rout-and-seal methods during mild weather, but must be addressed before winter to avoid freeze-thaw escalation."
            )
            
        return (
            f"Fissures and structural cracks (including {self.damage_type.lower()}) can be managed in routine maintenance programs, but "
            "any pothole formation demands urgent intervention. Scheduled sealing will prevent crack propagation."
        )

    class Config:
        from_attributes = True


class VideoReportOut(BaseModel):
    id: int
    video_url: str
    filename: str
    duration_seconds: Optional[float] = None
    frames_scanned: int
    damage_frames: int
    worst_severity: str
    peak_confidence: float
    timeline_data: Optional[str] = None
    best_frame_url: Optional[str] = None
    best_frame_annotated_url: Optional[str] = None
    created_at: datetime

    @field_validator('created_at')
    @classmethod
    def ensure_utc(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    @computed_field
    @property
    def advisory_note(self) -> str:
        if self.worst_severity == "None":
            return (
                "Road surface analyzed via video is structurally sound. Continue routine scans. "
                "Preventative scans every 60 days are advised to maintain road network longevity."
            )
            
        types = set()
        if self.timeline_data:
            try:
                timeline = json.loads(self.timeline_data)
                for frame in timeline:
                    for issue in frame.get("detected_issues", []):
                        if issue.get("type"):
                            types.add(issue["type"])
            except Exception:
                pass
                
        has_pothole = "Pothole" in types or self.worst_severity == "High"
        has_alligator = "Alligator Cracks" in types
        has_longitudinal = "Longitudinal Cracks" in types
        has_transverse = "Transverse Cracks" in types
        
        if has_pothole and (has_alligator or has_longitudinal or has_transverse):
            return (
                "Urgent combined distress detected in video segment. The presence of cracks alongside active potholes indicates advanced surface failure. "
                "The pothole must be treated as an immediate emergency fix, while the surrounding cracks should be scheduled for sealing to prevent secondary potholes."
            )
        if has_pothole:
            return (
                "Potholes detected in video segment pose immediate, high-severity hazard risks to traffic. Emergency patching must be executed "
                "within 48 hours, whereas linear cracks can be monitored and batched in regular seasonal maintenance cycles."
            )
        if has_alligator and (has_longitudinal or has_transverse):
            return (
                "Mixed cracking detected in video segment. The combination of longitudinal/transverse joints with alligator fatigue cracks "
                "indicates deteriorating subgrade. Routine patching should be escalated to a planned resurfacing schedule."
            )
        if has_alligator:
            return (
                "Alligator cracks detected indicate structural fatigue of the base or subgrade. Sealing is insufficient; this segment requires "
                "local reconstruction or deep patching in the next scheduled rehabilitation cycle."
            )
        if has_longitudinal or has_transverse:
            return (
                "Linear cracking (longitudinal/transverse) detected. These can be treated in routine maintenance via rout-and-seal "
                "methods during mild weather to prevent water infiltration and subgrade erosion."
            )
            
        return "Video analysis suggests minor superficial defects. Schedule routine maintenance inspections to track development."

    class Config:
        from_attributes = True