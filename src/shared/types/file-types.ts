/**
 * File Upload System Types
 * Centralized type definitions for the upload system
 */

import { NativeFile } from '../ui/file-upload/file-uploader';

// ============================================
// Upload Status Types
// ============================================
export type UploadStatus = 'idle' | 'uploading' | 'ready' | 'failed';

// ============================================
// Processing Options Types
// ============================================

/**
 * Transcription options for speech-to-text processing
 */
export interface TranscriptOptions {
  enabled: boolean;
  language?: string;
}

/**
 * Embedding options for AI vector generation
 */
export interface EmbeddingOptions {
  enabled: boolean;
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Combined processing options for file uploads
 */
export interface FileProcessingOptions {
  /** Transcription/ASR options (for video/audio files) */
  transcript?: TranscriptOptions;
  /** AI embedding options for semantic search */
  embedding?: EmbeddingOptions;
  /** Enable text extraction for documents */
  extractText?: boolean;
}

// ============================================
// API Response Types
// ============================================

/**
 * Response from the streaming upload endpoint
 * Backend handles file upload to storage and returns this response
 */
export interface UploadResponse {
  /** Unique identifier for the uploaded file */
  fileId: string;
  /** MIME type determined by backend */
  fileType: string;
  /** CDN URL for accessing the file */
  url: string;
  /** Original file name */
  originalName: string;
  /** File size in bytes */
  size: number;
}

/**
 * Error response from upload endpoint
 */
export interface UploadErrorResponse {
  error: string;
}

// ============================================
// Component Props Types
// ============================================
export interface FileUploaderProps {
  /** Accepted file types (MIME types) */
  accept?: string;
  /** Maximum file size in bytes */
  maxSizeBytes?: number;
  /** Callback when upload completes successfully */
  onUploadComplete: (fileId: string, fileUrl: string, fileName: string) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback for upload progress updates */
  onProgress?: (progress: number) => void;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Custom label for the uploader */
  label?: string;
  /** Custom description text */
  description?: string;
  /** Custom className for styling */
  className?: string;
  /** Enable multiple file uploads */
  multiple?: boolean;
  /** Folder path for storage organization */
  folder?: string;
  /** Custom name for the file */
  name?: string;
  /** Embedding options for the file */
  embedding?: {
    enabled: boolean;
  };
  /** Predefined value for the uploader (e.g., existing file URL) */
  value?: string;
  /** Allow choosing between taking a photo and selecting one from the gallery */
  imageSource?: 'camera-and-gallery';

  onRemove?: () => void;
}

export interface VideoUploaderProps extends Omit<FileUploaderProps, 'accept' | 'embedding'> {
  enableEmbeddings?: boolean;
  embeddingContext?: {
    tenantId?: string;
    courseId?: string;
    moduleId?: string;
  };
}

export interface AudioUploaderProps extends Omit<FileUploaderProps, 'accept' | 'embedding'> {
  /** Enable automatic transcript generation (ASR) */
  enableTranscript?: boolean;
  /** Transcript language (ISO 639-1 code) */
  transcriptLanguage?: string;
  /** Enable speaker diarization */
  enableDiarization?: boolean;
  /** Enable AI embeddings for semantic search */
  enableEmbeddings?: boolean;
  /** Context IDs for embedding metadata */
  embeddingContext?: {
    tenantId?: string;
    courseId?: string;
    moduleId?: string;
  };
  /** Callback when transcript is ready */
  onTranscriptReady?: (transcript: string, vttUrl?: string) => void;
  /** Callback when embeddings are ready */
  onEmbeddingsReady?: (embeddingId: string) => void;
}

export type ImageUploaderVariant = 'dropzone' | 'avatar' | 'compact';

export interface ImageUploaderProps extends Omit<FileUploaderProps, 'accept' | 'embedding'> {
  /** Show crop interface after selection */
  enableCrop?: boolean;
  /** Target aspect ratio for cropping */
  aspectRatio?: number;
  /** Maximum dimensions (will resize if larger) */
  maxDimensions?: { width: number; height: number };
  /** Enable AI embeddings */
  enableEmbeddings?: boolean;
  /**
   * Visual variant of the uploader
   * - "dropzone": Large drag-and-drop area (default)
   * - "avatar": Circular avatar with overlay
   * - "compact": Small inline button with preview
   */
  variant?: ImageUploaderVariant;
  /**
   * Size for avatar/compact variants
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Placeholder icon or text for empty state
   */
  placeholder?: React.ReactNode;
  /**
   * Avatar fallback content
   */
  fallback?: React.ReactNode;
  /**
   * Shape for avatar/compact variants
   */
  shape?: 'circle' | 'square';
}

export interface DocumentUploaderProps extends Omit<FileUploaderProps, 'accept' | 'embedding'> {
  /** Accepted document types */
  acceptedTypes?: ('pdf' | 'docx' | 'txt' | 'xlsx' | 'pptx' | 'jpg' | 'jpeg' | 'png')[];
  /** Enable AI embeddings for semantic search */
  enableEmbeddings?: boolean;
  /** Context IDs for embedding metadata */
  embeddingContext?: {
    tenantId?: string;
    courseId?: string;
    moduleId?: string;
  };
}

export interface UploadStatusCardProps {
  /** The file ID */
  fileId: string;
  /** Current status of the file */
  status: UploadStatus;
  /** Upload/processing progress (0-100) */
  progress?: number;
  /** File name to display */
  fileName?: string;
  /** File size in bytes */
  fileSize?: number;
  /** Error message if failed */
  error?: string;
  /** Callback to cancel/remove the upload */
  onCancel?: () => void;
  /** Callback to retry failed upload */
  onRetry?: () => void;
}

// ============================================
// Hook Return Types
// ============================================
export interface UseUploadReturn {
  /** Upload a file and get fileId and URL */
  uploadFile: (file: NativeFile) => Promise<{ fileId: string; url: string }>;
  /** Current upload progress (0-100) */
  progress: number;
  /** Current upload status */
  status: UploadStatus;
  /** Error if any occurred */
  error: Error | null;
  /** Cancel the current upload */
  cancel: () => void;
  /** Reset the upload state */
  reset: () => void;
}

// ============================================
// Utility Types
// ============================================
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export type StudentSubjects = {
  id: string;
  name: string;
  progress: number;
  confidence: number;
  totalMissions: number;
  chapters: {
    id: string;
    name: string;
    isCurrentChapter: boolean;
    totalLessons: number;
  }[];
};
