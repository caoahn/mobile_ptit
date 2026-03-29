import ultralytics
from pathlib import Path
from typing import List
import requests
from core.config import Config
from core.log import logger
from core.schemas import DetectionResult, BoundingBox

# Load configuration
config = Config()

# ==================== CUSTOM EXCEPTIONS ====================

class ModelNotFoundException(Exception):
    """Exception raised when YOLO model file is not found."""
    pass

class InferenceException(Exception):
    """Exception raised when inference fails."""
    pass

class InvalidImageException(Exception):
    """Exception raised when image file is invalid."""
    pass

# Global instance of YOLO detector
_detector_instance = None
def get_detector():
    global _detector_instance
    if _detector_instance is None:
        logger.info("Creating new YoloDetector instance (singleton)")
        _detector_instance = YoloDetector()
        _detector_instance.load_model()
        logger.info("YoloDetector instance created and model loaded")
    else:
        logger.debug("Reusing existing YoloDetector instance")
    return _detector_instance

# ==================== YOLO DETECTOR ====================

class YoloDetector:
    def __init__(self):
        self.model_path = config.MODEL_PATH
        self.confidence_threshold = config.CONFIDENCE_THRESHOLD
        self.iou_threshold = config.IOU_THRESHOLD
        self.allowed_extensions = config.ALLOWED_EXTENSIONS
        self.temp_dir = Path(config.TEMP_DIR)

        # Create temp directory if not exists
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def load_model(self):
        """
        Load YOLO model from the specified path.
        """
        if not self.model_path:
            logger.error("Model path is not specified in the configuration.")
            raise ModelNotFoundException("Model path is required.")

        # # Check if model file exists
        # if not Path(self.model_path).exists():
        #     logger.error(f"Model file not found at: {self.model_path}")

        #     raise ModelNotFoundException(f"Model file not found at: {self.model_path}")

        try:
            model_file = Path(self.model_path)
            if model_file.exists():
                self.model = ultralytics.YOLO(str(model_file))
                logger.info(f"Loaded YOLO model from: {model_file}")
                return

            fallback_path = model_file.parent / "yolo11n.pt"
            if not fallback_path.exists():
                logger.warning(
                    f"Model file not found at: {self.model_path}. Downloading fallback model to: {fallback_path}"
                )
                self._download_default_model(fallback_path)

            self.model = ultralytics.YOLO(str(fallback_path))
            logger.warning(
                f"Model file not found at: {self.model_path}. Loaded fallback model from: {fallback_path}"
            )
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise ModelNotFoundException(f"Failed to load YOLO model: {e}")

    def _download_default_model(self, target_path: Path):
        """
        Download default YOLO model to a deterministic local path.
        """
        target_path.parent.mkdir(parents=True, exist_ok=True)
        url = "https://github.com/ultralytics/assets/releases/latest/download/yolo11n.pt"

        try:
            with requests.get(url, stream=True, timeout=120) as response:
                response.raise_for_status()
                with open(target_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=1024 * 1024):
                        if chunk:
                            f.write(chunk)
        except Exception:
            if target_path.exists():
                target_path.unlink()
            raise

    def detect(self, image_path: str) -> List[DetectionResult]:
        """
        Detect objects in the given image.
        Args:
            image_path (str): Path to the input image.
        Returns:
            List[DetectionResult]: List of detected objects with their confidence scores and bounding boxes.
        """
        # Validate image path
        if not image_path:
            logger.error("Image path is required for detection.")
            raise InvalidImageException("Image path is required.")

        image_file = Path(image_path)
        if not image_file.exists():
            logger.error(f"Image file not found: {image_path}")
            raise InvalidImageException(f"Image file not found: {image_path}")

        # Validate image format
        allowed_extensions = self.allowed_extensions
        if image_file.suffix.lower() not in allowed_extensions:
            logger.error(f"Invalid image format: {image_file.suffix}")
            raise InvalidImageException(f"Invalid image format. Allowed: {allowed_extensions}")

        # Check if model is loaded
        if not hasattr(self, 'model'):
            logger.error("Model is not loaded. Call load_model() before detection.")
            raise InferenceException("Model not loaded.")

        try:
            # Run inference
            results = self.model.predict(
                source=image_path,
                conf=self.confidence_threshold,
                iou=self.iou_threshold,
                verbose=False
            )

            # Parse results to DetectionResult
            detection_results = self._parse_results(results)
            logger.info(f"Detection completed. Found {len(detection_results)} objects.")
            return detection_results

        except Exception as e:
            logger.error(f"Error during detection: {e}")
            raise InferenceException(f"Detection failed: {e}")

    def _parse_results(self, results) -> List[DetectionResult]:
        """
        Parse YOLO results to DetectionResult schema.
        Args:
            results: YOLO prediction results
        Returns:
            List[DetectionResult]: Parsed detection results
        """
        detection_list = []

        # YOLO results[0] contains the first (and only) image result
        if len(results) > 0:
            result = results[0]
            boxes = result.boxes

            for box in boxes:
                # Get bounding box coordinates (xyxy format)
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                # Calculate width and height
                width = int(x2 - x1)
                height = int(y2 - y1)

                # Get class name and confidence
                class_id = int(box.cls[0])
                class_name = result.names[class_id]
                confidence = float(box.conf[0])

                # Create BoundingBox and DetectionResult
                bounding_box = BoundingBox(
                    x=int(x1),
                    y=int(y1),
                    width=width,
                    height=height
                )

                detection = DetectionResult(
                    class_name=class_name,
                    confidence=confidence,
                    bounding_box=bounding_box
                )

                detection_list.append(detection)

        return detection_list