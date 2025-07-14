// src/components/admin/CategoryImageUploadBox.tsx - Product-style Image Upload
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface CategoryImageUploadBoxProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function CategoryImageUploadBox({ 
  images, 
  onChange, 
  disabled = false,
  maxImages = 5 
}: CategoryImageUploadBoxProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not a valid image file`);
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/images', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(`Failed to upload ${file.name}: ${errorData.error}`);
        }

        const data = await response.json();
        return data.imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success('Image removed');
  };

  const handleSetPrimary = (index: number) => {
    const newImages = [...images];
    const [primaryImage] = newImages.splice(index, 1);
    newImages.unshift(primaryImage);
    onChange(newImages);
    toast.success('Primary image updated');
  };

  const openFileDialog = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Category Images</Label>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer hover:border-gray-400 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={openFileDialog}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Label className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload category images
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PNG, JPG, GIF up to 5MB each
                </span>
              </Label>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              disabled={disabled || uploading}
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose Images'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative">
                  <Image
                    src={imageUrl}
                    alt={`Category image ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    onError={() => {
                      toast.error(`Failed to load image ${index + 1}`);
                    }}
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded">
                    <div className="flex gap-1">
                      {index !== 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimary(index);
                          }}
                          disabled={disabled || uploading}
                        >
                          Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageRemove(index);
                        }}
                        disabled={disabled || uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Primary badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}

                  {/* Remove button (always visible on mobile) */}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 w-6 h-6 p-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageRemove(index);
                    }}
                    disabled={disabled || uploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Image info */}
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500">
                    Image {index + 1}
                    {index === 0 && ' (Primary)'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload limit info */}
      <p className="text-xs text-gray-500 text-center">
        {images.length} of {maxImages} images uploaded
      </p>
    </div>
  );
}