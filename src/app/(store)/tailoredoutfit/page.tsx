// src/app/(store)/tailoredoutfit/page.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, User, Mail, Phone, Scissors, Ruler, Palette } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Import the custom components
import ModernDesignGallery from '@/components/store/CustomDesign/ModernDesignGallery';
import MergedRunwayColorPreview from '@/components/store/CustomDesign/MergedRunwayColorPreview';

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
  { id: 'length', label: 'Length', unit: 'inches', min: 24, max: 50 },
  { id: 'chest', label: 'Chest', unit: 'inches', min: 30, max: 60 },
  { id: 'upperChest', label: 'Upper Chest', unit: 'inches', min: 28, max: 56 },
  { id: 'hip', label: 'Hip', unit: 'inches', min: 30, max: 60 },
  { id: 'shoulder', label: 'Shoulder', unit: 'inches', min: 14, max: 24 },
  { id: 'sleeves', label: 'Sleeves', unit: 'type', options: ['Half', '3/4', 'Full'] },
  { id: 'armHole', label: 'Arm Hole', unit: 'inches', min: 14, max: 24 },
  { id: 'roundNeck', label: 'Round Neck', unit: 'inches', min: 12, max: 20 },
  { id: 'neckDropFront', label: 'Neck Drop Front', unit: 'inches', min: 4, max: 12 },
  { id: 'neckDropBack', label: 'Neck Drop Back', unit: 'inches', min: 4, max: 12 },
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
  const [designDescription, setDesignDescription] = useState<string>('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  const handleFabricSelect = (fabricId: string) => {
    setSelectedFabric(fabricId);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

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
      uploadedImage,
      designDescription,
      timestamp: new Date().toISOString(),
    };

    console.log('Order Data:', orderData);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Order Submitted Successfully!',
        description: 'We will contact you within 24 hours to confirm your custom design.',
      });
      
      form.reset();
      setSelectedDesign('');
      setSelectedColors([]);
      setUploadedImage('');
      setDesignDescription('');
      setMeasurements({});
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Create Your Custom Design
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose from our gallery, select premium fabrics, and customize every detail to match your vision.
          </p>
        </div>

        <div className="w-full max-w-[1600px] mx-auto space-y-8">
          {/* 1. Design Gallery & Live Preview - SIDE BY SIDE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Design Gallery with Fabric & Description */}
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design Gallery
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Choose your garment and customize
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Design Gallery */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Select Design</Label>
                  <ModernDesignGallery
                    selectedDesign={selectedDesign}
                    onDesignSelect={handleDesignSelect}
                    previewColors={selectedColors}
                    setPreviewColors={setSelectedColors}
                  />
                </div>

                {/* Fabric Selection Dropdown */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Fabric Selection</Label>
                  <Select value={selectedFabric} onValueChange={handleFabricSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select fabric" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricOptions.map((fabric) => (
                        <SelectItem key={fabric.id} value={fabric.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{fabric.name}</span>
                            <span className="text-xs text-gray-500">{fabric.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFabric && (
                    <p className="text-xs text-gray-600 mt-1">
                      Selected: {fabricOptions.find(f => f.id === selectedFabric)?.name}
                    </p>
                  )}
                </div>

                {/* Design Description */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Design Description</Label>
                  <Textarea
                    value={designDescription}
                    onChange={(e) => setDesignDescription(e.target.value)}
                    placeholder="Describe your ideal design in detail..."
                    rows={3}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Min 10 characters required
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right: Live Preview & Color Selection */}
            <div>
              <MergedRunwayColorPreview
                selectedDesign={selectedDesign}
                selectedColors={selectedColors}
                selectedFabric={selectedFabric}
                uploadedImage={uploadedImage}
                measurements={measurements}
                onColorsChange={setSelectedColors}
                onImageUpload={setUploadedImage}
              />
            </div>
          </div>

          {/* 2. Measurements */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                📏 Measurements
              </CardTitle>
              <p className="text-sm text-gray-600">
                Enter your body measurements for a perfect fit
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {measurementFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    {field.unit === 'type' ? (
                      <Select
                        value={measurements[field.id] || ''}
                        onValueChange={(value) => handleMeasurementChange(field.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option.toLowerCase()}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={measurements[field.id] || ''}
                          onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
                          placeholder={field.unit}
                          min={field.min}
                          max={field.max}
                          step="0.5"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Customer Information & Submit */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                👤 Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
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
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedDesign && selectedDesign !== '' && (
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                          <Scissors className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
                          <p className="text-xs text-gray-500">Review your custom design</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Design</span>
                          <span className="text-sm font-semibold text-gray-900 capitalize">{selectedDesign.replace(/-/g, ' ')}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Fabric</span>
                          <span className="text-sm font-semibold text-gray-900">{fabricOptions.find(f => f.id === selectedFabric)?.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Colors</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{selectedColors.length}</span>
                            <div className="flex gap-1">
                              {selectedColors.slice(0, 4).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-5 h-5 rounded border-2 border-white shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                              {selectedColors.length > 4 && (
                                <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center">
                                  <span className="text-[10px] text-gray-600">+{selectedColors.length - 4}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Measurements</span>
                          <span className="text-sm font-semibold text-gray-900">{Object.keys(measurements).length} fields</span>
                        </div>
                        
                        {uploadedImage && uploadedImage !== '' && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Reference Image</span>
                            <div className="flex items-center gap-1 text-green-600">
                              <Upload className="h-3 w-3" />
                              <span className="text-xs font-medium">Uploaded</span>
                            </div>
                          </div>
                        )}
                        
                        {designDescription && designDescription.length >= 10 && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Description</span>
                            <div className="flex items-center gap-1 text-blue-600">
                              <Scissors className="h-3 w-3" />
                              <span className="text-xs font-medium">Added</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-900 text-white text-base font-semibold py-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing Your Order...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Scissors className="h-5 w-5" />
                        <span>Submit Custom Design Order</span>
                      </div>
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