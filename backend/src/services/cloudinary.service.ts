import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import fs from "fs";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}

export class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param filePath - Local file path
   * @param folder - Cloudinary folder name
   * @returns Upload result with URL and public ID
   */
  async uploadImage(
    filePath: string,
    folder: string = "recipes",
  ): Promise<UploadResult> {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        filePath,
        {
          folder: folder,
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
      );

      // Delete local file after upload
      this.deleteLocalFile(filePath);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
      };
    } catch (error: any) {
      // Delete local file on error
      this.deleteLocalFile(filePath);

      // Log detailed error
      console.error("Cloudinary Upload Error:", {
        message: error.message,
        error: error.error || error,
        http_code: error.http_code,
        filePath: filePath,
      });

      throw new Error(
        `Failed to upload image: ${error.message || JSON.stringify(error)}`,
      );
    }
  }

  /**
   * Upload multiple images
   * @param filePaths - Array of local file paths
   * @param folder - Cloudinary folder name
   * @returns Array of upload results
   */
  async uploadMultipleImages(
    filePaths: string[],
    folder: string = "recipes",
  ): Promise<UploadResult[]> {
    const uploadPromises = filePaths.map((filePath) =>
      this.uploadImage(filePath, folder),
    );
    return await Promise.all(uploadPromises);
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Cloudinary public ID
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      console.error("Cloudinary Delete Error:", {
        message: error.message,
        error: error.error || error,
        publicId: publicId,
      });
      throw new Error(
        `Failed to delete image: ${error.message || JSON.stringify(error)}`,
      );
    }
  }

  /**
   * Delete multiple images from Cloudinary
   * @param publicIds - Array of Cloudinary public IDs
   */
  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error: any) {
      console.error("Cloudinary Delete Multiple Error:", {
        message: error.message,
        error: error.error || error,
        publicIds: publicIds,
      });
      throw new Error(
        `Failed to delete images: ${error.message || JSON.stringify(error)}`,
      );
    }
  }

  /**
   * Delete local file
   * @param filePath - Local file path
   */
  private deleteLocalFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete local file: ${error}`);
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param publicId - Cloudinary public ID
   * @param width - Image width
   * @param height - Image height
   * @returns Transformed image URL
   */
  getOptimizedUrl(publicId: string, width?: number, height?: number): string {
    return cloudinary.url(publicId, {
      width: width,
      height: height,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    });
  }
}
