import { FILE_SIZE_LIMITS, NATIVE_IMAGE_MIME_TYPES } from '@/shared/lib/file-upload';
import type { ImageUploaderProps } from '@/shared/types/file-types';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react-native';
import { Pressable, View, Image } from 'react-native';

import { FileUploader, type FileUploaderRenderProps } from './file-uploader';
import { cn } from '@/shared/lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '../button';
import { Progress } from '../progress';
import { Text } from '../text/text';

type ImageUploaderVariant = 'dropzone' | 'avatar' | 'compact';
type ImageUploaderSize = 'sm' | 'md' | 'lg';

interface ExtendedImageUploaderProps extends ImageUploaderProps {
  variant?: ImageUploaderVariant;
  size?: ImageUploaderSize;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  shape?: 'circle' | 'square';
}

const SIZE_CLASSES = {
  sm: {
    avatar: 'size-12',
    button: 'h-8 px-2',
  },
  md: {
    avatar: 'size-16',
    button: 'h-9 px-3',
  },
  lg: {
    avatar: 'size-24',
    button: 'h-10 px-4',
  },
} as const;

export function ImageUploader({
  maxSizeBytes = FILE_SIZE_LIMITS.image,
  onUploadComplete,
  onError,
  onProgress,
  disabled = false,
  label = 'رفع صورة',
  description = 'اختر صورة من جهازك',
  className,
  enableEmbeddings = false,
  value,
  variant = 'dropzone',
  size = 'md',
  placeholder,
  fallback,
  shape = 'circle',
  name,
  imageSource,
}: ExtendedImageUploaderProps) {
  return (
    <FileUploader
      accept={NATIVE_IMAGE_MIME_TYPES[0]}
      maxSizeBytes={maxSizeBytes}
      onUploadComplete={onUploadComplete}
      onError={onError}
      onProgress={onProgress}
      disabled={disabled}
      embedding={enableEmbeddings ? { enabled: true } : undefined}
      value={value}
      imageSource={imageSource}
      name={name}>
      {(props) => {
        if (variant === 'avatar') {
          return (
            <AvatarVariantUI
              {...props}
              size={size}
              shape={shape}
              fallback={fallback}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
            />
          );
        }

        if (variant === 'compact') {
          return (
            <CompactVariantUI
              {...props}
              size={size}
              shape={shape}
              fallback={fallback}
              placeholder={placeholder}
              label={label}
              disabled={disabled}
              className={className}
              imageSource={imageSource}
            />
          );
        }

        return (
          <DropzoneVariantUI
            {...props}
            label={label}
            description={description}
            disabled={disabled}
            className={className}
          />
        );
      }}
    </FileUploader>
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar                                                                     */
/* -------------------------------------------------------------------------- */

interface AvatarVariantUIProps extends FileUploaderRenderProps {
  size: ImageUploaderSize;
  shape: 'circle' | 'square';
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
  disabled: boolean;
  className?: string;
}

function AvatarVariantUI({
  state,
  handlers,
  size,
  shape,
  fallback,
  placeholder,
  disabled,
  className,
}: AvatarVariantUIProps) {
  const { previewUrl, isUploading, isComplete, isFailed, progress, validationError } = state;

  const { openFilePicker, handleRemove, handleRetry } = handlers;

  const fallbackContent =
    typeof fallback === 'string' ? (
      <Text className="text-center font-semibold text-white">{fallback}</Text>
    ) : (
      fallback || placeholder || <Camera size={20} className="text-muted-foreground" />
    );

  return (
    <View className={cn('relative')}>
      <Pressable
        onPress={openFilePicker}
        disabled={disabled || isUploading}
        className={cn(
          SIZE_CLASSES[size].avatar,
          'relative',
          shape === 'square' ? 'rounded-lg' : 'rounded-full',
          disabled && 'opacity-50',
          className
        )}>
        {previewUrl ? (
          <Avatar
            alt="صورة الملف الشخصي"
            className={cn('size-full', shape === 'square' ? 'rounded-lg' : 'rounded-full')}>
            <AvatarImage
              source={{ uri: previewUrl }}
              className={cn('size-full', shape === 'square' ? 'rounded-lg' : 'rounded-full')}
            />

            <AvatarFallback
              className={cn(
                'size-full bg-accent',
                shape === 'square' ? 'rounded-lg' : 'rounded-full'
              )}>
              {fallbackContent}
            </AvatarFallback>
          </Avatar>
        ) : (
          <View
            className={cn(
              'relative h-full w-full items-center justify-center bg-primary',
              shape === 'square' ? 'rounded-lg' : 'rounded-full'
            )}>
            <Text
              className={cn(
                'text-center font-semibold text-white',
                size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-xl'
              )}>
              {fallback || placeholder || <Camera size={20} className="text-muted-foreground" />}
            </Text>
            <View className="absolute bottom-0 left-0 rounded-full border border-border bg-white p-1">
              <Pencil size={12} className="text-black" />
            </View>
          </View>
        )}

        {isUploading && (
          <View className="absolute inset-0 items-center justify-center bg-black/50">
            <Text className="text-xs font-semibold text-white">{Math.round(progress)}%</Text>
          </View>
        )}
      </Pressable>

      {isComplete && previewUrl && !isUploading && (
        <View className="absolute -right-1 bottom-1 size-5 items-center justify-center rounded-full bg-green-500">
          <CheckCircle2 size={12} color="white" />
        </View>
      )}

      {previewUrl && !isUploading && !disabled && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -right-1 -top-1 size-6 rounded-full"
          onPress={handleRemove}>
          <X size={12} color="white" />
        </Button>
      )}

      {isFailed && !disabled && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -bottom-1 -right-1 size-6 rounded-full bg-background"
          onPress={handleRetry}>
          <RefreshCw size={12} />
        </Button>
      )}

      {validationError && <Text className="mt-2 text-xs text-destructive">{validationError}</Text>}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Compact                                                                    */
/* -------------------------------------------------------------------------- */

interface CompactVariantUIProps extends FileUploaderRenderProps {
  size: ImageUploaderSize;
  shape: 'circle' | 'square';
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
  label: string;
  disabled: boolean;
  className?: string;
  imageSource?: 'camera-and-gallery';
}

function CompactVariantUI({
  state,
  handlers,
  size,
  shape,
  fallback,
  placeholder,
  label,
  disabled,
  className,
  imageSource,
}: CompactVariantUIProps) {
  const { previewUrl, isUploading, isComplete, isFailed, progress, error, validationError } = state;

  const { openFilePicker, openCamera, openGallery, handleCancel, handleRemove, handleRetry } =
    handlers;

  return (
    <View
      className={cn(
        'min-h-24  w-full flex-row-reverse items-center gap-3 rounded-xl p-2',
        className
      )}>
      <Avatar
        alt="صورة"
        className={cn(
          SIZE_CLASSES[size].avatar,
          'border border-border/70 bg-accent',
          shape === 'square' ? 'rounded-xl' : 'rounded-full'
        )}>
        <AvatarImage
          source={previewUrl ? { uri: previewUrl } : undefined}
          className={cn('size-full', shape === 'square' ? 'rounded-xl' : 'rounded-full')}
        />
        <AvatarFallback
          className={cn(
            'items-center justify-center bg-accent',
            shape === 'square' ? 'rounded-xl' : 'rounded-full'
          )}>
          {fallback || placeholder || <Camera size={20} className="text-muted-foreground" />}
        </AvatarFallback>
      </Avatar>

      <View className="min-h-20 flex-1 justify-center gap-2">
        <View className="h-9  flex-row-reverse items-center gap-2">
          {isUploading ? (
            <Button
              variant="outline"
              size="sm"
              onPress={handleCancel}
              className={cn('flex-1', SIZE_CLASSES[size].button)}>
              <X size={16} />
              <Text>إلغاء</Text>
            </Button>
          ) : isFailed ? (
            <Button
              variant="outline"
              size="sm"
              onPress={handleRetry}
              disabled={disabled}
              className={cn('flex-1', SIZE_CLASSES[size].button)}>
              <RefreshCw size={16} />
              <Text>إعادة المحاولة</Text>
            </Button>
          ) : imageSource === 'camera-and-gallery' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onPress={openCamera}
                disabled={disabled}
                className={cn('flex-1 flex-row-reverse  items-center', SIZE_CLASSES[size].button)}>
                <Camera size={16} />
                <Text>الكاميرا</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={openGallery}
                disabled={disabled}
                className={cn('flex-1 flex-row-reverse  items-center', SIZE_CLASSES[size].button)}>
                <Upload size={16} />
                <Text>المعرض</Text>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onPress={openFilePicker}
              disabled={disabled}
              className={cn('flex-1', SIZE_CLASSES[size].button)}>
              <Camera size={16} />
              <Text>{previewUrl ? 'تغيير الصورة' : label}</Text>
            </Button>
          )}

          {previewUrl && !isUploading && !isFailed && (
            <Button
              variant="ghost"
              size="icon"
              onPress={handleRemove}
              className="size-9 rounded-lg">
              <Trash2 size={16} className="text-destructive" />
            </Button>
          )}
        </View>

        <View className="min-h-5 justify-center">
          {isUploading ? (
            <View className="flex-row-reverse  items-center gap-2">
              <Progress value={progress} className="h-1.5 flex-1" />
              <Text className="w-9 text-right text-xs text-muted-foreground">
                {Math.round(progress)}%
              </Text>
            </View>
          ) : isComplete ? (
            <View className="flex-row-reverse  items-center gap-1">
              <CheckCircle2 size={13} color="#16a34a" />
              <Text className="text-xs text-green-600">تم الرفع بنجاح</Text>
            </View>
          ) : isFailed || validationError ? (
            <View className="flex-row-reverse  items-center gap-1">
              <AlertCircle size={13} color="#dc2626" />
              <Text numberOfLines={1} className="flex-1 text-xs text-destructive">
                {validationError || error?.message || 'فشل الرفع'}
              </Text>
            </View>
          ) : (
            <Text className="text-xs text-muted-foreground">
              {previewUrl ? 'يمكنك تغيير الصورة أو حذفها' : 'JPG أو PNG'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Dropzone                                                                    */
/* -------------------------------------------------------------------------- */

interface DropzoneVariantUIProps extends FileUploaderRenderProps {
  label: string;
  description: string;
  disabled: boolean;
  className?: string;
}

function DropzoneVariantUI({
  state,
  handlers,
  label,
  description,
  disabled,
  className,
}: DropzoneVariantUIProps) {
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
  const displayUrl = previewUrl || selectedFile?.uri;

  const { openFilePicker, handleCancel, handleRetry, handleRemove, clearValidationError } =
    handlers;

  return (
    <View className={cn('w-full', className)}>
      {selectedFile && (
        <View className="rounded-lg border border-border bg-card p-4">
          <View className="flex-row-reverse items-start justify-between gap-4">
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="font-medium text-foreground">
                {selectedFile.name}
              </Text>

              <Text className="mt-1 text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </Text>
            </View>

            <View className="flex-row-reverse items-center gap-2">
              {isUploading && (
                <Button variant="ghost" size="icon" onPress={handleCancel} className="size-8">
                  <X size={16} />
                </Button>
              )}

              {isFailed && (
                <Button variant="ghost" size="icon" onPress={handleRetry} className="size-8">
                  <RefreshCw size={16} />
                </Button>
              )}

              {(isComplete || isFailed) && (
                <Button variant="ghost" size="icon" onPress={handleRemove} className="size-8">
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
            {isComplete && <CheckCircle2 size={16} color="#22c55e" />}

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

          {displayUrl && (
            <View className="relative mt-3 h-48 w-full overflow-hidden rounded-lg">
              <Image source={{ uri: displayUrl }} className="size-full" />
            </View>
          )}
        </View>
      )}

      {!selectedFile && (
        <>
          {validationError && (
            <View className="mb-3 flex-row-reverse items-center gap-2 rounded-lg bg-destructive/10 p-3">
              <AlertCircle size={16} className="text-destructive" />

              <Text className="flex-1 text-sm text-destructive">{validationError}</Text>

              <Button variant="ghost" size="sm" onPress={clearValidationError} className="h-8 px-2">
                <X size={14} />
              </Button>
            </View>
          )}

          {previewUrl && (
            <View className="mb-3 w-full rounded-lg border border-border bg-card p-4">
              <View className="flex-row-reverse items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="font-medium text-foreground">صورة محفوظة</Text>
                </View>

                <Button variant="ghost" size="icon" onPress={handleRemove} className="size-8">
                  <X size={16} />
                </Button>
              </View>

              <View className="relative mt-3 h-48 w-full overflow-hidden rounded-lg">
                <Image source={{ uri: previewUrl }} resizeMode="center" className="size-full" />
              </View>
            </View>
          )}

          {!previewUrl && (
            <Pressable
              onPress={openFilePicker}
              disabled={disabled}
              className={cn(
                'w-full items-center rounded-lg border-2 border-dashed border-border p-8',
                disabled && 'opacity-50'
              )}>
              <View className="mb-4 size-16 items-center justify-center rounded-2xl bg-accent/50">
                <Upload size={32} className="text-muted-foreground" />
              </View>

              <Text className="mb-2 text-center text-xl font-semibold text-foreground">
                {label}
              </Text>

              <Text className="mb-4 text-center text-sm text-muted-foreground">{description}</Text>

              <Text className="text-center text-sm text-muted-foreground">{maxSizeText}</Text>

              <Button
                variant="outline"
                className="mt-4 border-primary"
                onPress={openFilePicker}
                disabled={disabled}>
                <Upload size={16} className="text-primary" />
                <Text className="text-primary">اختيار صورة</Text>
              </Button>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
