// src/app/(store)/tailoredoutfit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Scissors, Ruler, CheckCircle, Palette } from 'lucide-react';
import ModernDesignGallery from '@/components/store/CustomDesign/ModernDesignGallery';
import MergedRunwayColorPreview from '@/components/store/CustomDesign/MergedRunwayColorPreview';

// Fabric options
const fabricOptions = [
  { id: 'cotton-100', name: 'Cotton 100%', description: 'Natural, breathable fabric', texture: 'Soft' },
  { id: 'linen', name: 'Linen', description: 'Lightweight, airy', texture: 'Textured' },
  { id: 'premium-cotton', name: 'Premium Cotton', description: 'Extra soft, high quality', texture: 'Luxurious' },
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
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  designDescription: z.string().min(10, 'Description must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

interface User {
  id: string;
  name?: string;
  email?: string;
}

export default function TailoredOutfitPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          
          // Pre-fill form with user data
          if (userData.name) {
            form.setValue('customerName', userData.name);
          }
          if (userData.email) {
            form.setValue('email', userData.email);
          }
        }
      } catch (error) {
        console.log('No user logged in, continuing as guest');
      }
    };

    fetchCurrentUser();
  }, [form]);

  // Handlers
  const handleDesignSelect = (designId: string) => {
    setSelectedDesign(designId);
  };

  const handleColorsChange = (colors: string[]) => {
    setSelectedColors(colors);
  };

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
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

      // Prepare form data for API
      const formData = new FormData();
      
      // Customer info
      formData.append('customerName', data.customerName);
      formData.append('customerEmail', data.email || '');
      formData.append('phoneNumber', data.phone);
      
      // Design details
      const designDescriptionText = `
Design: ${selectedDesign.replace(/-/g, ' ')}
Fabric: ${fabricOptions.find(f => f.id === selectedFabric)?.name || selectedFabric}
Colors: ${selectedColors.join(', ')}
${data.designDescription ? `\nAdditional Details: ${data.designDescription}` : ''}
      `.trim();
      
      formData.append('designDescription', designDescriptionText);
      formData.append('colorDescription', selectedColors.join(', '));
      formData.append('fabricPreference', fabricOptions.find(f => f.id === selectedFabric)?.name || selectedFabric);
      
      // User type
      formData.append('userType', currentUser ? 'logged' : 'guest');
      if (currentUser?.id) {
        formData.append('userId', currentUser.id);
      }
      
      // Measurements
      formData.append('measurements', JSON.stringify({
        ...measurements,
        providedByCustomer: Object.keys(measurements).length === 0,
      }));
      
      // Image upload - convert base64 to file if exists
      if (uploadedImage) {
        const blob = await fetch(uploadedImage).then(r => r.blob());
        formData.append('image', blob, 'design-reference.jpg');
      }

      // Call API
      console.log('Submitting custom design request...');
      const response = await fetch('/api/custom-design', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit design request');
      }

      // Success!
      toast({
        title: 'Order Submitted Successfully! ✅',
        description: `Request ID: ${result.requestId}. We will contact you within 24 hours to confirm your custom design.`,
        duration: 6000,
      });

      // Reset form
      form.reset({
        customerName: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: '',
        designDescription: '',
      });
      setSelectedDesign('');
      setSelectedColors([]);
      setUploadedImage('');
      setDesignDescription('');
      setMeasurements({});

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/img/skirts.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Create Your Custom Design
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose from our gallery, select premium fabrics, and customize every detail to match your vision.
          </p>
          {currentUser && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Logged in as {currentUser.name || currentUser.email}
            </p>
          )}
        </div>

        <div className="w-full max-w-[1600px] mx-auto space-y-8">
          {/* 1. Design Gallery & Merged Runway Preview - SIDE BY SIDE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Design Gallery with Fabric Dropdown */}
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design Gallery
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Choose your garment style and fabric
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
                  <Label className="text-sm font-medium mb-2 block">Choose Fabric</Label>
                  <Select value={selectedFabric} onValueChange={setSelectedFabric}>
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
                    <p className="text-xs text-gray-600 mt-2">
                      <span className="font-medium">Selected:</span> {fabricOptions.find(f => f.id === selectedFabric)?.name} - {fabricOptions.find(f => f.id === selectedFabric)?.texture} texture
                    </p>
                  )}
                </div>

                {/* Design Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                    Additional Design Details (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={designDescription}
                    onChange={(e) => setDesignDescription(e.target.value)}
                    placeholder="Add any specific requirements or preferences..."
                    rows={4}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right: Merged Runway Preview with Color Selection */}
            <MergedRunwayColorPreview
              selectedDesign={selectedDesign}
              selectedColors={selectedColors}
              selectedFabric={selectedFabric}
              uploadedImage={uploadedImage}
              measurements={measurements}
              onColorsChange={handleColorsChange}
              onImageUpload={handleImageUpload}
            />
          </div>

          {/* 2. Measurements */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Measurements (Optional)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Provide your measurements for a perfect fit, or we'll contact you later
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {measurementFields.map((field) => (
                  <div key={field.id}>
                    <Label htmlFor={field.id} className="text-sm font-medium mb-1 block">
                      {field.label} {field.unit === 'inches' && `(${field.unit})`}
                    </Label>
                    {field.unit === 'type' && field.options ? (
                      <select
                        id={field.id}
                        value={measurements[field.id] || ''}
                        onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={field.id}
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={measurements[field.id] || ''}
                        onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
                        placeholder={field.unit === 'inches' ? '0' : ''}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Customer Details & Submit */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Form */}
            <Card className="bg-white shadow-md lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Contact Information</CardTitle>
                <p className="text-sm text-gray-600">
                  We'll use this to contact you about your design
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+91 XXXXXXXXXX"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="designDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requirements *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe any special requirements, preferences, or occasions for this outfit..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 text-lg font-semibold"
                      size="lg"
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

            {/* Order Summary */}
            <Card className="bg-white shadow-md h-fit lg:sticky lg:top-6">
              <CardContent className="p-6">
                {selectedDesign && selectedDesign !== '' ? (
                  <div>
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
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {selectedDesign.replace(/-/g, ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Fabric</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {fabricOptions.find(f => f.id === selectedFabric)?.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Colors</span>
                        <div className="flex gap-1">
                          {selectedColors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      {uploadedImage && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Reference Image</span>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      )}

                      {Object.keys(measurements).length > 0 && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Measurements</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {Object.keys(measurements).length} provided
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium mb-2">
                        📞 Next Steps
                      </p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>✓ Submit your design request</li>
                        <li>✓ We'll contact you within 24 hours</li>
                        <li>✓ Discuss pricing and timeline</li>
                        <li>✓ Receive your custom outfit!</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">
                      Select a design to see your order summary
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}