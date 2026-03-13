from pathlib import Path
from urllib.parse import urlparse
import requests
import uuid
import shutil
from typing import List
from fastapi import UploadFile
from core.config import Config
from core.log import logger

# Load configuration
config = Config()

# ==================== CUSTOM EXCEPTIONS ====================

class InvalidImageException(Exception):
    """Exception raised when image file is invalid."""
    pass

class FileUploadException(Exception):
    """Exception raised when file upload fails."""
    pass

# ==================== HELPER FUNCTIONS ====================

def validate_file_extension(filename: str, allowed_extensions: List[str] = None) -> bool:
    """
    Validate if file has allowed extension.
    Args:
        filename (str): Name of the file to validate
        allowed_extensions (List[str]): List of allowed extensions (default from config)
    Returns:
        bool: True if valid, False otherwise
    """
    if allowed_extensions is None:
        allowed_extensions = config.ALLOWED_EXTENSIONS
    
    file_path = Path(filename)
    extension = file_path.suffix.lower()
    
    is_valid = extension in allowed_extensions
    
    if not is_valid:
        logger.warning(f"Invalid file extension: {extension}. Allowed: {allowed_extensions}")
    
    return is_valid

def save_upload_file(upload_file: UploadFile) -> Path:
    """
    Save uploaded file to temp directory.
    Args:
        upload_file (UploadFile): FastAPI UploadFile object
    Returns:
        Path: Path to the saved file
    """
    try:
        # Validate file extension
        if not validate_file_extension(upload_file.filename):
            raise InvalidImageException(
                f"Invalid file extension. Allowed: {config.ALLOWED_EXTENSIONS}"
            )
        
        # Create temp directory if not exists
        temp_dir = Path(config.TEMP_DIR)
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(upload_file.filename).suffix
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = temp_dir / filename
        
        # Save file to temp directory
        with open(file_path, 'wb') as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        logger.info(f"File uploaded successfully: {file_path}")
        return file_path
        
    except InvalidImageException:
        raise
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise FileUploadException(f"Failed to save uploaded file: {e}")
    finally:
        # Close the upload file
        upload_file.file.close()

def download_image_from_url(image_url: str) -> Path:
    """
    Download image from URL to temp directory.
    Args:
        image_url (str): URL of the image to download.
    Returns:
        Path: Path to the downloaded image file.
    """
    try:
        # Validate URL format
        parsed = urlparse(image_url)
        if not parsed.scheme or not parsed.netloc:
            raise InvalidImageException(f"Invalid image URL: {image_url}")
        if parsed.scheme not in ('http', 'https'):
            raise InvalidImageException(f"Unsupported URL scheme: {parsed.scheme}. Only http/https allowed.")

        logger.info(f"Downloading image from: {image_url}")
        
        # Create temp directory if not exists
        temp_dir = Path(config.TEMP_DIR)
        temp_dir.mkdir(parents=True, exist_ok=True)

        # Send GET request to download the image
        response = requests.get(image_url, stream=True, timeout=30)
        response.raise_for_status()  # Raise an error for bad status codes

        # Get file extension from URL or Content-Type
        content_type = response.headers.get('Content-Type', '')
        if 'image/jpeg' in content_type or 'image/jpg' in content_type:
            extension = '.jpg'
        elif 'image/png' in content_type:
            extension = '.png'
        elif 'image/webp' in content_type:
            extension = '.webp'
        elif 'image/bmp' in content_type:
            extension = '.bmp'
        else:
            # Try to get extension from URL
            url_path = Path(image_url)
            extension = url_path.suffix if url_path.suffix else '.jpg'
        
        # Validate extension
        if not validate_file_extension(f"temp{extension}"):
            raise InvalidImageException(
                f"Invalid image format: {extension}. Allowed: {config.ALLOWED_EXTENSIONS}"
            )
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}{extension}"
        file_path = temp_dir / filename

        # Save image to temp directory
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logger.info(f"Image downloaded successfully: {file_path}")
        return file_path
        
    except InvalidImageException:
        raise
    except requests.exceptions.Timeout:
        logger.error(f"Timeout while downloading image from: {image_url}")
        raise InvalidImageException("Image download timeout")
    except requests.exceptions.ConnectionError:
        logger.error(f"Cannot connect to: {image_url}")
        raise InvalidImageException(f"Cannot connect to the provided URL: {image_url}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to download image: {e}")
        raise InvalidImageException(f"Failed to download image: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during image download: {e}")
        raise InvalidImageException(f"Image download failed: {e}")

def cleanup_temp_file(file_path: Path) -> bool:
    """
    Remove temporary file after processing.
    Args:
        file_path (Path): Path to the temporary file to remove.
    Returns:
        bool: True if file was removed successfully, False otherwise
    """
    try:
        if file_path and Path(file_path).exists():
            Path(file_path).unlink()
            logger.info(f"Temporary file removed: {file_path}")
            return True
        else:
            logger.info(f"File does not exist or path is None: {file_path}")
            return False
    except Exception as e:
        logger.warning(f"Failed to remove temporary file {file_path}: {e}")
        return False