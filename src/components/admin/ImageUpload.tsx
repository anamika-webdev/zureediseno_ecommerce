// src/components/admin/ImageUpload.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes('/dashboard/admin') || pathname?.includes('/admin');

  // Admin toast styling
  const adminToastStyle = {
    background: '#000000',
    color: '#ffffff',
    border: '1px solid #333333',
  };

  const showToast = {
    success: (message: string) => {
      if (isAdminRoute) {
        toast.success(message, {
          style: {
            ...adminToastStyle,
            borderLeft: '4px solid #22c55e',
          },
        });
      } else {
        toast.success(message);
      }
    },
    error: (message: string) => {
      if (isAdminRoute) {
        toast.error(message, {
          style: {
            ...adminToastStyle,
            borderLeft: '4px solid #ef4444',
          },
        });
      } else {
        toast.error(message);
      }
    },
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxImages) {
      showToast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showToast.error(`${file.name} is not a valid image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showToast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/images', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          newUrls.push(data.imageUrl);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          showToast.error(`Failed to upload ${file.name}: ${errorData.error}`);
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
        showToast.success(`${newUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-10 w-10 text-gray-400" />
          </div>
          
          <div>
            <p className="text-sm font-medium">Drop images here or click to upload</p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB (max {maxImages} images)
            </p>
          </div>

          <div>
            <Label htmlFor="image-upload" className="cursor-pointer">
              <Input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleInputChange}
                disabled={disabled || uploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                disabled={disabled || uploading || value.length >= maxImages}
                asChild
              >
                <span>
                  {uploading ? 'Uploading...' : 'Choose Images'}
                </span>
              </Button>
            </Label>
          </div>
        </div>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="text-sm text-gray-600 text-center">
          <div className="animate-pulse">Uploading images...</div>
        </div>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div>
          <Label className="text-sm font-medium">
            Uploaded Images ({value.length}/{maxImages})
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
            {value.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'; // Fallback image
                    }}
                  />
                </div>
                
                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {value.length > 1 && (
            <p className="text-xs text-gray-500 mt-2">
              The first image will be used as the primary product image
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && !uploading && (
        <div className="text-center py-4">
          <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}