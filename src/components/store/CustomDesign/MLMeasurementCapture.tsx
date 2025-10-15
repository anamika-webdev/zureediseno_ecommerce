'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MLMeasurementCaptureProps {
  onMeasurementsDetected: (measurements: Record<string, string>) => void;
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
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle video stream when it changes
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('🎥 Setting video stream');
      videoRef.current.srcObject = stream;
      
      // Wait for video metadata to load
      const handleLoadedMetadata = () => {
        console.log('✅ Video metadata loaded');
        videoRef.current?.play()
          .then(() => {
            console.log('▶️ Video playing');
            setIsCameraReady(true);
          })
          .catch((err) => {
            console.error('❌ Video play error:', err);
            setError('Failed to start video playback');
          });
      };

      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        console.log('🛑 Stopping camera stream');
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      setIsCameraReady(false);
      
      console.log('📷 Requesting camera access...');
      
      const constraints = {
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Camera access granted', {
        tracks: mediaStream.getTracks().length,
        videoTrack: mediaStream.getVideoTracks()[0]?.label
      });
      
      setStream(mediaStream);
      toast.success('Camera started!');
      
    } catch (error: any) {
      console.error('❌ Camera error:', error);
      let errorMessage = 'Failed to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on your device.';
      } else {
        errorMessage += error.message || 'Unknown error';
      }
      
      setError(errorMessage);
      toast.error('Camera Error', { description: errorMessage });
    }
  };

  // Stop camera
  const stopCamera = () => {
    console.log('🛑 Stopping camera');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.label);
      });
      setStream(null);
      setIsCameraReady(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Video or canvas ref not available');
      return;
    }
    
    console.log('📸 Capturing image');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('❌ Could not get canvas context');
      return;
    }
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log('Canvas size:', canvas.width, 'x', canvas.height);
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    console.log('✅ Image captured, size:', imageDataUrl.length, 'bytes');
    
    setCapturedImage(imageDataUrl);
    stopCamera();
    
    toast.success('Photo captured!');
  };

  // Process image with ML model
  const processImage = async (imageSource: string | File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🤖 Processing image with ML model...');
      
      let file: File;
      
      if (typeof imageSource === 'string') {
        // Convert base64 to File
        const response = await fetch(imageSource);
        const blob = await response.blob();
        file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
      } else {
        file = imageSource;
      }
      
      console.log('📤 Sending to API:', file.name, file.size, 'bytes');
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Call Next.js API route
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log('📥 API Response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get measurements');
      }
      
      console.log('✅ ML Result:', result.data);
      
      // Parse measurements from ML response
      const mlMeasurements = parseMeasurements(result.data);
      console.log('📏 Parsed measurements:', mlMeasurements);
      
      setMeasurements(mlMeasurements);
      onMeasurementsDetected(mlMeasurements);
      
      toast.success('Measurements detected successfully!', {
        description: 'AI has estimated your body measurements'
      });
      
    } catch (error) {
      console.error('❌ Processing error:', error);
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
    console.log('📊 Parsing ML data:', data);
    
    // Your ML model returns: shoulder_cm, hip_cm, arm_cm, height_cm, waist_to_toe_cm, chest_cm
    return {
      chest: data.chest_cm ? `${Math.round(data.chest_cm)} cm` : '',
      waist: data.hip_cm ? `${Math.round(data.hip_cm * 0.85)} cm` : '',
      hips: data.hip_cm ? `${Math.round(data.hip_cm)} cm` : '',
      shoulders: data.shoulder_cm ? `${Math.round(data.shoulder_cm)} cm` : '',
      inseam: data.waist_to_toe_cm ? `${Math.round(data.waist_to_toe_cm * 0.45)} cm` : '',
      sleeves: data.arm_cm ? `${Math.round(data.arm_cm)} cm` : '',
      height: data.height_cm ? `${Math.round(data.height_cm)} cm` : '',
    };
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log('📁 File selected:', file.name, file.size, file.type);
    
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
    console.log('🔄 Resetting component');
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

          {/* LIVE CAMERA VIEW - THIS IS THE KEY SECTION */}
          {stream && !capturedImage && (
            <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl">
              {/* Loading Overlay */}
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <div className="text-center text-white">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium">Starting camera...</p>
                    <p className="text-xs text-gray-400 mt-1">Please wait</p>
                  </div>
                </div>
              )}

              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full min-h-[400px] max-h-[600px] object-cover"
                style={{ 
                  transform: 'scaleX(-1)', // Mirror effect
                  display: 'block',
                  backgroundColor: '#000'
                }}
              />

              {/* Camera Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex justify-center items-center gap-4">
                  <Button
                    onClick={captureImage}
                    size="lg"
                    disabled={!isCameraReady}
                    className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-6 text-lg shadow-xl"
                  >
                    <Camera className="h-6 w-6 mr-2" />
                    Capture Photo
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="destructive"
                    size="lg"
                    className="font-semibold px-6 py-6 shadow-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              {/* Live Indicator */}
              {isCameraReady && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </div>
              )}

              {/* Instructions Overlay */}
              {isCameraReady && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-xs backdrop-blur-sm">
                  Stand straight • Full body visible
                </div>
              )}
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-auto"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-3" />
                      <p className="text-base font-semibold">Analyzing image...</p>
                      <p className="text-sm text-gray-300 mt-1">Detecting body measurements with AI</p>
                    </div>
                  </div>
                )}
              </div>
              
              {!isProcessing && (
                <div className="mt-3 flex gap-3">
                  {!measurements ? (
                    <Button
                      onClick={() => processImage(capturedImage)}
                      className="flex-1 py-6"
                      size="lg"
                      disabled={disabled}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Detect Measurements
                    </Button>
                  ) : (
                    <div className="flex-1 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-800 font-semibold">
                        Measurements detected successfully!
                      </span>
                    </div>
                  )}
                  <Button
                    onClick={reset}
                    variant="outline"
                    size="lg"
                    className="px-6"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {!stream && !capturedImage && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={startCamera}
                disabled={disabled || isProcessing}
                className="w-full py-6 text-base font-semibold"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                Use Camera
              </Button>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isProcessing}
                variant="outline"
                className="w-full py-6 text-base font-semibold"
                size="lg"
              >
                <Upload className="h-5 w-5 mr-2" />
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                Detected Measurements
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(measurements).map(([key, value]) => (
                  <div key={key} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                    <span className="text-xs text-blue-600 capitalize block mb-1 font-medium">
                      {key}
                    </span>
                    <span className="font-bold text-blue-900 text-lg">
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <span className="text-xl">📸</span>
              Tips for Best Results
            </p>
            <ul className="text-xs text-amber-800 space-y-1.5 ml-6 list-disc">
              <li>Stand straight, facing the camera at arm's length</li>
              <li>Ensure good lighting and clear background</li>
              <li>Wear fitted clothing for accurate measurements</li>
              <li>Keep arms slightly away from your body</li>
              <li>Make sure your full body is visible in frame</li>
            </ul>
          </div>

          {/* Hidden Canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </CardContent>
    </Card>
  );
}