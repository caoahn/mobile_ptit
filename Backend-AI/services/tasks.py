from typing import List

import numpy as np
import torch
from celery import shared_task

from core.log import logger
from services.VLM_service import get_embedding_model
from services.image_service import (
    download_image_from_url,
    cleanup_temp_file,
    InvalidImageException,
    FileUploadException,
)
from services.yolo_service import get_detector
from db.conn import get_db_connection

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

def _upsert_recipe_vector(recipe_id: int, embedding: List[float]) -> None:
    db_conn = get_db_connection()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO recipe_vector (recipe_id, embedding)
                VALUES (%s, %s)
                ON CONFLICT (recipe_id)
                DO UPDATE SET embedding = EXCLUDED.embedding
                """,
                (recipe_id, embedding),
            )
        db_conn.commit()
        logger.info(f"[Worker] Upserted recipe_vector for recipe_id={recipe_id}")
    except Exception:
        db_conn.rollback()
        raise
    finally:
        db_conn.close()

@shared_task(name="services.tasks.process_detection")
def process_detection(image_url: str) -> dict:
    """
    Celery task for object detection.
    This function avoids API-only dependencies so it is safe in worker processes.
    """
    logger.info(f"[Worker] Processing detection for URL: {image_url}")
    temp_file_path = None
    try:
        logger.info(f"[Worker] Starting detection for: {image_url}")
        temp_file_path = download_image_from_url(image_url)

        detector = get_detector()
        detection_results = detector.detect(str(temp_file_path))

        results_dict = [
            {
                "class_name": en_to_vi.get(result.class_name, result.class_name),
                "confidence": result.confidence,
                "bounding_box": {
                    "x": result.bounding_box.x,
                    "y": result.bounding_box.y,
                    "width": result.bounding_box.width,
                    "height": result.bounding_box.height,
                },
            }
            for result in detection_results
        ]

        logger.info(f"[Worker] Detection completed. Found {len(results_dict)} objects")
        return {"success": True, "results": results_dict}

    except InvalidImageException as e:
        error_msg = f"Image error: {str(e)}"
        logger.error(f"[Worker] {error_msg}")
        return {"success": False, "error": error_msg}
    except FileUploadException as e:
        error_msg = f"Upload error: {str(e)}"
        logger.error(f"[Worker] {error_msg}")
        return {"success": False, "error": error_msg}
    except Exception as e:
        error_msg = "Detection failed unexpectedly"
        logger.exception(f"[Worker] {error_msg}: {e}")
        return {"success": False, "error": error_msg}
    finally:
        if temp_file_path:
            cleanup_temp_file(temp_file_path)


@shared_task(name="services.tasks.process_image_embedding")
def process_image_embedding(image_url: str, text_list: List[str] = None) -> List[float]:
    """
    Celery task for image embedding.
    """
    temp_file_path = None

    try:
        logger.info(f"[Worker] Starting embedding for: {image_url}")
        temp_file_path = download_image_from_url(image_url)

        embedding_model = get_embedding_model()

        with torch.no_grad():
            logger.debug(f"Extracting features for image: {image_url} with text_list: {text_list}")
            features = embedding_model.extract_features(temp_file_path, text_list)

        embedding = features.detach().cpu().numpy().astype(np.float32)[0]

        logger.info(f"[Worker] Embedding completed for: {image_url}")
        return embedding.tolist()

    except InvalidImageException as e:
        logger.error(f"[Worker] Invalid image: {e}")
        raise
    except Exception as e:
        logger.exception(f"[Worker] Embedding failed for {image_url}: {e}")
        raise
    finally:
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

@shared_task(name="services.tasks.process_post_embedding")
def process_post_embedding(post_id: int, list_image_url: List[str], text_list: List[str] = None) -> List[float]:
    """
    Celery task for image embedding.
    """
    temp_file_path = None

    try:
        logger.info(f"[Worker] Starting embedding for post {post_id}")
        embedding_list = []
        for image_url in list_image_url:
            temp_file_path = download_image_from_url(image_url)

            embedding_model = get_embedding_model()

            with torch.no_grad():
                logger.debug(f"Extracting features for image: {image_url} with text_list: {text_list}")
                features = embedding_model.extract_features(temp_file_path, text_list)

            embedding = features.detach().cpu().numpy().astype(np.float32)[0]
            embedding_list.append(embedding)


        final_embedding = np.mean(embedding_list, axis=0)
        embedding_final = final_embedding.tolist()
        recipe_id = post_id
        _upsert_recipe_vector(recipe_id=recipe_id, embedding=embedding_final)

        logger.info(f"[Worker] Embedding completed and stored for recipe_id={recipe_id}")
        return embedding_final

    except InvalidImageException as e:
        logger.error(f"[Worker] Invalid image: {e}")
        raise
    except Exception as e:
        logger.exception(f"[Worker] Embedding failed for post {post_id}: {e}")
        raise
    finally:
        if temp_file_path:
            cleanup_temp_file(temp_file_path)