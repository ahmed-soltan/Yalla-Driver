import { FILE_SIZE_LIMITS, formatFileSize, validateFile } from '@/shared/lib/file-upload';
import { useUpload } from '@/shared/services/use-upload';
import { FileUploaderProps, UploadStatus } from '@/shared/types/file-types';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';

export interface NativeFile {
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
}

export interface FileUploaderState {
  selectedFile: NativeFile | null;
  previewUrl: string | null;
  validationError: string | null;
  progress: number;
  status: UploadStatus;
  error: Error | null;
  isUploading: boolean;
  isComplete: boolean;
  isFailed: boolean;
  maxSizeText: string;
}

export interface FileUploaderHandlers {
  openFilePicker: () => void;
  openCamera: () => void;
  openGallery: () => void;
  handleCancel: () => void;
  handleRetry: () => void;
  handleRemove: () => void;
  clearValidationError: () => void;
}

export interface FileUploaderRenderProps {
  state: FileUploaderState;
  handlers: FileUploaderHandlers;
}

export interface HeadlessFileUploaderProps extends Omit<
  FileUploaderProps,
  'label' | 'description' | 'className'
> {
  children: (props: FileUploaderRenderProps) => React.ReactNode;
}

/**
 * FIXED: previously, a comma-separated `accept` string like
 * "image/png,image/jpeg" would incorrectly match the `startsWith('image/')`
 * fast-path (since the whole joined string literally starts with
 * "image/"), and get passed to DocumentPicker as one malformed value
 * instead of being split into a proper array. Now we always split first,
 * and only take the single-value fast-path when there's genuinely one
 * value.
 */
function getNativePickerType(accept?: string): string | string[] {
  if (!accept || accept === '*/*') {
    return '*/*';
  }

  const values = accept
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  // Genuinely a single, already-valid MIME type/wildcard.
  if (values.length === 1) {
    const value = values[0];
    if (
      value.startsWith('image/') ||
      value.startsWith('video/') ||
      value.startsWith('audio/') ||
      value === 'application/pdf' ||
      value === 'text/plain'
    ) {
      return value;
    }
  }

  const mimeTypes = new Set<string>();

  for (const value of values) {
    if (value.includes('/')) {
      mimeTypes.add(value);
      continue;
    }

    switch (value) {
      case '.pdf':
        mimeTypes.add('application/pdf');
        break;

      case '.doc':
        mimeTypes.add('application/msword');
        break;

      case '.docx':
        mimeTypes.add('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        break;

      case '.txt':
        mimeTypes.add('text/plain');
        break;

      case '.xlsx':
        mimeTypes.add('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        break;

      case '.pptx':
        mimeTypes.add('application/vnd.openxmlformats-officedocument.presentationml.presentation');
        break;

      case '.xls':
        mimeTypes.add('application/vnd.ms-excel');
        break;

      case '.ppt':
        mimeTypes.add('application/vnd.ms-powerpoint');
        break;

      default:
        break;
    }
  }

  return mimeTypes.size > 0 ? Array.from(mimeTypes) : '*/*';
}

export function FileUploader({
  accept = '*/*',
  maxSizeBytes = FILE_SIZE_LIMITS.default,
  onUploadComplete,
  onError,
  onProgress,
  disabled = false,
  folder,
  name,
  embedding,
  value,
  children,
  onRemove,
}: HeadlessFileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<NativeFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { uploadFile, progress, status, error, cancel, reset } = useUpload({
    maxSizeBytes,
    accept,
    folder,
    name,
    embedding,
  });

  useEffect(() => {
    onProgress?.(progress);
  }, [progress, onProgress]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (value) {
      // eslint-disable-next-line
      setPreviewUrl(value);
    }
  }, [value]);

  const processFile = useCallback(
    async (file: NativeFile) => {
      const validation = validateFile(file, {
        maxSizeBytes,
        accept,
      });

      if (!validation.valid) {
        setValidationError(validation.error || 'الملف غير صالح');
        return;
      }

      setValidationError(null);
      setSelectedFile(file);
      setPreviewUrl(file.uri);

      try {
        const { fileId, url } = await uploadFile(file);

        const preview = url || file.uri;
        setPreviewUrl(preview);
        onUploadComplete(fileId, preview, file.name);
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error('فشل رفع الملف');

        onError?.(uploadError);
      }
    },
    [maxSizeBytes, accept, uploadFile, onUploadComplete, onError]
  );

  const pickImage = useCallback(
    async (source: 'camera' | 'gallery') => {
      if (disabled || status === 'uploading') return;
      try {
        if (source === 'camera') {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            throw new Error('يجب السماح بالوصول إلى الكاميرا لالتقاط الصورة.');
          }
        }

        const result =
          source === 'camera'
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.9,
              })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.9,
              });

        if (result.canceled) return;

        const asset = result.assets[0];
        await processFile({
          uri: asset.uri,
          name: asset.fileName ?? `image-${Date.now()}.jpg`,
          size: asset.fileSize ?? 0,
          mimeType: asset.mimeType ?? 'image/jpeg',
        });
      } catch (err) {
        const pickerError = err instanceof Error ? err : new Error('فشل اختيار الصورة');
        setValidationError(pickerError.message);
        onError?.(pickerError);
      }
    },
    [disabled, onError, processFile, status]
  );

  const openFilePicker = useCallback(async () => {
    if (disabled || status === 'uploading') return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: getNativePickerType(accept),
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      await processFile({
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? 0,
        mimeType: asset.mimeType ?? undefined,
      });
    } catch (err) {
      const pickerError = err instanceof Error ? err : new Error('فشل اختيار الملف');
      setValidationError(pickerError.message);
      onError?.(pickerError);
    }
  }, [accept, disabled, processFile, onError, status]);

  const handleCancel = useCallback(() => {
    cancel();

    setSelectedFile(null);
    setPreviewUrl(value || null);
  }, [cancel, value]);

  const handleRetry = useCallback(() => {
    if (!selectedFile) {
      return;
    }

    reset();
    processFile(selectedFile);
  }, [selectedFile, reset, processFile]);

  const handleRemove = useCallback(() => {
    reset();

    setSelectedFile(null);
    setValidationError(null);
    setPreviewUrl(null);

    onUploadComplete('', '', '');
    onRemove?.();
  }, [reset, onUploadComplete, onRemove]);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const state: FileUploaderState = {
    selectedFile,
    previewUrl: previewUrl || selectedFile?.uri || null,
    validationError,
    progress,
    status,
    error,
    isUploading: status === 'uploading',
    isComplete: status === 'ready',
    isFailed: status === 'failed',
    maxSizeText: formatFileSize(maxSizeBytes),
  };

  const handlers: FileUploaderHandlers = {
    openFilePicker,
    openCamera: () => void pickImage('camera'),
    openGallery: () => void pickImage('gallery'),
    handleCancel,
    handleRetry,
    handleRemove,
    clearValidationError,
  };

  return children({
    state,
    handlers,
  });
}
