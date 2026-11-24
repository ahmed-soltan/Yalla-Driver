/**
 * File Upload Utilities
 * React Native / Expo compatible helpers
 */

import { FileMetadata, FileValidationResult } from '../types/file-types';
import { NativeFile } from '../ui/file-upload/file-uploader';

// ============================================
// File Size Constants
// ============================================

export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  document: 50 * 1024 * 1024,
  default: 100 * 1024 * 1024,
} as const;

// ============================================
// MIME Type Constants
// ============================================

export const ACCEPTED_MIME_TYPES = {
  image: 'image/*',
  video: 'video/*',
  document:
    'application/pdf,.doc,.docx,.txt,.xlsx,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf',
} as const;

export const NATIVE_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const;

export const NATIVE_IMAGE_MIME_TYPES = ['image/*'] as const;

export const NATIVE_VIDEO_MIME_TYPES = ['video/*'] as const;

// ============================================
// File Validation
// ============================================

export function validateFile(
  file: NativeFile,
  options: {
    maxSizeBytes?: number;
    accept?: string;
  }
): FileValidationResult {
  const { maxSizeBytes, accept } = options;

  if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `حجم الملف (${formatFileSize(
        file.size
      )}) أكبر من الحد الأقصى المسموح (${formatFileSize(maxSizeBytes)})`,
    };
  }

  if (accept && !isFileTypeAccepted(file, accept)) {
    return {
      valid: false,
      error: `نوع الملف غير مدعوم. الأنواع المدعومة: ${accept}`,
    };
  }

  return {
    valid: true,
  };
}

export function isFileTypeAccepted(file: NativeFile, accept: string): boolean {
  if (!accept || accept === '*/*') {
    return true;
  }

  const acceptedTypes = accept
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);

  const fileType = (file.mimeType || '').toLowerCase();

  const extension = getFileExtension(file.name);

  const fileExtension = extension ? `.${extension}` : '';

  return acceptedTypes.some((type) => {
    // image/*, video/*, etc.
    if (type.endsWith('/*')) {
      const category = type.slice(0, -2);

      return fileType.startsWith(`${category}/`);
    }

    // Exact MIME type
    if (type.includes('/')) {
      return fileType === type;
    }

    // Extension such as .pdf
    return fileExtension === type;
  });
}

// ============================================
// File Formatting
// ============================================

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) {
    return '0 بايت';
  }

  const units = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];

  const k = 1024;

  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    units.length - 1
  );

  const size = bytes / Math.pow(k, i);

  const formattedSize = Number.isInteger(size)
    ? size.toString()
    : size.toFixed(2);

  return `${formattedSize} ${units[i]}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// File Metadata
// ============================================

export function extractFileMetadata(file: NativeFile): FileMetadata {
  return {
    name: file.name,
    size: file.size,
    type: file.mimeType || 'application/octet-stream',
    lastModified: Date.now(),
  };
}

// ============================================
// Native File Helpers
// ============================================

/**
 * Returns the local URI of the file.
 *
 * React Native does not use URL.createObjectURL().
 */
export function createPreviewUrl(file: NativeFile): string {
  return file.uri;
}

/**
 * React Native does not create object URLs,
 * so there is nothing to revoke.
 */
export function revokePreviewUrl(_uri: string): void {
  // No-op
}

// ============================================
// File Type Helpers
// ============================================

export function isImageFile(file: NativeFile): boolean {
  return file.mimeType?.toLowerCase().startsWith('image/') ?? false;
}

export function isVideoFile(file: NativeFile): boolean {
  return file.mimeType?.toLowerCase().startsWith('video/') ?? false;
}

export function isDocumentFile(file: NativeFile): boolean {
  const mimeType = (file.mimeType || '').toLowerCase();

  const documentTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ]);

  if (documentTypes.has(mimeType)) {
    return true;
  }

  // Fallback to extension because
  // some Android document providers may
  // return an empty/incorrect MIME type.
  const extension = getFileExtension(file.name);

  return ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'pptx'].includes(extension);
}

export function getFileIconType(
  file: NativeFile
): 'image' | 'video' | 'document' | 'unknown' {
  if (isImageFile(file)) {
    return 'image';
  }

  if (isVideoFile(file)) {
    return 'video';
  }

  if (isDocumentFile(file)) {
    return 'document';
  }

  return 'unknown';
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');

  if (parts.length < 2) {
    return '';
  }

  return parts[parts.length - 1]?.toLowerCase() || '';
}

// ============================================
// Client File ID
// ============================================

export function generateClientFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
