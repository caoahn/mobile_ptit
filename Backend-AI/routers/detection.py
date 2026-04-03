from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from celery import Celery

from core.config import Config
from core.log import logger
from core.schemas import (
    DetectionRequest,
    DetectionResponse,
    DetectionResult,
    JobSubmitResponse
)
from services.image_service import (
    save_upload_file,
    cleanup_temp_file,
    InvalidImageException,
    FileUploadException
)
from services.yolo_service import get_detector
from services.redis_service import get_celery_app
from services.tasks import process_detection

# Load configuration
config = Config()

# Create router
router = APIRouter(prefix="/detect", tags=["Detection"])

# DEFINE EN->VN
en_to_vi = {
    "Akabare Khursani": "Ớt anh đào đỏ",
    "Apple": "Táo",
    "Artichoke": "Atisô",
    "Ash Gourd -Kubhindo-": "Bí đao",
    "Asparagus -Kurilo-": "Măng tây",
    "Avocado": "Bơ",
    "Bacon": "Thịt xông khói",
    "Bamboo Shoots -Tama-": "Măng chua",
    "Banana": "Chuối",
    "Beans": "Đậu",
    "Beaten Rice -Chiura-": "Gạo cán dẹt",
    "Beef": "Thịt bò",
    "Beetroot": "Củ dền",
    "Bethu ko Saag": "Rau muối",
    "Bitter Gourd": "Mướp đắng",
    "Black Lentils": "Đậu lăng đen",
    "Black beans": "Đậu đen",
    "Bottle Gourd -Lauka-": "Bầu",
    "Bread": "Bánh mì",
    "Brinjal": "Cà tím",
    "Broad Beans -Bakullo-": "Đậu tằm",
    "Broccoli": "Súp lơ xanh",
    "Buff Meat": "Thịt trâu",
    "Butter": "Bơ",
    "Cabbage": "Bắp cải",
    "Capsicum": "Ớt chuông",
    "Carrot": "Cà rốt",
    "Cassava -Ghar Tarul-": "Sắn",
    "Cauliflower": "Súp lơ trắng",
    "Chayote-iskus-": "Su su",
    "Cheese": "Phô mai",
    "Chicken": "Thịt gà",
    "Chicken Gizzards": "Mề gà",
    "Chickpeas": "Đậu gà",
    "Chili Pepper -Khursani-": "Ớt tươi",
    "Chili Powder": "Ớt bột",
    "Chowmein Noodles": "Mì xào",
    "Cinnamon": "Quế",
    "Coriander -Dhaniya-": "Rau mùi",
    "Corn": "Ngô",
    "Cornflakec": "Ngũ cốc ngô",
    "Crab Meat": "Thịt cua",
    "Cucumber": "Dưa chuột",
    "Egg": "Trứng",
    "Farsi ko Munta": "Rau bí",
    "Fiddlehead Ferns -Niguro-": "Dương sỉ non",
    "Fish": "Cá",
    "Garden Peas": "Đậu Hà Lan",
    "Garden cress-Chamsur ko saag-": "Cải xoong",
    "Garlic": "Tỏi",
    "Ginger": "Gừng",
    "Green Brinjal": "Cà tím xanh",
    "Green Lentils": "Đậu lăng xanh",
    "Green Mint -Pudina-": "Bạc hà",
    "Green Peas": "Đậu Hà Lan xanh",
    "Green Soyabean -Hariyo Bhatmas-": "Đậu nành tươi",
    "Gundruk": "Rau lá xanh lên men",
    "Ham": "Thịt nguội",
    "Ice": "Đá lạnh",
    "Jack Fruit": "Mít",
    "Ketchup": "Tương cà",
    "Lapsi -Nepali Hog Plum-": "Sấu",
    "Lemon -Nimbu-": "Chanh",
    "Lime -Kagati-": "Chanh",
    "Long Beans -Bodi-": "Đậu đũa",
    "Masyaura": "Viên đậu nành lên men phơi khô",
    "Milk": "Sữa",
    "Minced Meat": "Thịt xay",
    "Moringa Leaves -Sajyun ko Munta-": "Lá chùm ngây",
    "Mushroom": "Nấm",
    "Mutton": "Thịt cừu",
    "Nutrela -Soya Chunks-": "Đạm đậu nành",
    "Okra -Bhindi-": "Đậu bắp",
    "Olive Oil": "Dầu ô liu",
    "Onion": "Hành tây",
    "Onion Leaves": "Hành lá",
    "Orange": "Cam",
    "Palak -Indian Spinach-": "Cải bó xôi",
    "Palungo -Nepali Spinach-": "Rau chân vịt",
    "Paneer": "Phô mai kiểu Ấn",
    "Papaya": "Đu đủ",
    "Pea": "Đậu hạt",
    "Pear": "Lê",
    "Pointed Gourd -Chuche Karela-": "Bầu nhọn",
    "Pork": "Thịt lợn",
    "Potato": "Khoai tây",
    "Pumpkin -Farsi-": "Bí ngô",
    "Radish": "Củ cải",
    "Rahar ko Daal": "Đậu triều",
    "Rayo ko Saag": "Cải cay",
    "Red Beans": "Đậu đỏ",
    "Red Lentils": "Đậu lăng đỏ",
    "Rice -Chamal-": "Gạo",
    "Sajjyun -Moringa Drumsticks-": "Quả chùm ngây",
    "Salt": "Muối",
    "Sausage": "Xúc xích",
    "Snake Gourd -Chichindo-": "Bầu rắn",
    "Soy Sauce": "Nước tương",
    "Soyabean -Bhatmas-": "Đậu nành",
    "Sponge Gourd -Ghiraula-": "Mướp hương",
    "Stinging Nettle -Sisnu-": "Cây tầm ma",
    "Strawberry": "Dâu tây",
    "Sugar": "Đường",
    "Sweet Potato -Suthuni-": "Khoai lang",
    "Taro Leaves -Karkalo-": "Dọc mùng",
    "Taro Root-Pidalu-": "Củ khoai môn",
    "Thukpa Noodles": "Mì Thukpa",
    "Tofu": "Đậu phụ",
    "Tomato": "Cà chua",
    "Tori ko Saag": "Rau cải dầu",
    "Tree Tomato -Rukh Tamatar-": "Cà chua thân gỗ",
    "Turnip": "Củ cải tròn",
    "Wallnut": "Quả óc chó",
    "Water Melon": "Dưa hấu",
    "Wheat": "Lúa mì",
    "Yellow Lentils": "Đậu lăng vàng",
    "kimchi": "Kimchi",
    "mayonnaise": "Xốt Mayonnaise",
    "noodle": "Mì",
    "Bean sprouts": "Giá đỗ",
    "seaweed": "Rong biển",
    "Black pepper" : "Tiêu", 
    "Cherry" : "Quả anh đào", 
    "Coconut" : "Dừa", 
    "Dried pasta" : "Mì pasta", 
    "Grape" : "Nho", 
    "Lettuce" : "Xà lách", 
    "Mango" : "Xoài", 
    "Peeled shrimp" : "Tôm bóc vỏ", 
    "Pineapple" : "Dứa", 
    "Rosemary" : "Hương thảo", 
    "Star anise" : "Hồi", 
    "Turmeric powder" : "Bột nghệ"
}
# ==================== ENDPOINTS ====================

@router.post("/upload", response_model=DetectionResponse)
async def detect_upload(
    file: UploadFile = File(..., description="Image file to detect objects")
):
    """
    Detect objects in uploaded image file.

    Args:
        file: Uploaded image file (form-data)

    Returns:
        DetectionResponse: Detection results with list of detected objects
    """
    temp_file_path = None

    try:
        logger.info(f"Received file upload: {file.filename}")

        # Validate file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning

        if file_size > config.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {config.MAX_FILE_SIZE / (1024*1024)}MB"
            )

        # Save uploaded file to temp directory
        temp_file_path = save_upload_file(file)
        logger.info(f"File saved to: {temp_file_path}")

        detector = get_detector()
        detection_results = detector.detect(str(temp_file_path))

        # Convert to response format
        results_list = [
            DetectionResult(
                class_name=en_to_vi.get(result.class_name, result.class_name),
                confidence=result.confidence,
                bounding_box=result.bounding_box
            )
            for result in detection_results
        ]

        logger.info(f"Detection completed. Found {len(results_list)} objects")

        return DetectionResponse(
            success=True,
            results=results_list,
            error=None
        )

    except InvalidImageException as e:
        logger.error(f"Invalid image: {e}")
        return DetectionResponse(
            success=False,
            results=[],
            error=str(e)
        )
    except FileUploadException as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in detect_upload: {e}")
        return DetectionResponse(
            success=False,
            results=[],
            error=f"Detection failed: {str(e)}"
        )
    finally:
        # Cleanup temporary file
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

# ==================== ASYNC ENDPOINTS ====================

@router.post("/url", response_model=JobSubmitResponse, status_code=202)
async def detect_url_async(
    request: DetectionRequest,
    celery: Celery = Depends(get_celery_app)
):
    """
    Submit detection job asynchronously (non-blocking).
    Returns job_id immediately for status checking.

    Args:
        request: DetectionRequest with image_url
        celery: Celery app instance (injected)

    Returns:
        JobSubmitResponse: Job ID and status
    """
    try:
        logger.info(f"[Async] Received detection request for URL: {request.image_url}")

        # Validate URL
        if not request.image_url:
            raise HTTPException(
                status_code=400,
                detail="image_url is required"
            )

        # Submit Celery task (non-blocking)
        task = celery.send_task(
            process_detection.name,
            args=[request.image_url],
            queue="detection_jobs",
            time_limit=config.CELERY_TASK_TIME_LIMIT,
            expires=config.CELERY_RESULT_EXPIRES,
        )

        logger.info(f"[Async] Job submitted with ID: {task.id}")

        return JobSubmitResponse(
            job_id=task.id,
            status="queued",
            message=f"Job submitted successfully. Use GET /job/status_detection/{task.id} to check progress."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Async] Failed to enqueue job: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit job: {str(e)}"
        )
