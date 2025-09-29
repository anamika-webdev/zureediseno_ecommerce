// src/app/(store)/tailoredoutfit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, User, Mail, Phone, Scissors, Ruler } from 'lucide-react';

// Import the custom components
import ModernDesignGallery from '@/components/store/CustomDesign/ModernDesignGallery';
import ColorPalette from '@/components/store/CustomDesign/ColorPalette';

// Fabric Options
const fabricOptions = [
  { id: 'cotton-100', name: '100% Cotton', description: 'Pure, breathable cotton', texture: 'Smooth' },
  { id: 'linen', name: 'Linen', description: 'Lightweight and airy', texture: 'Textured' },
  { id: 'cotton-poly', name: 'Cotton Poly', description: 'Durable blend', texture: 'Smooth' },
  { id: 'polyester', name: 'Polyester', description: 'Wrinkle-resistant', texture: 'Smooth' },
  { id: 'giza-cotton', name: 'Giza Cotton', description: 'Premium long-staple cotton', texture: 'Luxurious' },
  { id: 'poplin', name: 'Poplin', description: 'Smooth, fine weave', texture: 'Crisp' },
  { id: 'oxford-cotton', name: 'Oxford Cotton', description: 'Classic button-down fabric', texture: 'Textured' },
  { id: 'rayon', name: 'Rayon', description: 'Silky smooth feel', texture: 'Smooth' },
  { id: 'satin', name: 'Satin', description: 'Glossy finish', texture: 'Luxurious' },
  { id: 'silk', name: 'Silk', description: 'Premium natural fiber', texture: 'Luxurious' },
  { id: 'denim', name: 'Denim', description: 'Sturdy cotton weave', texture: 'Textured' },
  { id: 'nylon', name: 'Nylon', description: 'Strong synthetic', texture: 'Smooth' },
  { id: 'dobby', name: 'Dobby', description: 'Geometric pattern weave', texture: 'Textured' },
  { id: 'georgette', name: 'Georgette', description: 'Flowing, sheer fabric', texture: 'Smooth' },
];

// Measurement Parameters
const measurementParams = [
  { id: 'chest', name: 'Chest', placeholder: 'e.g., 42', unit: 'inches' },
  { id: 'waist', name: 'Waist', placeholder: 'e.g., 34', unit: 'inches' },
  { id: 'hips', name: 'Hips', placeholder: 'e.g., 40', unit: 'inches' },
  { id: 'shoulders', name: 'Shoulders', placeholder: 'e.g., 18', unit: 'inches' },
  { id: 'inseam', name: 'Inseam', placeholder: 'e.g., 32', unit: 'inches' },
  { id: 'sleeves', name: 'Sleeve Length', placeholder: 'e.g., 25', unit: 'inches' },
  { id: 'neck', name: 'Neck', placeholder: 'e.g., 16', unit: 'inches' },
  { id: 'length', name: 'Length', placeholder: 'e.g., 30', unit: 'inches' },
  { id: 'fit', name: 'Preferred Fit', options: ['Slim', 'Regular', 'Loose'], unit: 'style' },
];

// Form schema
const customDesignSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  designType: z.string().min(1, "Please select a design type"),
  fabricType: z.string().optional(),
  colors: z.array(z.string()).min(1, "Please select at least one color"),
  designDescription: z.string().min(10, "Please provide a detailed description"),
  measurements: z.record(z.string()).optional(),
  measurementMethod: z.enum(['manual', 'camera']).optional(),
});

type CustomDesignFormValues = z.infer<typeof customDesignSchema>;

export default function CustomDesignPage() {
  // State management
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<string[]>(['#E5E7EB']);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for measurement functionality
  const [measurementMode, setMeasurementMode] = useState<'manual' | 'camera'>('manual');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessingMeasurements, setIsProcessingMeasurements] = useState(false);
  const [aiMeasurements, setAiMeasurements] = useState<Record<string, string>>({});
  const [originalAiMeasurements, setOriginalAiMeasurements] = useState<Record<string, string>>({});
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [measurementSource, setMeasurementSource] = useState<Record<string, 'ai' | 'manual'>>({});
  
  const { toast } = useToast();
  
  const form = useForm<CustomDesignFormValues>({
    resolver: zodResolver(customDesignSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      phoneNumber: '',
      designType: '',
      fabricType: '',
      colors: ['#E5E7EB'],
      designDescription: '',
      measurements: {},
      measurementMethod: 'manual',
    },
  });

  // Sync form colors with state
  useEffect(() => {
    form.setValue('colors', selectedColors);
  }, [selectedColors, form]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Event Handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDesignSelect = (designId: string) => {
    setSelectedDesign(designId);
    form.setValue('designType', designId);
  };

  // Color selection from palette
  const handleColorSelect = (color: string) => {
    if (!selectedColors.includes(color)) {
      const newColors = [...selectedColors, color];
      setSelectedColors(newColors);
      form.setValue('colors', newColors);
    }
  };

  // Color removal from palette
  const handleColorRemove = (colorToRemove: string) => {
    const newColors = selectedColors.filter(color => color !== colorToRemove);
    // Ensure at least one color remains
    if (newColors.length === 0) {
      newColors.push('#E5E7EB');
    }
    setSelectedColors(newColors);
    form.setValue('colors', newColors);
  };

  const handleFabricSelect = (fabricId: string) => {
    setSelectedFabric(fabricId);
    form.setValue('fabricType', fabricId);
  };

  const handleMeasurementChange = (paramId: string, value: string) => {
    const newMeasurements = { ...measurements, [paramId]: value };
    setMeasurements(newMeasurements);
    form.setValue('measurements', newMeasurements);
    
    // Track that this measurement was manually modified
    setMeasurementSource(prev => ({
      ...prev,
      [paramId]: 'manual'
    }));
  };

  // AI Camera Measurement Handler
  const handleCameraMeasurement = async () => {
    setIsCameraActive(true);
    setIsProcessingMeasurements(true);
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' 
        } 
      });
      
      setCameraStream(stream);
      
      toast({
        title: "📸 Camera Activated",
        description: "Please stand in good lighting for accurate measurements. Processing will begin automatically.",
      });

      // Here you would integrate with your ML model
      // For demonstration, we'll simulate the AI processing
      setTimeout(async () => {
        // Stop the camera stream
        stream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        
        // Simulate AI-generated measurements (replace with actual ML model API call)
        const simulatedMeasurements = {
          chest: (40 + Math.random() * 6).toFixed(1),
          waist: (32 + Math.random() * 4).toFixed(1),
          hips: (38 + Math.random() * 4).toFixed(1),
          shoulders: (17 + Math.random() * 2).toFixed(1),
          inseam: (30 + Math.random() * 4).toFixed(1),
          sleeves: (24 + Math.random() * 2).toFixed(1),
          neck: (15 + Math.random() * 2).toFixed(1),
          length: (28 + Math.random() * 4).toFixed(1),
          fit: 'Regular'
        };
        
        setAiMeasurements(simulatedMeasurements);
        setOriginalAiMeasurements(simulatedMeasurements); // Preserve original AI measurements
        setMeasurements(simulatedMeasurements);
        
        // Mark all measurements as AI-generated
        const aiSourceMap = Object.keys(simulatedMeasurements).reduce((acc, key) => {
          acc[key] = 'ai';
          return acc;
        }, {} as Record<string, 'ai' | 'manual'>);
        setMeasurementSource(aiSourceMap);
        
        // Update form with AI measurements
        form.setValue('measurements', simulatedMeasurements);
        form.setValue('measurementMethod', 'camera');
        
        setIsProcessingMeasurements(false);
        setIsCameraActive(false);
        
        toast({
          title: "✅ Measurements Captured Successfully!",
          description: "AI has analyzed your body measurements. Please review and adjust if needed.",
        });
      }, 5000); // 5 second simulation - replace with actual ML processing time
      
    } catch (error) {
      console.error('Camera access failed:', error);
      setIsCameraActive(false);
      setIsProcessingMeasurements(false);
      
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access or use manual measurement input.",
        variant: "destructive",
      });
    }
  };

  // Handle measurement mode change
  const handleMeasurementModeChange = (mode: 'manual' | 'camera') => {
    setMeasurementMode(mode);
    form.setValue('measurementMethod', mode);
    
    // When switching to manual mode, don't clear AI measurements
    if (mode === 'manual') {
      // Stop camera if active but keep AI measurements
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        setIsCameraActive(false);
        setIsProcessingMeasurements(false);
      }
    }
  };

  // Reset AI measurements function
  const resetToAiMeasurements = () => {
    if (Object.keys(originalAiMeasurements).length > 0) {
      setMeasurements(originalAiMeasurements);
      form.setValue('measurements', originalAiMeasurements);
      
      // Reset source tracking to AI for all original measurements
      const aiSourceMap = Object.keys(originalAiMeasurements).reduce((acc, key) => {
        acc[key] = 'ai';
        return acc;
      }, {} as Record<string, 'ai' | 'manual'>);
      setMeasurementSource(aiSourceMap);
      
      toast({
        title: "✅ Reset to AI Measurements",
        description: "All measurements have been reset to the original AI-captured values.",
      });
    }
  };

  // Submit form
  const onSubmit = async (data: CustomDesignFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add form fields
      formData.append('customerName', data.customerName);
      formData.append('customerEmail', data.customerEmail);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('designDescription', data.designDescription);
      formData.append('colorDescription', selectedColors.join(', '));
      formData.append('fabricPreference', selectedFabric || '');
      formData.append('measurements', JSON.stringify(measurements));
      formData.append('measurementMethod', measurementMode);
      formData.append('designType', selectedDesign);
      formData.append('userType', 'guest');

      // Add image file if uploaded
      if (uploadedImage) {
        const imageInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (imageInput?.files?.[0]) {
          formData.append('image', imageInput.files[0]);
        }
      }

      const response = await fetch('/api/custom-design', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Design Request Submitted Successfully! ✅",
          description: `Your request ID is: ${result.requestId}. Our team will contact you within 24 hours.`,
        });
        
        // Reset form and state
        form.reset();
        setSelectedDesign('');
        setSelectedFabric('');
        setSelectedColors(['#E5E7EB']);
        setUploadedImage(null);
        setMeasurements({});
        setAiMeasurements({});
        setOriginalAiMeasurements({});
        setMeasurementSource({});
        setMeasurementMode('manual');
        setIsCameraActive(false);
        setIsProcessingMeasurements(false);
        
        window.scrollTo(0, 0);
      } else {
        throw new Error(result.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Custom Design Studio
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Create your perfect garment with our advanced design tool. Choose from our gallery, select premium fabrics, and customize every detail to match your vision.
          </p>
        </div>

        {/* Main Layout - Design Tools Only (No Sidebar) */}
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* 1. Modern Design Gallery */}
          <Card>
            <CardContent className="p-6">
              <ModernDesignGallery
                selectedDesign={selectedDesign}
                onDesignSelect={handleDesignSelect}
                selectedColors={selectedColors}
              />
            </CardContent>
          </Card>

          {/* 2. Fabric Corner */}
          <Card>
            <CardHeader>
              <CardTitle>🧵 Fabric Corner</CardTitle>
              <p className="text-sm text-gray-600">Select your preferred fabric for the perfect feel and look</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {fabricOptions.map((fabric) => (
                  <button
                    key={fabric.id}
                    onClick={() => handleFabricSelect(fabric.id)}
                    className={`p-3 rounded-lg border text-left transition-all hover:scale-105 ${
                      selectedFabric === fabric.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{fabric.name}</div>
                    <div className="text-xs text-gray-500 mb-1">{fabric.description}</div>
                    <div className="text-xs font-medium text-blue-600">{fabric.texture}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Color Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <span>🎨 Color Selection</span>
                  <p className="text-sm text-gray-600 font-normal">
                    Choose your preferred colors for the design
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''} selected
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ColorPalette
                selectedColors={selectedColors}
                onColorSelect={handleColorSelect}
                onColorRemove={handleColorRemove}
                maxColors={5}
              />
            </CardContent>
          </Card>

          {/* 4. Enhanced Measurement Parameters with AI Camera & Manual Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Key Measurement Parameters
              </CardTitle>
              <p className="text-sm text-gray-600">
                Get perfect fit measurements using AI camera analysis or enter manually
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Measurement Mode Selection */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-900">Choose Measurement Method:</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* AI Camera Option */}
                  <button
                    type="button"
                    onClick={() => handleMeasurementModeChange('camera')}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      measurementMode === 'camera'
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89L8.46 4.23A2 2 0 0110.124 3h3.752a2 2 0 011.664.23l.865 1.88A2 2 0 0017.07 7H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Camera Measurement</h3>
                        <p className="text-sm text-gray-600">
                          Switch to camera mode for instant, accurate measurements
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Manual Option */}
                  <button
                    type="button"
                    onClick={() => handleMeasurementModeChange('manual')}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      measurementMode === 'manual'
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Manual Input</h3>
                        <p className="text-sm text-gray-600">
                          Enter your measurements manually with our guide
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* AI Camera Measurement Interface */}
              {measurementMode === 'camera' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">AI-Powered Measurement System</h4>
                        <p className="text-sm text-gray-600">Our advanced camera mode will analyze your body measurements in real-time</p>
                      </div>
                    </div>
                    
                    {!isCameraActive ? (
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border">
                          <h5 className="font-medium text-sm mb-2">📋 Before You Start:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Stand in good lighting conditions</li>
                            <li>• Wear form-fitting clothes</li>
                            <li>• Face the camera directly</li>
                            <li>• Allow camera access when prompted</li>
                            <li>• Stand 3-4 feet away from camera</li>
                          </ul>
                        </div>
                        
                        <Button
                          type="button"
                          onClick={handleCameraMeasurement}
                          disabled={isProcessingMeasurements}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isProcessingMeasurements ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing Measurements...
                            </>
                          ) : (
                            <>
                              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89L8.46 4.23A2 2 0 0110.124 3h3.752a2 2 0 011.664.23l.865 1.88A2 2 0 0017.07 7H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
                              </svg>
                              🚀 Start AI Measurement Scan
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="relative inline-block mb-4">
                          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89L8.46 4.23A2 2 0 0110.124 3h3.752a2 2 0 011.664.23l.865 1.88A2 2 0 0017.07 7H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
                            </svg>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-bounce flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg font-medium text-gray-900">Camera is Active</p>
                        <p className="text-sm text-gray-600">AI is analyzing your measurements...</p>
                        <div className="mt-4 w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Results Display */}
                  {Object.keys(aiMeasurements).length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-green-800">🎯 AI Measurements Captured</h4>
                        </div>
                        
                        {/* Reset to AI Measurements Button */}
                        {measurementMode === 'manual' && Object.keys(originalAiMeasurements).length > 0 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={resetToAiMeasurements}
                            className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset to AI Values
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(originalAiMeasurements).filter(([key]) => key !== 'fit').map(([key, value]) => (
                          <div key={key} className="bg-white rounded-lg p-3 border border-green-200 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700 capitalize">{key}:</span>
                              <span className="text-sm font-semibold text-green-700">{value}"</span>
                            </div>
                            {/* Show if this measurement has been manually modified */}
                            {measurementSource[key] === 'manual' && measurements[key] !== value && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">!</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {originalAiMeasurements.fit && (
                          <div className="bg-white rounded-lg p-3 border border-green-200 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Fit:</span>
                              <span className="text-sm font-semibold text-green-700">{originalAiMeasurements.fit}</span>
                            </div>
                            {measurementSource.fit === 'manual' && measurements.fit !== originalAiMeasurements.fit && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">!</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-green-700">
                          Original AI measurements are preserved. Manual changes are marked with orange indicators.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Measurement Interface */}
              {measurementMode === 'manual' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Manual Measurement Entry</h4>
                        <p className="text-sm text-gray-600">Enter your measurements manually for precise control</p>
                      </div>
                    </div>
                    
                    {/* Measurement Guide */}
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <h5 className="font-medium text-sm mb-2">📐 How to Measure:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>• <strong>Chest:</strong> Around fullest part</div>
                        <div>• <strong>Waist:</strong> At natural waistline</div>
                        <div>• <strong>Shoulders:</strong> Across shoulder blades</div>
                        <div>• <strong>Inseam:</strong> Inside leg to ankle</div>
                        <div>• <strong>Sleeves:</strong> Shoulder to wrist</div>
                        <div>• <strong>Neck:</strong> Around base of neck</div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Input Fields */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {measurementParams.map((param) => (
                      <div key={param.id} className="space-y-2">
                        <Label className="text-sm font-medium block flex items-center gap-2">
                          {param.name}
                          {/* Show indicator for AI vs Manual source */}
                          {measurementSource[param.id] === 'ai' && measurements[param.id] && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                              🤖 AI
                            </span>
                          )}
                          {measurementSource[param.id] === 'manual' && measurements[param.id] && (
                            <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                              ✏️ Manual
                            </span>
                          )}
                        </Label>
                        {param.options ? (
                          <select
                            className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                              measurementSource[param.id] === 'ai' ? 'border-purple-200 bg-purple-50' : 
                              measurementSource[param.id] === 'manual' ? 'border-orange-200 bg-orange-50' : ''
                            }`}
                            onChange={(e) => handleMeasurementChange(param.id, e.target.value)}
                            value={measurements[param.id] || ''}
                          >
                            <option value="">Select...</option>
                            {param.options.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder={param.placeholder}
                              className={`text-sm bg-white ${
                                measurementSource[param.id] === 'ai' ? 'border-purple-200 bg-purple-50' : 
                                measurementSource[param.id] === 'manual' ? 'border-orange-200 bg-orange-50' : ''
                              }`}
                              onChange={(e) => handleMeasurementChange(param.id, e.target.value)}
                              value={measurements[param.id] || ''}
                            />
                            {/* Show original AI value as placeholder if manually modified */}
                            {measurementSource[param.id] === 'manual' && originalAiMeasurements[param.id] && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <span className="text-xs text-purple-600 bg-purple-100 px-1 py-0.5 rounded">
                                  AI: {originalAiMeasurements[param.id]}"
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="text-xs text-gray-500 block">
                          {param.unit === 'inches' ? 'in inches' : param.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Reset to AI Button for Manual Mode */}
                  {Object.keys(originalAiMeasurements).length > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-green-200">
                      <p className="text-sm text-gray-600">
                        Want to go back to AI measurements?
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={resetToAiMeasurements}
                        className="border-purple-300 text-purple-700 hover:bg-purple-100"
                      >
                        <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restore AI Measurements
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Switch Between Modes */}
              <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMeasurementModeChange(measurementMode === 'manual' ? 'camera' : 'manual')}
                  className="text-sm"
                >
                  {measurementMode === 'manual' ? (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89L8.46 4.23A2 2 0 0110.124 3h3.752a2 2 0 011.664.23l.865 1.88A2 2 0 0017.07 7H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
                      </svg>
                      Switch to Camera Measurement
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Switch to Manual Input
                    </>
                  )}
                </Button>
              </div>

              {/* Progress Indicator */}
              {Object.keys(measurements).length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      {Object.keys(measurements).length} of {measurementParams.length} measurements provided
                      {Object.keys(originalAiMeasurements).length > 0 && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          Camera Base Available
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(Object.keys(measurements).length / measurementParams.length) * 100}%` 
                      }}
                    />
                  </div>
                  
                  {/* Measurement Summary with Source Indicators */}
                  {Object.keys(measurements).length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(measurements).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="text-xs flex items-center gap-1">
                            <span className="font-medium text-gray-700 capitalize">{key}:</span>
                            <span className="text-blue-700">{value}"</span>
                            {measurementSource[key] === 'ai' && (
                              <span className="text-purple-600">🤖</span>
                            )}
                            {measurementSource[key] === 'manual' && (
                              <span className="text-orange-600">✏️</span>
                            )}
                          </div>
                        ))}
                        {Object.keys(measurements).length > 4 && (
                          <div className="text-xs text-gray-500">
                            +{Object.keys(measurements).length - 4} more...
                          </div>
                        )}
                      </div>
                      
                      {/* Legend */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-purple-600">🤖</span>
                          <span className="text-gray-600">AI Generated</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-orange-600">✏️</span>
                          <span className="text-gray-600">Manually Edited</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Design Upload & Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Design Inspiration & Details
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload reference images and describe your vision in detail
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Upload Reference Images (Optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {uploadedImage ? (
                      <div className="space-y-2">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded reference" 
                          className="mx-auto h-32 w-32 object-cover rounded-lg border-2 border-green-200"
                        />
                        <p className="text-sm text-green-600 font-medium">✅ Image uploaded successfully! Click to change.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload design references or inspiration images</p>
                        <p className="text-xs text-gray-500">Supports JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Design Description */}
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Design Description *
                </Label>
                <Textarea
                  placeholder="Describe your design vision in detail... Include style preferences, special features, occasions, or any specific requirements. Be as detailed as possible to help our designers understand your vision."
                  className="min-h-[120px] resize-none"
                  {...form.register('designDescription')}
                />
                {form.formState.errors.designDescription && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.designDescription.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 10 characters required. Current: {form.watch('designDescription')?.length || 0} characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Contact Information & Submit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                We'll use this information to contact you about your custom design
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone Number *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                     Order Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Design:</span>
                          <span className="font-medium">
                            {selectedDesign ? selectedDesign.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fabric:</span>
                          <span className="font-medium">
                            {selectedFabric ? fabricOptions.find(f => f.id === selectedFabric)?.name : 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Colors:</span>
                          <span className="font-medium">{selectedColors.length} selected</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Measurements:</span>
                          <span className="font-medium">
                            {Object.keys(measurements).length > 0 ? 
                              `${Object.keys(measurements).length} provided` : 'Optional'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method:</span>
                          <span className="font-medium capitalize">
                            {measurementMode === 'camera' ? '🤖 AI Camera' : '✏️ Manual'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference Image:</span>
                          <span className="font-medium">
                            {uploadedImage ? '✅ Uploaded' : 'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !selectedDesign}
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting Your Design Request...
                        </>
                      ) : (
                        <>
                          <Scissors className="mr-2 h-5 w-5" />
                          🚀 Submit Custom Design Request
                        </>
                      )}
                    </Button>
                    
                    {!selectedDesign && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Please select a design from the gallery above to continue
                      </p>
                    )}
                    
                    {selectedDesign && (
                      <p className="text-sm text-green-600 text-center mt-2 font-medium">
                        ✅ Ready to submit! Our team will contact you within 24 hours.
                      </p>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}