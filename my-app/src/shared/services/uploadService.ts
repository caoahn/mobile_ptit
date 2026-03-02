import apiClient from "./api/client";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}

export interface UploadResponse {
  success: boolean;
  data: UploadResult;
  message: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  data: UploadResult[];
  message: string;
}

/**
 * Upload single image to Cloudinary
 * @param uri - Local image URI
 * @param folder - Cloudinary folder (default: "recipes")
 * @returns Upload result with URL and public ID
 */
export const uploadImage = async (
  uri: string,
  folder: string = "recipes",
): Promise<UploadResult> => {
  const formData = new FormData();

  // Get file extension from URI
  const uriParts = uri.split(".");
  const fileType = uriParts[uriParts.length - 1];

  // Create file object for upload
  const file: any = {
    uri,
    type: `image/${fileType}`,
    name: `photo.${fileType}`,
  };

  formData.append("image", file);
  formData.append("folder", folder);

  const response = await apiClient.post<UploadResponse>(
    "/upload/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 seconds for upload
    },
  );

  return response.data.data;
};

/**
 * Upload multiple images to Cloudinary
 * @param uris - Array of local image URIs
 * @param folder - Cloudinary folder (default: "recipes")
 * @returns Array of upload results
 */
export const uploadMultipleImages = async (
  uris: string[],
  folder: string = "recipes",
): Promise<UploadResult[]> => {
  const formData = new FormData();

  uris.forEach((uri, index) => {
    const uriParts = uri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    const file: any = {
      uri,
      type: `image/${fileType}`,
      name: `photo_${index}.${fileType}`,
    };

    formData.append("images", file);
  });

  formData.append("folder", folder);

  const response = await apiClient.post<MultipleUploadResponse>(
    "/upload/images",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for multiple uploads
    },
  );

  return response.data.data;
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  const encodedPublicId = encodeURIComponent(publicId);
  await apiClient.delete(`/upload/image/${encodedPublicId}`);
};
