import torch
import requests
from PIL import Image
from pathlib import Path
from transformers import CLIPProcessor, CLIPModel
import torch.nn.functional as F

from core.log import logger
from core.config import Config
from services.image_service import download_image_from_url, cleanup_temp_file

# Load configuration
config = Config()

# ==================== CUSTOM EXCEPTIONS ====================

class ModelNotFoundException(Exception):
    """Exception raised when VLM model file is not found."""
    pass

class InferenceException(Exception):
    """Exception raised when inference fails."""
    pass

class InvalidImageException(Exception):
    """Exception raised when image file is invalid."""
    pass

# Global instance of VLM embedding model
_model_instance = None
def get_embedding_model():
    global _model_instance
    if _model_instance is None:
        logger.info("Creating new VLM embedding model instance (singleton)")
        _model_instance = VLMEmbeddingModel()
        _model_instance.load_model()
        logger.info("VLM instance created and model loaded")
    else:
        logger.debug("Reusing existing VLM embedding model instance")
    return _model_instance

# ==================== VLM EMBEDDING MODEL ====================

class VLMEmbeddingModel:
    def __init__(self):
        self.model_name = config.VLM_MODEL_NAME
        self.alpha = config.VLM_ALPHA
        self.temp_dir = Path(config.TEMP_DIR)

        # Create temp directory if not exists
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def load_model(self):
        """
        Load VLM model from the specified path.
        """
        if not self.model_name:
            logger.error("Model name is not specified in the configuration.")
            raise ModelNotFoundException("Model name is required.")

        try:
            self.model = CLIPModel.from_pretrained(self.model_name)
            self.processor = CLIPProcessor.from_pretrained(self.model_name)

            logger.info(f"VLM model loaded successfully from: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to load VLM model: {e}")
            raise ModelNotFoundException(f"Failed to load VLM model: {e}")
        
    def extract_image_features(self, image_path: str):
        """
        Extract image features from the given image path.
        """
        try:
            image = Image.open(image_path)
            inputs = self.processor(images=image, return_tensors="pt")

            with torch.no_grad():
                output = self.model.get_image_features(**inputs)
                image_features = output.pooler_output
                logger.debug(f"Extracted image features: {image_features}")
            return image_features
        except Exception as e:
            logger.error(f"Failed to extract image features: {e}")
            raise InferenceException(f"Failed to extract image features: {e}")
        
    def extract_text_features(self, text_list):
        """
        Extract text features from the given list of texts.
        """
        try:
            if text_list is None:
                raise ValueError("text_list cannot be None for text feature extraction")
            
            inputs = self.processor(text=text_list, return_tensors="pt", padding=True, truncation=True)

            with torch.no_grad():
                output = self.model.get_text_features(**inputs)
                text_features = output.pooler_output
            return text_features
        except Exception as e:
            logger.error(f"Failed to extract text features: {e}")
            raise InferenceException(f"Failed to extract text features: {e}")    
        
    def extract_features(self, image_url, text_list):
        """
        Extract both image and text features from the given image URL and list of texts.
        """
        try:
            image_features = self.extract_image_features(image_url)
            image_features_norm = F.normalize(image_features, dim=-1)
            text_features = self.extract_text_features(text_list)
            text_features_norm = F.normalize(text_features, dim=-1)
            final_features = self.alpha * image_features_norm + (1 - self.alpha) * text_features_norm
            return final_features
        except Exception as e:
            logger.error(f"Failed to extract features: {e}")
            raise InferenceException(f"Failed to extract features: {e}")

# ==================== HELPER FUNCTIONS ====================