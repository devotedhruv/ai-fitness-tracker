"""
Pydantic Schemas for AI/ML Computer Vision Pose Estimation Service
==================================================================
Supports real-time rep counting, state machine phase transitions,
angle rules validation, and biomechanical form analysis.
Compatible with MediaPipe Pose (33 landmarks) and YOLOv8/v11 Pose (17 landmarks).
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


class PoseKeypoint(BaseModel):
    name: str = Field(..., description="Keypoint identifier, e.g. LEFT_KNEE, RIGHT_HIP")
    x: float = Field(..., description="Normalized horizontal coordinate [0.0, 1.0]")
    y: float = Field(..., description="Normalized vertical coordinate [0.0, 1.0]")
    z: Optional[float] = Field(None, description="Estimated depth relative to mid-hip")
    visibility: float = Field(default=1.0, ge=0.0, le=1.0, description="Detection confidence score")


class AngleThreshold(BaseModel):
    min: Optional[float] = Field(None, description="Minimum allowable joint angle in degrees")
    max: Optional[float] = Field(None, description="Maximum allowable joint angle in degrees")


class JointAngleRule(BaseModel):
    down: Optional[AngleThreshold] = None
    up: Optional[AngleThreshold] = None
    inflection_bottom: Optional[AngleThreshold] = None
    lockout: Optional[AngleThreshold] = None
    custom_thresholds: Optional[Dict[str, AngleThreshold]] = None


class CommonMistakeDefinition(BaseModel):
    code: str = Field(..., description="Machine-readable code, e.g. knee_valgus")
    name: str = Field(..., description="Human-readable mistake name")
    penalty: float = Field(default=15.0, description="Deduction from 100.0 form score")


class ExerciseAIConfigSchema(BaseModel):
    exercise_id: UUID
    pose_detection_supported: bool = True
    rep_counting_supported: bool = True
    form_analysis_supported: bool = True
    required_keypoints: List[str] = Field(default_factory=list)
    optional_keypoints: List[str] = Field(default_factory=list)
    movement_phases: List[str] = Field(default=["start", "down", "up", "complete"])
    angle_rules: Dict[str, Any] = Field(default_factory=dict)
    distance_rules: Dict[str, Any] = Field(default_factory=dict)
    form_rules: Dict[str, Any] = Field(default_factory=dict)
    common_mistakes: List[CommonMistakeDefinition] = Field(default_factory=list)
    correction_messages: Dict[str, str] = Field(default_factory=dict)
    minimum_confidence: float = Field(default=0.65, ge=0.1, le=1.0)


class FrameAnalysisRequest(BaseModel):
    exercise_id: UUID
    session_id: Optional[UUID] = None
    timestamp_ms: int
    keypoints: List[PoseKeypoint]
    current_phase: Optional[str] = "start"
    current_rep: int = 0


class DetectedFormFault(BaseModel):
    code: str
    message: str
    severity: str = "warning"  # warning, critical, info
    confidence: float
    affected_joint: Optional[str] = None


class FrameAnalysisResponse(BaseModel):
    exercise_id: UUID
    rep_counted: bool = False
    current_rep: int
    next_phase: str
    current_joint_angles: Dict[str, float] = Field(default_factory=dict)
    detected_faults: List[DetectedFormFault] = Field(default_factory=list)
    instantaneous_form_score: float = 100.0
    audio_coaching_cue: Optional[str] = None


class RepAnalysisSessionSummary(BaseModel):
    id: UUID
    user_id: UUID
    exercise_id: UUID
    workout_id: Optional[UUID] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    total_reps: int
    correct_reps: int
    incorrect_reps: int
    average_form_score: float
    average_confidence: float
    calories_estimated: float
    feedback: Dict[str, Any] = Field(default_factory=dict)


class ExerciseInstructionStep(BaseModel):
    step: int
    text: str
    cue: Optional[str] = None


class ExerciseDetailSchema(BaseModel):
    id: UUID
    external_id: Optional[str] = None
    name: str
    slug: str
    description: Optional[str] = None
    category: Optional[str] = None
    body_part: Optional[str] = None
    equipment: Optional[str] = None
    target_muscle: Optional[str] = None
    secondary_muscles: List[str] = Field(default_factory=list)
    difficulty: str
    exercise_type: str
    instructions: List[str] = Field(default_factory=list)
    benefits: List[str] = Field(default_factory=list)
    precautions: List[str] = Field(default_factory=list)
    primary_media_url: Optional[str] = None
    ai_config: Optional[ExerciseAIConfigSchema] = None
