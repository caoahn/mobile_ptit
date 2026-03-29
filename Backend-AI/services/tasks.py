from typing import List

import numpy as np
import torch

from core.log import logger
from services.VLM_service import get_embedding_model
from services.image_service import (
    download_image_from_url,
    cleanup_temp_file,
    InvalidImageException,
    FileUploadException,
)
from services.yolo_service import get_detector


def process_detection(image_url: str) -> dict:
    """
    Worker task for object detection.
    This function is imported by RQ workers and should avoid API-only deps.
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
                "class_name": result.class_name,
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


def process_image_embedding(image_url: str, text_list: List[str] = None) -> List[float]:
    """
    Worker task for image embedding.
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
