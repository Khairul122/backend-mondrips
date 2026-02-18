import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_DIR = path.resolve(__dirname, '../../public/uploads/sliders');
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

export interface UploadedFile {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  size: number;
}

export const ensureUploadDir = (): void => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

export const generateUniqueFilename = (originalName: string): string => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}${ext}`;
};

export const validateFile = (file: UploadedFile): void => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
    throw new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the maximum limit of 2MB.');
  }
};

export const saveFile = (buffer: Buffer, filename: string): string => {
  ensureUploadDir();
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return `public/uploads/sliders/${filename}`;
};

export const deleteFile = (imagePath: string): void => {
  if (!imagePath) {
    return;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const fullPath = path.resolve(__dirname, '../../', imagePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

export const getRelativePath = (filename: string): string => {
  return `public/uploads/sliders/${filename}`;
};
