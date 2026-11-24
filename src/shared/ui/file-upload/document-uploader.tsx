import { AlertCircle, CheckCircle2, FileText, RefreshCw, Upload, X } from 'lucide-react-native';
import { Linking, Pressable, View } from 'react-native';

import { FileUploader, FileUploaderRenderProps } from './file-uploader';
import { DocumentUploaderProps } from '@/shared/types/file-types';
import { cn } from '@/shared/lib/cn';
import { Button } from '../button';
import { Text } from '../text/text';
import { FILE_SIZE_LIMITS, formatFileSize } from '@/shared/lib/file-upload';
import { Progress } from '../progress';

// Map document types to MIME types
const DOCUMENT_MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

// Map file extensions to icons/labels
const DOCUMENT_TYPE_INFO: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  pdf: {
    label: 'PDF',
    color: 'text-red-500',
  },
  jpg: {
    label: 'JPG',
    color: 'text-blue-500',
  },
  jpeg: {
    label: 'JPEG',
    color: 'text-blue-500',
  },
  png: {
    label: 'PNG',
    color: 'text-blue-500',
  },
  docx: {
    label: 'DOCX',
    color: 'text-blue-500',
  },
  txt: {
    label: 'TXT',
    color: 'text-gray-500',
  },
  xlsx: {
    label: 'XLSX',
    color: 'text-green-500',
  },
  pptx: {
    label: 'PPTX',
    color: 'text-orange-500',
  },
};

function getAcceptString(
  acceptedTypes: ('pdf' | 'docx' | 'txt' | 'xlsx' | 'pptx' | 'jpg' | 'jpeg' | 'png')[]
): string {
  return acceptedTypes.map((type) => DOCUMENT_MIME_TYPES[type]).join(',');
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  return ext in DOCUMENT_TYPE_INFO ? ext : 'txt';
}

export function DocumentUploader({
  maxSizeBytes = FILE_SIZE_LIMITS.document,
  onUploadComplete,
  onError,
  onProgress,
  disabled = false,
  label = 'رفع مستند',
  description = 'انقر لاختيار المستند',
  className,
  acceptedTypes = ['pdf', 'docx', 'txt', 'xlsx', 'pptx'],
  value,
  name,
  onRemove,
}: DocumentUploaderProps) {
  const acceptString = getAcceptString(acceptedTypes);

  return (
    <View className={cn('w-full', className)}>
      <FileUploader
        accept={acceptString}
        maxSizeBytes={maxSizeBytes}
        onUploadComplete={onUploadComplete}
        onError={onError}
        onProgress={onProgress}
        disabled={disabled}
        value={value}
        name={name}
        onRemove={onRemove}>
        {(props) => (
          <DocumentDropzoneUI
            {...props}
            label={label}
            description={description}
            disabled={disabled}
            acceptedTypes={acceptedTypes}
          />
        )}
      </FileUploader>
    </View>
  );
}

interface DocumentDropzoneUIProps extends FileUploaderRenderProps {
  label: string;
  description: string;
  disabled: boolean;
  acceptedTypes: ('pdf' | 'docx' | 'txt' | 'xlsx' | 'pptx' | 'jpg' | 'jpeg' | 'png')[];
}

function DocumentDropzoneUI({
  state,
  handlers,
  label,
  description,
  disabled,
  acceptedTypes,
}: DocumentDropzoneUIProps) {
  const {
    selectedFile,
    previewUrl,
    validationError,
    progress,
    error,
    isUploading,
    isComplete,
    isFailed,
    maxSizeText,
  } = state;

  const { openFilePicker, handleCancel, handleRetry, handleRemove, clearValidationError } =
    handlers;

  const fileType = selectedFile ? getFileType(selectedFile.name) : 'pdf';

  const typeInfo = DOCUMENT_TYPE_INFO[fileType] || DOCUMENT_TYPE_INFO.txt;

  const acceptedLabels = acceptedTypes.map((type) => type.toUpperCase()).join(', ');

  const handlePreview = async () => {
    if (!previewUrl) return;

    try {
      await Linking.openURL(previewUrl);
    } catch {
      // Ignore invalid/unavailable URLs.
    }
  };

  return (
    <View className="relative w-full">
      {selectedFile ? (
        <View className="rounded-lg border border-border bg-card p-4">
          <View className="flex-row-reverse items-start justify-between gap-4">
            <View className="flex-1 flex-row-reverse items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <FileText size={20} className={typeInfo.color} />
              </View>

              <View className="min-w-0 flex-1 items-start">
                <Text numberOfLines={1} className="font-medium text-foreground">
                  {selectedFile.name}
                </Text>

                <View className="flex-row-reverse items-center gap-2">
                  <Text className={cn('text-sm font-medium', typeInfo.color)}>
                    {typeInfo.label}
                  </Text>

                  <Text className="text-sm text-muted-foreground">•</Text>

                  <Text className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row-reverse items-center gap-2">
              {isUploading && (
                <Button variant="ghost" size="icon" onPress={handleCancel} className="h-8 w-8">
                  <X size={16} />
                </Button>
              )}

              {isFailed && (
                <Button variant="ghost" size="icon" onPress={handleRetry} className="h-8 w-8">
                  <RefreshCw size={16} />
                </Button>
              )}

              {(isComplete || isFailed) && (
                <Button variant="ghost" size="icon" onPress={handleRemove} className="h-8 w-8">
                  <X size={16} />
                </Button>
              )}
            </View>
          </View>

          {isUploading && (
            <View className="mt-3">
              <Progress value={progress} className="h-2" />
            </View>
          )}

          <View className="mt-2 flex-row-reverse items-center gap-2">
            {isComplete && <CheckCircle2 size={16} className="text-green-500" />}

            {isFailed && <AlertCircle size={16} className="text-destructive" />}

            <Text
              className={cn(
                'text-sm',
                isComplete && 'text-green-500',
                isFailed && 'text-destructive',
                isUploading && 'text-muted-foreground'
              )}>
              {isUploading && `جاري الرفع... ${Math.round(progress)}%`}

              {isComplete && 'تم الرفع بنجاح'}

              {isFailed && (error?.message || 'فشل الرفع')}
            </Text>
          </View>
        </View>
      ) : (
        <>
          {validationError && (
            <View className="mb-3 flex-row-reverse items-center gap-2 rounded-lg bg-destructive/10 p-3">
              <AlertCircle size={16} className="shrink-0 text-destructive" />

              <Text className="flex-1 text-sm text-destructive">{validationError}</Text>

              <Button variant="ghost" size="sm" onPress={clearValidationError} className="h-6 px-2">
                <X size={12} />
              </Button>
            </View>
          )}

          {previewUrl && (
            <View className="mb-3 w-full rounded-lg border border-border bg-card p-4">
              <View className="flex-row-reverse items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <FileText size={20} className="text-primary" />
                </View>

                <View className="min-w-0 flex-1">
                  <Text className="font-medium text-foreground">مستند محفوظ</Text>

                  <Pressable onPress={handlePreview} disabled={disabled}>
                    <Text className="mt-1 text-sm text-primary">عرض المستند</Text>
                  </Pressable>
                </View>

                <Button variant="ghost" size="icon" onPress={handleRemove} className="h-8 w-8">
                  <X size={16} />
                </Button>
              </View>
            </View>
          )}

          {!previewUrl && (
            <Pressable
              onPress={openFilePicker}
              disabled={disabled}
              className={cn(
                'w-full items-center rounded-lg border-2 border-dashed p-8',
                disabled && 'opacity-50',
                'border-border active:bg-primary/5'
              )}>
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-accent/50">
                <FileText size={32} className="text-muted-foreground" />
              </View>

              <Text className="mb-2 text-center text-lg">{label}</Text>

              <Text className="mb-4 text-center text-muted-foreground">{description}</Text>

              <Text className="text-center text-sm text-muted-foreground">
                {acceptedLabels} • {maxSizeText}
              </Text>

              <Button
                variant="outline"
                onPress={openFilePicker}
                disabled={disabled}
                className="mt-4 border-primary">
                <Upload size={16} className="mr-2 text-primary" />

                <Text className="text-primary">اختيار مستند</Text>
              </Button>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
