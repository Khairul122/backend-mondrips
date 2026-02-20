import { R2Bucket } from '@cloudflare/workers-types';

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

export interface UploadedFile {
  arrayBuffer: ArrayBuffer;
  mimeType: string;
  originalName: string;
  size: number;
}

export const generateUniqueFilename = (originalName: string): string => {
  const ext = originalName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}.${ext}`;
};

export const validateFile = (file: UploadedFile): void => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
    throw new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the maximum limit of 2MB.');
  }
};

export const saveFile = async (bucket: R2Bucket, arrayBuffer: ArrayBuffer, filename: string): Promise<string> => {
  await bucket.put(filename, arrayBuffer);
  return filename;
};

export const getFile = async (bucket: R2Bucket, filename: string): Promise<R2ObjectBody | null> => {
  const object = await bucket.get(filename);
  return object;
};

export const deleteFile = async (bucket: R2Bucket, filename: string): Promise<void> => {
  if (!filename) {
    return;
  }
  await bucket.delete(filename);
};

export const getFileUrl = (filename: string, baseUrl: string = ''): string => {
  return `${baseUrl}/uploads/sliders/${filename}`;
};
