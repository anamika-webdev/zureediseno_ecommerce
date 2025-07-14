// src/components/admin/CategoryImageUpload.tsx - Enhanced Image Upload for Categories
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface CategoryImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  disabled?: boolean;
  maxSizeMB?: number;
}

export function CategoryImageUpload({ 
  value, 
  onChange, 
  disabled = false,
  maxSizeMB = 5 
}: CategoryImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported file types
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!supportedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
    }
    
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    return null;
  };

  // Upload file to server
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/images', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file
      const imageUrl = await uploadFile(file);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update form
      onChange(imageUrl);
      setPreviewUrl(imageUrl);
      
      // Cleanup preview URL if it was a blob
      if (fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
      
      toast.success('Image uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      
      // Reset preview on error
      setPreviewUrl(value || null);
      
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    e.target.value = '';
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Remove image
  const handleRemove = () => {
    setPreviewUrl(null);
    onChange('');
    toast.success('Image removed');
  };

  // Open file picker
  const openFilePicker = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={supportedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload Area */}
      {!previewUrl ? (
        <Card 
          className={`border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-gray-400 ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={openFilePicker}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              {uploading ? (
                <>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Uploading image...</p>
                    <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                    <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">Upload Category Image</h3>
                    <p className="text-sm text-gray-500">
                      Drag and drop an image here, or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                      Supports: JPEG, PNG, GIF, WebP • Max size: {maxSizeMB}MB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      type="button"
                      variant="outline" 
                      disabled={disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        openFilePicker();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      disabled={disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        openFilePicker();
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Image Preview */
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <div className="aspect-video relative border rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={previewUrl}
                  alt="Category image preview"
                  fill
                  className="object-cover"
                  onError={() => {
                    setPreviewUrl(null);
                    toast.error('Failed to load image');
                  }}
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={openFilePicker}
                      disabled={disabled || uploading}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Change
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleRemove}
                      disabled={disabled || uploading}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Quick remove button */}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={handleRemove}
                disabled={disabled || uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Image info */}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>Category image uploaded</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openFilePicker}
                disabled={disabled || uploading}
              >
                Replace image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Image Guidelines:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use high-quality images for better visual appeal</li>
              <li>• Recommended aspect ratio: 16:9 or 4:3</li>
              <li>• Images will be automatically optimized for web</li>
              <li>• Avoid images with text overlay for better accessibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}