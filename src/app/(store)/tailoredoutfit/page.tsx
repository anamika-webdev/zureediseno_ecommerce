// src/app/(store)/tailoredoutfit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, User, Mail, Phone, Scissors, Ruler } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import the custom components
import ModernDesignGallery from '@/components/store/CustomDesign/ModernDesignGallery';
import EnhancedRunwayPreview from '@/components/store/CustomDesign/EnhancedRunwayPreview';
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
  { id: 'rayon', name: 'Rayon', description: 'Soft, drapes well', texture: 'Silky' },
  { id: 'silk', name: 'Silk', description: 'Luxurious natural fiber', texture: 'Silky' },
  { id: 'wool', name: 'Wool', description: 'Warm, natural insulation', texture: 'Textured' },
  { id: 'denim', name: 'Denim', description: 'Sturdy cotton twill', texture: 'Heavy' },
  { id: 'chambray', name: 'Chambray', description: 'Lightweight denim alternative', texture: 'Soft' },
  { id: 'flannel', name: 'Flannel', description: 'Soft, brushed cotton', texture: 'Fuzzy' },
  { id: 'satin', name: 'Satin', description: 'Glossy, smooth finish', texture: 'Lustrous' },
];

// Measurement fields configuration
const measurementFields = [
  { id: 'chest', label: 'Chest', unit: 'inches', min: 30, max: 60 },
  { id: 'waist', label: 'Waist', unit: 'inches', min: 24, max: 50 },
  { id: 'hips', label: 'Hips', unit: 'inches', min: 30, max: 60 },
  { id: 'shoulder', label: 'Shoulder', unit: 'inches', min: 14, max: 24 },
  { id: 'sleeve', label: 'Sleeve Length', unit: 'inches', min: 20, max: 40 },
  { id: 'neck', label: 'Neck', unit: 'inches', min: 12, max: 20 },
  { id: 'inseam', label: 'Inseam', unit: 'inches', min: 26, max: 38 },
  { id: 'length', label: 'Overall Length', unit: 'inches', min: 24, max: 50 },
];

// Form validation schema
const formSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  designDescription: z.string().min(10, 'Description must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

export default function TailoredOutfitPage() {
  const { toast } = useToast();
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [selectedFabric, setSelectedFabric] = useState<string>('cotton-100');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [measurementSource, setMeasurementSource] = useState<Record<string, 'ai' | 'manual'>>({});
  const [originalAIMeasurements, setOriginalAIMeasurements] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraActive, setcameraActive] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      email: '',
      phone: '',
      designDescription: '',
    },
  });

  // Handlers
  const handleDesignSelect = (designId: string) => {
    setSelectedDesign(designId);
    toast({
      title: 'Design Selected',
      description: 'You have selected a design from the gallery.',
    });
  };

  const handleFabricSelect = (fabricId: string) => {
    setSelectedFabric(fabricId);
    const fabric = fabricOptions.find(f => f.id === fabricId);
    toast({
      title: 'Fabric Selected',
      description: `${fabric?.name} - ${fabric?.description}`,
    });
  };

  const handleColorSelect = (color: string) => {
    if (selectedColors.length < 5 && !selectedColors.includes(color)) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleColorRemove = (color: string) => {
    setSelectedColors(selectedColors.filter(c => c !== color));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast({
          title: 'Image Uploaded',
          description: 'Your reference image has been uploaded successfully.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
    setMeasurementSource(prev => ({ ...prev, [field]: 'manual' }));
  };

  const handleRestoreAIMeasurement = (field: string) => {
    if (originalAIMeasurements[field]) {
      setMeasurements(prev => ({ ...prev, [field]: originalAIMeasurements[field] }));
      setMeasurementSource(prev => ({ ...prev, [field]: 'ai' }));
      toast({
        title: 'AI Measurement Restored',
        description: `${field} measurement has been restored to AI-detected value.`,
      });
    }
  };

  const startAICamera = () => {
    setcameraActive(true);
    setAiProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const simulatedMeasurements: Record<string, string> = {
        chest: '38',
        waist: '32',
        hips: '40',
        shoulder: '18',
        sleeve: '34',
        neck: '15.5',
        inseam: '32',
        length: '28',
      };
      
      setMeasurements(simulatedMeasurements);
      setOriginalAIMeasurements(simulatedMeasurements);
      
      const sources: Record<string, 'ai' | 'manual'> = {};
      Object.keys(simulatedMeasurements).forEach(key => {
        sources[key] = 'ai';
      });
      setMeasurementSource(sources);
      
      setAiProcessing(false);
      setcameraActive(false);
      
      toast({
        title: 'AI Measurements Complete',
        description: 'Your body measurements have been captured successfully.',
      });
    }, 3000);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    // Validation
    if (!selectedDesign || selectedDesign === '') {
      toast({
        title: 'Design Required',
        description: 'Please select a design from the gallery.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    if (selectedColors.length === 0) {
      toast({
        title: 'Colors Required',
        description: 'Please select at least one color.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      ...data,
      selectedDesign,
      selectedFabric,
      selectedColors,
      measurements,
      measurementSource,
      uploadedImage,
      timestamp: new Date().toISOString(),
    };

    console.log('Order Data:', orderData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Order Submitted Successfully!',
        description: 'We will contact you within 24 hours to confirm your custom design.',
      });
      
      // Reset form
      form.reset();
      setSelectedDesign('');
      setSelectedColors([]);
      setUploadedImage('');
      setMeasurements({});
      setMeasurementSource({});
      setOriginalAIMeasurements({});
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Create Your Custom Design
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Choose from our gallery, select premium fabrics, and customize every detail to match your vision.
          </p>
        </div>

        {/* Main Layout - Design Tools Only (No Sidebar) */}
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* 1. Design Inspiration & Fabric Selection */}
          <Card className="backdrop-blur-sm bg-white/90 border border-white/50 shadow-xl">
            <CardHeader>
              <CardTitle>✨ Design Inspiration & Fabric Selection</CardTitle>
              <p className="text-sm text-gray-600">Choose from our gallery and select your preferred fabric</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Design Gallery */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Gallery</h3>
                <ModernDesignGallery
                  selectedDesign={selectedDesign}
                  onDesignSelect={handleDesignSelect}
                  selectedColors={selectedColors}
                />
              </div>

              {/* Fabric Dropdown */}
              <div>
                <label htmlFor="fabric-select" className="flex items-center gap-2 text-sm font-medium mb-2">
                  🧵 Fabric Selection
                </label>
                <Select value={selectedFabric} onValueChange={handleFabricSelect}>
                  <SelectTrigger id="fabric-select" className="w-full">
                    <SelectValue placeholder="Select a fabric">
                      {selectedFabric && (
                        <span>
                          {fabricOptions.find(f => f.id === selectedFabric)?.name}
                          {' - '}
                          <span className="text-gray-500 text-sm">
                            {fabricOptions.find(f => f.id === selectedFabric)?.description}
                          </span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fabricOptions.map((fabric) => (
                      <SelectItem key={fabric.id} value={fabric.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{fabric.name}</span>
                          <span className="text-xs text-gray-500">
                            {fabric.description} • {fabric.texture}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFabric && (
                  <p className="text-xs text-gray-500 mt-2">
                    Texture: {fabricOptions.find(f => f.id === selectedFabric)?.texture}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Color Selection */}
          <Card className="backdrop-blur-sm bg-white/90 border border-white/50 shadow-xl">
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

          {/* 3. Enhanced Measurement Parameters with AI Camera & Manual Options */}
          <Card className="backdrop-blur-sm bg-white/90 border border-white/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                📏 Key Measurement Parameters
              </CardTitle>
              <p className="text-sm text-gray-600">
                Get perfect fit measurements using AI camera analysis or enter manually
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Camera Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">AI-Powered Measurement</h3>
                    <p className="text-sm text-purple-700">Capture accurate body measurements instantly</p>
                  </div>
                  <Button
                    onClick={startAICamera}
                    disabled={cameraActive || aiProcessing}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {aiProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : cameraActive ? (
                      'Camera Active'
                    ) : (
                      <>
                        <Scissors className="h-4 w-4 mr-2" />
                        Start AI Camera
                      </>
                    )}
                  </Button>
                </div>

                {cameraActive && (
                  <div className="bg-black/80 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                      <p>Analyzing your body measurements...</p>
                      <p className="text-sm text-gray-300 mt-2">Please stand in a well-lit area</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Measurement Grid */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Measurement Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {measurementFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label htmlFor={field.id} className="flex items-center justify-between text-sm font-medium">
                        <span>{field.label}</span>
                        {measurementSource[field.id] === 'ai' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            AI
                          </span>
                        )}
                        {measurementSource[field.id] === 'manual' && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            Manual
                          </span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id={field.id}
                          type="number"
                          min={field.min}
                          max={field.max}
                          step="0.5"
                          value={measurements[field.id] || ''}
                          onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className={
                            measurementSource[field.id] === 'ai'
                              ? 'border-purple-300 bg-purple-50'
                              : measurementSource[field.id] === 'manual'
                              ? 'border-orange-300 bg-orange-50'
                              : ''
                          }
                        />
                        <span className="text-sm text-gray-500 flex items-center">{field.unit}</span>
                      </div>
                      {measurementSource[field.id] === 'manual' && originalAIMeasurements[field.id] && (
                        <button
                          type="button"
                          onClick={() => handleRestoreAIMeasurement(field.id)}
                          className="text-xs text-purple-600 hover:text-purple-800 underline"
                        >
                          Restore AI value ({originalAIMeasurements[field.id]})
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Measurement Progress */}
              {Object.keys(measurements).length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Measurements Progress
                    </span>
                    <span className="text-sm text-green-600">
                      {Object.keys(measurements).length} / {measurementFields.length} completed
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${(Object.keys(measurements).length / measurementFields.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Design Details */}
          <Card className="backdrop-blur-sm bg-white/90 border border-white/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                ✂️ Design Details & Inspiration
              </CardTitle>
              <p className="text-sm text-gray-600">
                Share your vision and upload reference images
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="design-description" className="block text-sm font-medium mb-2">
                  Design Description *
                </label>
                <Textarea
                  id="design-description"
                  {...form.register('designDescription')}
                  placeholder="Describe your ideal design in detail... (e.g., 'I want a flowing maxi dress with floral patterns, off-shoulder sleeves, and a belt at the waist')"
                  rows={4}
                  className="w-full"
                />
                {form.formState.errors.designDescription && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.designDescription.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 10 characters required. Current: {form.watch('designDescription')?.length || 0} characters
                </p>
              </div>

              <div>
                <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
                  Upload Reference Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {uploadedImage && uploadedImage !== '' && (
                      <div className="space-y-2">
                        <img
                          src={uploadedImage}
                          alt="Reference"
                          className="max-h-48 rounded-lg shadow-md"
                        />
                        <p className="text-sm text-green-600 font-medium">Image uploaded successfully!</p>
                      </div>
                    )} : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Contact Information & Submit */}
          <Card className="backdrop-blur-sm bg-white/90 border border-white/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                👤 Contact Information
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
                      name="phone"
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
                    name="email"
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
                  {selectedDesign && selectedDesign !== '' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">Order Summary</h3>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p>✓ Design Selected: {selectedDesign}</p>
                        <p>✓ Fabric: {fabricOptions.find(f => f.id === selectedFabric)?.name}</p>
                        <p>✓ Colors: {selectedColors.length} selected</p>
                        <p>✓ Measurements: {Object.keys(measurements).length} provided</p>
                        {uploadedImage && uploadedImage !== '' && <p>✓ Reference image uploaded</p>}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting Order...
                      </>
                    ) : (
                      <>
                        <Scissors className="h-5 w-5 mr-2" />
                        Submit Custom Design Order
                      </>
                    )}
                  </Button>

                  {isSubmitting && (
                    <p className="text-center text-sm text-gray-600">
                      Processing your order... Our team will contact you within 24 hours.
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}