from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# =======================================
# REQUEST SCHEMAS
# =======================================

class DetectionRequest(BaseModel):
    """
    Schema cho request gửi đến endpoint /detect
    """
    image_url: str = Field(..., description="URL của ảnh cần phát hiện")

class EmbeddingRequest(BaseModel):
    """
    Schema cho request gửi đến endpoint /embedding
    """
    image_url: str = Field(..., description="URL của ảnh cần embedding")
    text_list: Optional[List[str]] = Field(None, description="Danh sách văn bản để kết hợp embedding (nếu có)")

# ======================================
# REQUEST POST EMBEDDING SCHEMAS
# ======================================

class PostRequest(BaseModel):
    """
    Schema cho request gửi đến endpoint /recommend
    """
    post_id: int = Field(..., description="ID của bài đăng cần đề xuất")
    image_url: str = Field(..., description="URL của ảnh trong bài đăng")
    text: Optional[str] = Field(None, description="Nội dung văn bản của bài đăng (nếu có)")


# ======================================
# REQUEST RECOMMENDATION SCHEMAS
# ======================================
class interactionsRequest(BaseModel):
    item_id: int = Field(..., description="ID của item")
    event: str = Field(..., description="Loại sự kiện (share, save, like, dwell_10s, click, skip)")

class UserProfileRequest(BaseModel):
    user_id: int = Field(..., description="ID của user")
    interactions: List[interactionsRequest] = Field(..., description="Danh sách tương tác của user với các item")
class UpdateBatchUser(BaseModel):
    """
    Schema cho request cập nhật batch user
    """
    users: List[UserProfileRequest] = Field(..., description="Danh sách user và tương tác của họ")

# =======================================
# RESPONSE RECOMMENDATION SCHEMAS
# =======================================

class RecommendationItem(BaseModel):
    item_id: int = Field(..., description="ID của item được đề xuất")
    score: float = Field(..., description="Điểm số đề xuất (độ liên quan)")

class RecommendationUser(BaseModel):
    user_id: int = Field(..., description="ID của user")
    recommendations: List[RecommendationItem] = Field(..., description="Danh sách các item được đề xuất")

class RecommendationResponse(BaseModel):
    success: bool = Field(..., description="Trạng thái thành công của yêu cầu")
    recommendations: List[RecommendationUser] = Field(..., description="Danh sách các user và item được đề xuất cho họ")
    error: Optional[str] = Field(None, description="Thông tin lỗi nếu có")

# =======================================
# RESPONSE DETECT SCHEMAS
# =======================================

class BoundingBox(BaseModel):
    """
    Schema cho bounding box của đối tượng được phát hiện
    """
    x: int = Field(..., description="Tọa độ x của góc trên bên trái")
    y: int = Field(..., description="Tọa độ y của góc trên bên trái")
    width: int = Field(..., description="Chiều rộng của bounding box")
    height: int = Field(..., description="Chiều cao của bounding box")

class DetectionResult(BaseModel):
    """
    Schema cho kết quả phát hiện của một đối tượng
    """
    class_name: str = Field(..., description="Tên lớp đối tượng được phát hiện")
    confidence: float = Field(..., description="Độ tin cậy của phát hiện")
    bounding_box: BoundingBox = Field(..., description="Thông tin bounding box của đối tượng")

class DetectionResponse(BaseModel):
    """
    Response schema cho endpoint /detect
    """
    success: bool = Field(..., description="Trạng thái thành công của yêu cầu")
    results: List[DetectionResult] = Field(..., description="Danh sách các đối tượng được phát hiện")
    error: Optional[str] = Field(None, description="Thông tin lỗi nếu có")

class CheckHealthResponse(BaseModel):
    """
    Response schema cho endpoint /health
    """
    status: str = Field(..., description="Trạng thái của ứng dụng")
    model_loaded: bool = Field(..., description="Thông tin về việc model đã được tải hay chưa")
    redis_connected: bool = Field(..., description="Thông tin về kết nối Redis")

# =======================================
# RESPONSE EMBEDDING SCHEMAS
# =======================================

class EmbeddingResponse(BaseModel):
    """
    Response schema cho endpoint /embedding
    """
    success: bool = Field(..., description="Trạng thái thành công của yêu cầu")
    embedding: Optional[List[float]] = Field(None, description="Vector embedding của ảnh")
    error: Optional[str] = Field(None, description="Thông tin lỗi nếu có")

# =======================================
# ASYNC JOB SCHEMAS
# =======================================

class JobSubmitResponse(BaseModel):
    """
    Response schema khi submit job async
    """
    job_id: str = Field(..., description="ID của job để tracking")
    status: str = Field(..., description="Trạng thái hiện tại của job")
    message: str = Field(..., description="Thông báo cho user")

class JobDetectionStatusResponse(BaseModel):
    """
    Response schema cho job status check
    """
    job_id: str = Field(..., description="ID của job")
    status: str = Field(..., description="Trạng thái: queued, started, finished, failed")
    created_at: Optional[str] = Field(None, description="Thời gian tạo job")
    started_at: Optional[str] = Field(None, description="Thời gian bắt đầu xử lý")
    ended_at: Optional[str] = Field(None, description="Thời gian hoàn thành")
    result: Optional[List[DetectionResult]] = Field(None, description="Kết quả detection nếu đã xong")
    error: Optional[str] = Field(None, description="Thông tin lỗi nếu failed")

class JobEmbeddingStatusResponse(BaseModel):
    """
    Response schema cho job status check embedding
    """
    job_id: str = Field(..., description="ID của job")
    status: str = Field(..., description="Trạng thái: queued, started, finished, failed")
    created_at: Optional[str] = Field(None, description="Thời gian tạo job")
    started_at: Optional[str] = Field(None, description="Thời gian bắt đầu xử lý")
    ended_at: Optional[str] = Field(None, description="Thời gian hoàn thành")
    result: Optional[List[float]] = Field(None, description="Vector embedding nếu đã xong")
    error: Optional[str] = Field(None, description="Thông tin lỗi nếu failed")