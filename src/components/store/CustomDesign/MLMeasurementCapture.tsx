
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface MLMeasurementCaptureProps {
  onMeasurementsDetected: (measurements: any) => void;
  disabled?: boolean;
}

export function MLMeasurementCapture({ 
  onMeasurementsDetected,
  disabled = false 
}: MLMeasurementCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [measurements, setMeasurements] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' 
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Camera access denied. Please allow camera access in your browser settings.');
      toast.error('Camera access denied');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  // Process image with ML model
  const processImage = async (imageSource: string | File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Processing image with ML model...');
      
      let file: File;
      
      if (typeof imageSource === 'string') {
        // Convert base64 to File
        const response = await fetch(imageSource);
        const blob = await response.blob();
        file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
      } else {
        file = imageSource;
      }
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Call Next.js API route
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get measurements');
      }
      
      console.log('ML Result:', result.data);
      
      // Parse measurements from ML response
      const mlMeasurements = parseMeasurements(result.data);
      setMeasurements(mlMeasurements);
      onMeasurementsDetected(mlMeasurements);
      
      toast.success('Measurements detected successfully!', {
        description: 'AI has estimated your body measurements'
      });
      
    } catch (error) {
      console.error('Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      setError(errorMessage);
      toast.error('Measurement Detection Failed', {
        description: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse measurements from ML response
  const parseMeasurements = (data: any) => {
    // Adjust this based on your ML model's response format
    // Example formats:
    
    // Format 1: Direct measurements
    if (data.measurements) {
      return {
        chest: `${data.measurements.chest} cm`,
        waist: `${data.measurements.waist} cm`,
        hips: `${data.measurements.hips} cm`,
        shoulders: `${data.measurements.shoulders} cm`,
        inseam: `${data.measurements.inseam} cm`,
        sleeves: `${data.measurements.sleeves} cm`,
      };
    }
    
    // Format 2: Keypoints with calculations
    if (data.keypoints) {
      // Your custom calculation logic here
      return calculateFromKeypoints(data.keypoints);
    }
    
    // Format 3: Direct field names
    return {
      chest: data.chest ? `${data.chest} cm` : '',
      waist: data.waist ? `${data.waist} cm` : '',
      hips: data.hips ? `${data.hips} cm` : '',
      shoulders: data.shoulders ? `${data.shoulders} cm` : '',
      inseam: data.inseam ? `${data.inseam} cm` : '',
      sleeves: data.sleeves ? `${data.sleeves} cm` : '',
    };
  };

  // Calculate measurements from keypoints (if needed)
  const calculateFromKeypoints = (keypoints: any) => {
    // Implement your calculation logic based on keypoints
    // This is a placeholder - adjust based on your ML model output
    return {
      chest: '0 cm',
      waist: '0 cm',
      hips: '0 cm',
      shoulders: '0 cm',
      inseam: '0 cm',
      sleeves: '0 cm',
    };
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Process image
    await processImage(file);
  };

  // Reset
  const reset = () => {
    setCapturedImage(null);
    setMeasurements(null);
    setError(null);
    stopCamera();
  };

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              AI Body Measurement Detection
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Take a photo or upload an image to automatically detect your measurements
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Camera View */}
          {stream && !capturedImage && (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                <Button
                  onClick={captureImage}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Capture
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  size="lg"
                  className="bg-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-auto"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Analyzing image...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {!isProcessing && (
                <div className="mt-2 flex gap-2">
                  {!measurements ? (
                    <Button
                      onClick={() => processImage(capturedImage)}
                      className="flex-1"
                      disabled={disabled}
                    >
                      Detect Measurements
                    </Button>
                  ) : (
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-800 font-medium">
                        Measurements detected successfully!
                      </span>
                    </div>
                  )}
                  <Button
                    onClick={reset}
                    variant="outline"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {!stream && !capturedImage && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={startCamera}
                disabled={disabled || isProcessing}
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Use Camera
              </Button>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isProcessing}
                variant="outline"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Measurements Display */}
          {measurements && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Detected Measurements:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(measurements).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-blue-700 capitalize">{key}:</span>
                    <span className="font-medium text-blue-900">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Stand straight facing the camera</li>
              <li>Ensure good lighting</li>
              <li>Wear fitted clothing</li>
              <li>Keep arms slightly away from body</li>
            </ul>
          </div>

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </CardContent>
    </Card>
  );
}