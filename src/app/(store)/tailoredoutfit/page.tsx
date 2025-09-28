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
import Enhanced3DRunwayPreview from '@/components/store/CustomDesign/Enhanced3DRunwayPreview';
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
});

type CustomDesignFormValues = z.infer<typeof customDesignSchema>;

export default function CustomDesignPage() {
  // State management
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<string[]>(['#E5E7EB']); // Start with default color
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    },
  });

  // Sync form colors with state
  useEffect(() => {
    form.setValue('colors', selectedColors);
  }, [selectedColors, form]);

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

  // **NEW: Enhanced color change handler from runway preview**
  const handleColorsChange = (newColors: string[]) => {
    setSelectedColors(newColors);
    form.setValue('colors', newColors);
  };

  // **UPDATED: Color selection from palette**
  const handleColorSelect = (color: string) => {
    if (!selectedColors.includes(color)) {
      const newColors = [...selectedColors, color];
      setSelectedColors(newColors);
      form.setValue('colors', newColors);
    }
  };

  // **UPDATED: Color removal from palette**
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
        setSelectedColors(['#E5E7EB']); // Reset to default color
        setUploadedImage(null);
        setMeasurements({});
        
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

        {/* Main Layout - 3D Preview + Design Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT PANEL: Enhanced 3D Runway Preview with Interactive Colors */}
          <div className="lg:col-span-1">
            <Enhanced3DRunwayPreview
              selectedDesign={selectedDesign}
              selectedColors={selectedColors}
              selectedFabric={selectedFabric}
              uploadedImage={uploadedImage}
              measurements={measurements}
              onColorsChange={handleColorsChange} // **NEW: Pass color change callback**
            />
          </div>

          {/* RIGHT PANELS: Design Tools */}
          <div className="lg:col-span-3 space-y-8">
            
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

            {/* 3. Color Selection - Now works with runway preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <span>🎨 Color Selection</span>
                    <p className="text-sm text-gray-600 font-normal">
                      Select colors here or try them directly on the garment preview
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
                
                {/* Color synchronization note */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-blue-700">
                      <strong>Try colors live!</strong> Click the palette icon in the runway preview to experiment with colors directly on your garment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Measurement Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  📏 Key Measurement Parameters
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Provide your measurements for a perfect fit (optional - our team will contact you for confirmation)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {measurementParams.map((param) => (
                    <div key={param.id}>
                      <Label className="text-sm font-medium mb-1 block">{param.name}</Label>
                      {param.options ? (
                        <select
                          className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onChange={(e) => handleMeasurementChange(param.id, e.target.value)}
                          value={measurements[param.id] || ''}
                        >
                          <option value="">Select...</option>
                          {param.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type="number"
                          placeholder={param.placeholder}
                          className="text-sm"
                          onChange={(e) => handleMeasurementChange(param.id, e.target.value)}
                          value={measurements[param.id] || ''}
                        />
                      )}
                      <span className="text-xs text-gray-500 mt-1 block">
                        {param.unit === 'inches' ? 'in inches' : param.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 5. Design Upload & Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  📤 Design Inspiration & Details
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <p className="text-sm text-green-600">Image uploaded successfully! Click to change.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload design references or inspiration images</p>
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
                    placeholder="Describe your design vision in detail... Include style preferences, special features, occasions, or any specific requirements."
                    className="min-h-[120px] resize-none"
                    {...form.register('designDescription')}
                  />
                  {form.formState.errors.designDescription && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.designDescription.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 6. Contact Information & Submit */}
            <Card>
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

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedDesign}
                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting Your Design Request...
                          </>
                        ) : (
                          <>
                            <Scissors className="mr-2 h-5 w-5" />
                            Submit Custom Design Request
                          </>
                        )}
                      </Button>
                      
                      {!selectedDesign && (
                        <p className="text-sm text-gray-500 text-center mt-2">
                          Please select a design from the gallery above to continue
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
    </div>
  );
}