"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Upload, 
  X, 
  Palette, 
  Ruler, 
  UserCheck, 
  UserX,
  Loader2,
  Phone,
  Mail,
  User
} from 'lucide-react';

// Tailoring hero image
const tailoringImage = {
  src: '/assets/img/1.jpg',
  alt: 'Custom tailoring process'
};

// Predefined color options
const predefinedColors = [
  // Blues
  { name: "Navy Blue", hex: "#1e3a8a" },
  { name: "Royal Blue", hex: "#1d4ed8" },
  { name: "Sky Blue", hex: "#0ea5e9" },
  { name: "Light Blue", hex: "#7dd3fc" },
  
  // Grays
  { name: "Charcoal", hex: "#374151" },
  { name: "Light Gray", hex: "#9ca3af" },
  { name: "Silver", hex: "#e5e7eb" },
  
  // Reds
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Crimson", hex: "#dc2626" },
  { name: "Wine Red", hex: "#991b1b" },
  
  // Greens
  { name: "Forest Green", hex: "#065f46" },
  { name: "Emerald", hex: "#059669" },
  { name: "Olive", hex: "#65a30d" },
  
  // Earth tones
  { name: "Brown", hex: "#92400e" },
  { name: "Tan", hex: "#d97706" },
  { name: "Beige", hex: "#fbbf24" },
  { name: "Cream", hex: "#fef3c7" },
  
  // Others
  { name: "Classic Black", hex: "#000000" },
  { name: "Pure White", hex: "#ffffff" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Pink", hex: "#ec4899" },
];

// Extended color palette for custom picker
const extendedColorPalette = [
  // Reds
  "#ff0000", "#ff3333", "#ff6666", "#ff9999", "#ffcccc",
  "#cc0000", "#990000", "#660000", "#330000", "#ffeeee",
  
  // Oranges
  "#ff6600", "#ff7733", "#ff8866", "#ff9999", "#ffcccc",
  "#cc5500", "#994400", "#663300", "#332200", "#fff2ee",
  
  // Yellows
  "#ffff00", "#ffff33", "#ffff66", "#ffff99", "#ffffcc",
  "#cccc00", "#999900", "#666600", "#333300", "#ffffee",
  
  // Greens
  "#00ff00", "#33ff33", "#66ff66", "#99ff99", "#ccffcc",
  "#00cc00", "#009900", "#006600", "#003300", "#eeffee",
  
  // Blues
  "#0000ff", "#3333ff", "#6666ff", "#9999ff", "#ccccff",
  "#0000cc", "#000099", "#000066", "#000033", "#eeeeff",
  
  // Purples
  "#9900ff", "#aa33ff", "#bb66ff", "#cc99ff", "#ddccff",
  "#7700cc", "#550099", "#330066", "#220033", "#f2eeff",
  
  // Pinks
  "#ff0099", "#ff33aa", "#ff66bb", "#ff99cc", "#ffccdd",
  "#cc0077", "#990055", "#660033", "#330022", "#ffeeee",
  
  // Grays
  "#000000", "#333333", "#666666", "#999999", "#cccccc",
  "#111111", "#444444", "#777777", "#aaaaaa", "#ffffff",
];

// Enhanced form schema for both logged users and guests
const tailorFormSchema = z.object({
  // Customer Information (required for guests, optional for logged users)
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  
  // Design Information
  designDescription: z.string().min(10, "Please provide a detailed description"),
  colorDescription: z.string().optional(),
  fabricPreference: z.string().optional(),
  image: z.any().optional(),
  
  // Measurements
  measurements: z.object({
    providedByCustomer: z.boolean(),
    chest: z.string().optional(),
    waist: z.string().optional(),
    hips: z.string().optional(),
    shoulders: z.string().optional(),
    inseam: z.string().optional(),
    sleeves: z.string().optional(),
  }),
});

type TailorFormValues = z.infer<typeof tailorFormSchema>;

export default function TailoredOutfitPage() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Try to get current user - this will work with any auth system
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          console.log('✅ User is logged in:', userData);
        } else {
          setCurrentUser(null);
          console.log('👤 Guest user - no login detected');
        }
      } catch (error) {
        console.log('👤 Guest user - auth check failed:', error);
        setCurrentUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    checkUser();
  }, []);

  const form = useForm<TailorFormValues>({
    resolver: zodResolver(tailorFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      phoneNumber: '',
      designDescription: '',
      colorDescription: '',
      fabricPreference: '',
      measurements: {
        providedByCustomer: false,
        chest: '',
        waist: '',
        hips: '',
        shoulders: '',
        inseam: '',
        sleeves: '',
      },
    },
  });

  // Pre-fill form for logged-in users
  useEffect(() => {
    if (currentUser && !userLoading) {
      const userName = currentUser.name || 
                      `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
                      currentUser.fullName || '';
      
      if (userName) form.setValue("customerName", userName);
      if (currentUser.email) form.setValue("customerEmail", currentUser.email);
      if (currentUser.phone) form.setValue("phoneNumber", currentUser.phone);
    }
  }, [currentUser, userLoading, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, WebP, or GIF image.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Update form
      form.setValue("image", event.target.files);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    form.setValue("image", undefined);
    // Reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const addColor = (hex: string) => {
    if (!selectedColors.includes(hex) && selectedColors.length < 5) {
      const newColors = [...selectedColors, hex];
      setSelectedColors(newColors);
      updateColorDescription(newColors);
    }
  };

  const updateColorDescription = (colors: string[]) => {
    const colorDescriptions = colors.map(hex => {
      const colorData = predefinedColors.find(c => c.hex.toLowerCase() === hex.toLowerCase());
      return colorData ? `${colorData.name} (${hex})` : `Custom (${hex})`;
    });
    
    form.setValue("colorDescription", colorDescriptions.join(", "));
  };

  const removeColor = (hexToRemove: string) => {
    const newColors = selectedColors.filter(hex => hex !== hexToRemove);
    setSelectedColors(newColors);
    updateColorDescription(newColors);
  };

  const clearAllColors = () => {
    setSelectedColors([]);
    form.setValue("colorDescription", "");
  };

  const handleMeasurementCheck = (checked: boolean) => {
    form.setValue("measurements.providedByCustomer", checked);
    // Clear measurement values when customer will provide separately
    if (checked) {
      form.setValue("measurements.chest", "");
      form.setValue("measurements.waist", "");
      form.setValue("measurements.hips", "");
      form.setValue("measurements.shoulders", "");
      form.setValue("measurements.inseam", "");
      form.setValue("measurements.sleeves", "");
    }
  };

  const onSubmit = async (data: TailorFormValues) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add form fields
      formData.append('customerName', data.customerName);
      formData.append('customerEmail', data.customerEmail);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('designDescription', data.designDescription);
      formData.append('colorDescription', data.colorDescription || '');
      formData.append('fabricPreference', data.fabricPreference || '');
      formData.append('measurements', JSON.stringify(data.measurements));
      
      // Add user information for logged users
      if (currentUser) {
        formData.append('userId', currentUser.id || '');
        formData.append('userType', 'logged');
      } else {
        formData.append('userType', 'guest');
      }
      
      // Add image file if selected
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      console.log('📤 Submitting custom design request...', {
        userType: currentUser ? 'logged' : 'guest',
        userName: data.customerName,
        userEmail: data.customerEmail
      });
      
      const response = await fetch('/api/custom-design', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const userTypeText = currentUser ? 'logged-in user' : 'guest';
        
        toast({
          title: "Request Submitted Successfully! ✅",
          description: `Thank you! Your request ID is: ${result.requestId}. Our team will contact you within 24 hours. (Submitted as ${userTypeText})`,
        });
        
        // Reset form
        form.reset();
        setPreviewImage(null);
        setSelectedColors([]);
        
        // Re-fill user data if logged in
        if (currentUser) {
          setTimeout(() => {
            const userName = currentUser.name || 
                            `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
                            currentUser.fullName || '';
            
            if (userName) form.setValue("customerName", userName);
            if (currentUser.email) form.setValue("customerEmail", currentUser.email);
            if (currentUser.phone) form.setValue("phoneNumber", currentUser.phone);
          }, 100);
        }
        
        window.scrollTo(0, 0);
        
      } else {
        throw new Error(result.error || 'Failed to submit request');
      }
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="heading-lg mb-4">Custom Design</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Experience our custom tailoring service where you can create bespoke garments tailored to your exact measurements and style preferences.
          </p>
          
         {/* User Status Indicator */}
         {/*  <div className="mt-6 flex justify-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
              currentUser 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              {currentUser ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Welcome back, {currentUser.name || currentUser.firstName || 'User'}! 
                    Your details are pre-filled.
                  </span>
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Submitting as guest. You can also 
                    <a href="/auth/signin" className="ml-1 underline hover:no-underline">
                      log in
                    </a> for faster checkout.
                  </span>
                </>
              )}
            </div>
          </div>*/}
        </div>
        
        <div className="bg-gray-100 rounded-lg overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-full">
              <img 
                src={tailoringImage.src} 
                alt={tailoringImage.alt} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h2 className="heading-md mb-4">Request Your Custom Design</h2>
              <p className="text-gray-600 mb-6">
                Fill out the form below with your requirements and we'll get back to you within 24 hours.
                {!currentUser && " All fields are required for guest submissions."}
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Customer Information */}
                  <div className={`p-4 rounded-lg border ${
                    currentUser 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                      {currentUser && (
                        <Badge className="bg-green-100 text-green-800">
                          Pre-filled from account
                        </Badge>
                      )}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
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
                            <FormLabel>Phone Number *</FormLabel>
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
                        <FormItem className="mt-4">
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email address" {...field} />
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
                        <FormLabel>Design Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your desired outfit in detail. Include style, occasion, any specific requirements..."
                            className="h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Color Selection */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Color Preferences
                    </Label>
                    
                    {/* Predefined Colors */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Popular Colors:</Label>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => addColor(color.hex)}
                            disabled={selectedColors.includes(color.hex) || selectedColors.length >= 5}
                            className={`w-full h-12 rounded border-2 transition-all relative group ${
                              selectedColors.includes(color.hex)
                                ? 'border-gray-900 scale-95'
                                : 'border-gray-300 hover:border-gray-500'
                            } ${selectedColors.length >= 5 && !selectedColors.includes(color.hex) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ backgroundColor: color.hex }}
                          >
                            <span className="absolute inset-x-0 bottom-0 bg-black bg-opacity-75 text-white text-xs py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {color.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Color Picker */}
                    <div>
                      <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            type="button" 
                            variant="outline" 
                            disabled={selectedColors.length >= 5}
                            className="w-full"
                          >
                            Add Custom Color
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Choose Custom Color</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-10 gap-1 p-4">
                            {extendedColorPalette.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                onClick={() => {
                                  addColor(hex);
                                  setIsColorPickerOpen(false);
                                }}
                                className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Selected Colors Display */}
                    {selectedColors.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">
                            Selected Colors ({selectedColors.length}/5):
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearAllColors}
                            className="text-red-600 hover:text-red-800"
                          >
                            Clear All
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedColors.map((color) => {
                            const colorData = predefinedColors.find(c => c.hex.toLowerCase() === color.toLowerCase());
                            return (
                              <div
                                key={color}
                                className="flex items-center gap-2 bg-white border rounded px-2 py-1"
                              >
                                <div
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs">
                                  {colorData?.name || color}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeColor(color)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Color Description Text Area */}
                    <FormField
                      control={form.control}
                      name="colorDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your color preferences in detail or the selected colors will appear here automatically..."
                              className="h-16"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Fabric Preference */}
                  <FormField
                    control={form.control}
                    name="fabricPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fabric Preference (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Cotton, Silk, Linen, Wool, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label>Reference Image (optional)</Label>
                    
                    {!previewImage ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-5 w-12 text-gray-400 mb-4" />
                        <div>
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-800 font-medium">
                              Click to upload an image
                            </span>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          JPEG, PNG, WebP, GIF up to 5MB
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={previewImage}
                          alt="Design reference"
                          className="w-full max-w-xs h-48 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Measurements Section - Always Visible */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-lg font-semibold">
                      <Ruler className="h-5 w-5" />
                      Measurements
                    </Label>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3">
                        ✨ You can either provide measurements now or indicate that you'll provide them later via phone/visit.
                      </p>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id="providedByCustomer"
                          checked={form.watch("measurements.providedByCustomer")}
                          onCheckedChange={handleMeasurementCheck}
                        />
                        <Label htmlFor="providedByCustomer" className="font-medium">
                          I will provide measurements separately (via phone/visit)
                        </Label>
                      </div>

                      {/* Measurement fields - Always visible but disabled when checkbox is checked */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <FormField
                          control={form.control}
                          name="measurements.chest"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chest (inches)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 42" 
                                  {...field} 
                                  disabled={form.watch("measurements.providedByCustomer")}
                                  className={form.watch("measurements.providedByCustomer") ? "bg-gray-200" : ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="measurements.waist"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Waist (inches)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 34" 
                                  {...field} 
                                  disabled={form.watch("measurements.providedByCustomer")}
                                  className={form.watch("measurements.providedByCustomer") ? "bg-gray-200" : ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="measurements.hips"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hips (inches)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 40" 
                                  {...field} 
                                  disabled={form.watch("measurements.providedByCustomer")}
                                  className={form.watch("measurements.providedByCustomer") ? "bg-gray-200" : ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="measurements.shoulders"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shoulders (inches)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 18" 
                                  {...field} 
                                  disabled={form.watch("measurements.providedByCustomer")}
                                  className={form.watch("measurements.providedByCustomer") ? "bg-gray-200" : ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="measurements.inseam"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inseam (inches)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 32" 
                                  {...field} 
                                  disabled={form.watch("measurements.providedByCustomer")}
                                  className={form.watch("measurements.providedByCustomer") ? "bg-gray-200" : ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="measurements.sleeves"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sleeves (inches)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 25" 
                                  {...field} 
                                  disabled={form.watch("measurements.providedByCustomer")}
                                  className={form.watch("measurements.providedByCustomer") ? "bg-gray-200" : ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch("measurements.providedByCustomer") && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800">
                            📞 You've chosen to provide measurements separately. Our team will contact you after form submission to collect your measurements.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      'Submit Custom Design Request'
                    )}
                  </Button>
                </form>
              </Form> 
            </div>
          </div>
        </div>
        {/* Additional Information Section */}
        <div className="bg-stone-100 rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Custom Design Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Submit Request</h3>
              <p className="text-gray-600 text-sm">
                Fill out the form with your design requirements and color preferences. 
                Works for both logged-in users and guests.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Consultation</h3>
              <p className="text-gray-600 text-sm">
                Our team contacts you via phone to discuss details, measurements, and pricing
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Creation</h3>
              <p className="text-gray-600 text-sm">
                We craft your custom piece with your chosen colors and attention to every detail
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}