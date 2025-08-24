import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, AlertCircle, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn, formatNumber } from '../../utils';
import { UPLOAD_LIMITS } from '../../utils/constants';

interface FileUploadProps {
  onUpload: (files: File[]) => void | Promise<void>;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  label?: string;
  description?: string;
  uploadedFiles?: UploadedFile[];
  onRemove?: (fileId: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    'application/pdf': ['.pdf'],
  },
  maxFiles = UPLOAD_LIMITS.MAX_FILES,
  maxSize = UPLOAD_LIMITS.MAX_FILE_SIZE,
  multiple = true,
  className,
  label = 'Upload Files',
  description,
  uploadedFiles = [],
  onRemove,
}) => {
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      // Handle rejected files
      rejectedFiles.forEach((file) => {
        console.error('File rejected:', file.errors);
      });
      return;
    }

    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      await onUpload(acceptedFiles);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
    disabled: isUploading,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const getAcceptedFileTypes = () => {
    const types = Object.keys(accept).flatMap(key => accept[key]);
    return types.join(', ');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          'hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          theme === 'dark'
            ? 'border-white/20 bg-white/5 hover:bg-white/10'
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100',
          isDragActive && (theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50'),
          isDragReject && (theme === 'dark' ? 'border-red-500 bg-red-500/10' : 'border-red-500 bg-red-50'),
          isUploading && 'pointer-events-none opacity-75'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className={cn(
                'mt-2 text-sm font-medium',
                theme === 'dark' ? 'text-white' : 'text-slate-700'
              )}>
                Uploading files...
              </p>
            </div>
          ) : (
            <>
              <div className={cn(
                'mx-auto w-12 h-12 rounded-full flex items-center justify-center',
                theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
              )}>
                <Upload className={cn(
                  'w-6 h-6',
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                )} />
              </div>
              
              <div>
                <p className={cn(
                  'text-lg font-medium',
                  theme === 'dark' ? 'text-white' : 'text-slate-700'
                )}>
                  {label}
                </p>
                <p className={cn(
                  'text-sm mt-1',
                  theme === 'dark' ? 'text-white/70' : 'text-slate-500'
                )}>
                  {isDragActive
                    ? 'Drop files here...'
                    : 'Drag & drop files here, or click to select'
                  }
                </p>
                {description && (
                  <p className={cn(
                    'text-xs mt-2',
                    theme === 'dark' ? 'text-white/60' : 'text-slate-400'
                  )}>
                    {description}
                  </p>
                )}
              </div>
              
              <div className={cn(
                'text-xs space-y-1',
                theme === 'dark' ? 'text-white/60' : 'text-slate-400'
              )}>
                <p>Max file size: {formatFileSize(maxSize)}</p>
                <p>Max files: {formatNumber(maxFiles)}</p>
                <p>Accepted: {getAcceptedFileTypes()}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className={cn(
          'p-4 rounded-lg border',
          theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className={cn(
              'font-medium',
              theme === 'dark' ? 'text-red-400' : 'text-red-700'
            )}>
              Some files were rejected
            </h4>
          </div>
          <ul className="mt-2 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name} className={cn(
                'text-sm',
                theme === 'dark' ? 'text-red-300' : 'text-red-600'
              )}>
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className={cn(
            'font-medium',
            theme === 'dark' ? 'text-white' : 'text-slate-700'
          )}>
            Uploaded Files
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                )}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={cn(
                    'flex-shrink-0',
                    theme === 'dark' ? 'text-white/70' : 'text-slate-500'
                  )}>
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      theme === 'dark' ? 'text-white' : 'text-slate-700'
                    )}>
                      {file.name}
                    </p>
                    <p className={cn(
                      'text-xs',
                      theme === 'dark' ? 'text-white/60' : 'text-slate-500'
                    )}>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                {/* Upload Progress */}
                {file.progress !== undefined && file.progress < 100 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                    <span className={cn(
                      'text-xs',
                      theme === 'dark' ? 'text-white/70' : 'text-slate-500'
                    )}>
                      {file.progress}%
                    </span>
                  </div>
                )}

                {/* Success/Error */}
                {file.progress === 100 && !file.error && (
                  <Check className="w-5 h-5 text-green-500" />
                )}

                {file.error && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}

                {/* Remove Button */}
                {onRemove && (
                  <button
                    onClick={() => onRemove(file.id)}
                    className={cn(
                      'ml-2 p-1 rounded-full transition-colors',
                      theme === 'dark'
                        ? 'hover:bg-white/10 text-white/70'
                        : 'hover:bg-slate-100 text-slate-500'
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Export FileUpload as default
export default FileUpload;
