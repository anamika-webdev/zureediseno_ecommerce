// src/app/(store)/tailoredoutfit/page.tsx - Final Complete Version
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

// Import our custom components
import RunwayPreview from '@/components/store/CustomDesign/RunwayPreview';
import DesignGallery from '@/components/store/CustomDesign/DesignGallery';
import ColorPalette from '@/components/store/CustomDesign/ColorPalette';

// Fabric Options
const fabricOptions = [
  { id: 'cotton-100', name: '100% Cotton', description: 'Pure, breathable cotton', texture: 'Smooth' },
  { id: 'linen', name: 'Linen', description: 'Lightweight and airy', texture: 'Textured' },
  { id: 'cotton-poly', name: 'Cotton Poly', description: 'Durable blend', texture: 'Smooth' },
  { id: 'polyester', name: 'Polyester', description: 'Wrinkle-resistant', texture: 'Smooth' },
  { id: 'giza-cotton', name: 'Giza Cotton', description: 'Premium long-staple cotton', texture: 'Luxurious' },
  { id: 'poplin', name: 'Poplin', description: 'Smooth, fine weave', texture: 'Crisp' },
  { id: 'oxford-cotton', name: 'Oxford Cotton', description: 'Textured basket weave', texture: 'Textured' },
  { id: 'rayon', name: 'Rayon', description: 'Soft and draping', texture: 'Flowing' },
  { id: 'satin', name: 'Satin', description: 'Smooth and lustrous', texture: 'Silky' },
  { id: 'silk', name: 'Silk', description: 'Luxurious natural fiber', texture: 'Premium' },
  { id: 'denim', name: 'Denim', description: 'Sturdy cotton twill', texture: 'Heavy' },
  { id: 'nylon', name: 'Nylon', description: 'Strong synthetic fiber', texture: 'Durable' },
  { id: 'dobby', name: 'Dobby', description: 'Geometric woven pattern', texture: 'Patterned' },
  { id: 'georgette', name: 'Georgette', description: 'Sheer, flowing fabric', texture: 'Delicate' },
];

// Measurement parameters
const measurementParams = [
  { id: 'length', name: 'Length', unit: 'inches', placeholder: 'e.g., 30' },
  { id: 'chest', name: 'Chest', unit: 'inches', placeholder: 'e.g., 40' },
  { id: 'upper-chest', name: 'Upper Chest', unit: 'inches', placeholder: 'e.g., 38' },
  { id: 'hip', name: 'Hip', unit: 'inches', placeholder: 'e.g., 42' },
  { id: 'shoulder', name: 'Shoulder', unit: 'inches', placeholder: 'e.g., 18' },
  { id: 'sleeves', name: 'Sleeves', unit: 'type', options: ['Half', '3/4', 'Full'] },
  { id: 'arm-hole', name: 'Arm Hole', unit: 'inches', placeholder: 'e.g., 20' },
  { id: 'round-neck', name: 'Round Neck', unit: 'inches', placeholder: 'e.g., 16' },
  { id: 'neck-drop-front', name: 'Neck Drop Front', unit: 'inches', placeholder: 'e.g., 7' },
  { id: 'neck-drop-back', name: 'Neck Drop Back', unit: 'inches', placeholder: 'e.g., 8' },
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
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
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
      colors: [],
      designDescription: '',
      measurements: {},
    },
  });

  // Handle image upload
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

  // Handle design selection
  const handleDesignSelect = (designId: string) => {
    setSelectedDesign(designId);
    form.setValue('designType', designId);
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    if (!selectedColors.includes(color)) {
      const newColors = [...selectedColors, color];
      setSelectedColors(newColors);
      form.setValue('colors', newColors);
    }
  };

  // Remove color
  const handleColorRemove = (colorToRemove: string) => {
    const newColors = selectedColors.filter(color => color !== colorToRemove);
    setSelectedColors(newColors);
    form.setValue('colors', newColors);
  };

  // Handle fabric selection
  const handleFabricSelect = (fabricId: string) => {
    setSelectedFabric(fabricId);
    form.setValue('fabricType', fabricId);
  };

  // Handle measurement change
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
        setSelectedColors([]);
        setUploadedImage(null);
        setMeasurements({});
        
        // Scroll to top
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel - Runway Preview */}
          <div className="lg:col-span-1">
            <RunwayPreview
              selectedDesign={selectedDesign}
              selectedColors={selectedColors}
              selectedFabric={selectedFabric}
              uploadedImage={uploadedImage}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Design Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>🎨 Design Gallery</CardTitle>
                <p className="text-sm text-gray-600">Choose your garment type to start designing</p>
              </CardHeader>
              <CardContent>
                <DesignGallery
                  selectedDesign={selectedDesign}
                  onDesignSelect={handleDesignSelect}
                  selectedColors={selectedColors}
                />
              </CardContent>
            </Card>

            {/* Fabric Corner */}
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

            {/* Color Selection */}
            <Card>
              <CardHeader>
                <CardTitle>🎨 Color Selection</CardTitle>
                <p className="text-sm text-gray-600">Hover over colors to see all shades, then click to select</p>
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

            {/* Measurement Parameters */}
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

            {/* Customer Details & Design Brief */}
            <Card>
              <CardHeader>
                <CardTitle>👤 Customer Details & Design Brief</CardTitle>
                <p className="text-sm text-gray-600">Tell us about yourself and your design vision</p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Full Name
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
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
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
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Design Description */}
                    <FormField
                      control={form.control}
                      name="designDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Design Description & Special Requirements</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your design vision in detail. Include any special requirements, style preferences, occasion, fit preferences, or inspiration. The more details you provide, the better we can create your perfect garment..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Image Upload */}
                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        <Upload className="h-4 w-4" />
                        Reference Image (Optional)
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          {uploadedImage ? (
                            <div className="space-y-3">
                              <img
                                src={uploadedImage}
                                alt="Uploaded reference"
                                className="max-w-48 max-h-48 mx-auto object-cover rounded-lg shadow-lg"
                              />
                              <p className="text-sm text-gray-600">✅ Image uploaded successfully</p>
                              <p className="text-xs text-blue-600">Click to change image</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <Upload className="h-16 w-16 mx-auto text-gray-400" />
                              <div>
                                <p className="text-gray-600 font-medium">Upload a reference image</p>
                                <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB</p>
                              </div>
                              <div className="text-xs text-gray-400">
                                Images help our designers understand your vision better
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white h-14 text-lg font-medium"
                        disabled={isSubmitting || !selectedDesign || selectedColors.length === 0}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Submitting Your Design Request...
                          </>
                        ) : (
                          <>
                            <Scissors className="mr-3 h-5 w-5" />
                            Submit Custom Design Request
                          </>
                        )}
                      </Button>
                      
                      {(!selectedDesign || selectedColors.length === 0) && (
                        <p className="text-sm text-red-600 text-center mt-2">
                          Please select a design type and at least one color to continue
                        </p>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Process Information */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-center">🎯 How Our Custom Design Process Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">Design Selection</h3>
                <p className="text-gray-600 text-sm">
                  Choose your garment type, fabric, colors, and provide measurements through our interactive design tool.
                </p>
              </div>
              
              <div>
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Expert Consultation</h3>
                <p className="text-gray-600 text-sm">
                  Our design team contacts you within 24 hours to discuss details, confirm measurements, and provide pricing.
                </p>
              </div>
              
              <div>
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Skilled Crafting</h3>
                <p className="text-gray-600 text-sm">
                  Our master tailors craft your custom piece with precision, attention to detail, and quality materials.
                </p>
              </div>
              
              <div>
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <h3 className="font-semibold mb-2">Perfect Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Your custom garment is completed and delivered with care, ensuring a perfect fit and finish.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}