// src/app/(store)/tailoredoutfit/page.tsx - Universal Version for Logged Users + Guests
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Phone, 
  ImageIcon, 
  Ruler, 
  Palette, 
  Upload,
  CheckCircle,
  Mail,
  User,
  Plus,
  X,
  UserCheck,
  UserX
} from "lucide-react";

// Existing image and color palette data
const tailoringImage = {
  src: "/assets/img/2.jpg",
  alt: "Expert tailoring process",
};

const colorPalette = [
  // Blues
  { name: "Navy Blue", hex: "#1e3a8a" },
  { name: "Royal Blue", hex: "#1e40af" },
  { name: "Sky Blue", hex: "#0ea5e9" },
  { name: "Light Blue", hex: "#7dd3fc" },
  
  // Grays
  { name: "Charcoal", hex: "#374151" },
  { name: "Dark Gray", hex: "#4b5563" },
  { name: "Medium Gray", hex: "#6b7280" },
  { name: "Light Gray", hex: "#d1d5db" },
  
  // Reds
  { name: "Burgundy", hex: "#7c2d12" },
  { name: "Wine Red", hex: "#991b1b" },
  { name: "Crimson", hex: "#dc2626" },
  { name: "Rose", hex: "#f43f5e" },
  
  // Greens
  { name: "Forest Green", hex: "#166534" },
  { name: "Emerald", hex: "#059669" },
  { name: "Sage Green", hex: "#84cc16" },
  { name: "Mint", hex: "#10b981" },
  
  // Earth Tones
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
  const [showMeasurements, setShowMeasurements] = useState(false);
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
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<TailorFormValues>({
    resolver: zodResolver(tailorFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      phoneNumber: "",
      designDescription: "",
      colorDescription: "",
      measurements: {
        providedByCustomer: false,
        chest: "",
        waist: "",
        hips: "",
        shoulders: "",
        inseam: "",
        sleeves: "",
      },
      fabricPreference: "",
    },
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (!userLoading && currentUser) {
      // Auto-fill logged user's data
      const userName = currentUser.name || 
                      `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
                      currentUser.fullName || '';
      
      if (userName) {
        form.setValue("customerName", userName);
      }
      
      if (currentUser.email) {
        form.setValue("customerEmail", currentUser.email);
      }
      
      if (currentUser.phone) {
        form.setValue("phoneNumber", currentUser.phone);
      }
      
      console.log('📝 Pre-filled form with user data');
    }
  }, [userLoading, currentUser, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      form.setValue("image", files);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMeasurementCheck = (checked: boolean) => {
    form.setValue("measurements.providedByCustomer", checked);
    setShowMeasurements(!checked);
  };

  const handleColorSelect = (hex: string, name?: string) => {
    const colorName = name || colorPalette.find(color => color.hex === hex)?.name || hex;
    
    if (selectedColors.includes(hex)) {
      const newColors = selectedColors.filter(color => color !== hex);
      setSelectedColors(newColors);
      updateColorDescription(newColors);
    } else {
      const newColors = [...selectedColors, hex];
      setSelectedColors(newColors);
      updateColorDescription(newColors);
    }
  };

  const updateColorDescription = (colors: string[]) => {
    const colorDescriptions = colors.map(hex => {
      const colorData = colorPalette.find(color => color.hex === hex);
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
        setShowMeasurements(false);
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
          <div className="mt-6 flex justify-center">
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
                    <a href="/login" className="ml-1 underline hover:no-underline">
                      log in
                    </a> for faster checkout.
                  </span>
                </>
              )}
            </div>
          </div>
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  
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
                        <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
                          Auto-filled from account
                        </span>
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
                              <Input 
                                placeholder="Your full name" 
                                {...field}
                                className={currentUser ? 'bg-green-50' : ''}
                              />
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
                              Email Address *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your.email@example.com" 
                                {...field}
                                className={currentUser ? 'bg-green-50' : ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                            <Input 
                              placeholder="+91 98765 43210" 
                              {...field}
                              className={currentUser && currentUser.phone ? 'bg-green-50' : ''}
                            />
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
                            placeholder="Describe your desired outfit, style, occasion, specific requirements, etc. Be as detailed as possible."
                            className="h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="image" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Upload Design Reference (optional)
                    </Label>
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                    
                    {previewImage && (
                      <div className="mt-3 p-2 border border-gray-200 rounded-lg">
                        <img 
                          src={previewImage} 
                          alt="Design reference preview" 
                          className="max-w-full h-48 object-contain mx-auto rounded"
                        />
                      </div>
                    )}
                  </div>

                  {/* Enhanced Color Selection */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Color Preferences (optional)
                    </Label>
                    
                    {/* Preset Color Palette */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Quick Select Colors:
                      </Label>
                      <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
                        {colorPalette.map((color) => (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => handleColorSelect(color.hex, color.name)}
                            className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                              selectedColors.includes(color.hex) 
                                ? 'border-black ring-2 ring-black ring-offset-2' 
                                : 'border-gray-300 hover:border-gray-500'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Custom Color Picker */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Custom Color Picker:
                      </Label>
                      
                      <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Open Color Palette
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Choose Custom Colors</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-10 gap-1">
                              {extendedColorPalette.map((color, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleColorSelect(color)}
                                  className={`w-8 h-8 rounded border transition-all duration-200 hover:scale-110 ${
                                    selectedColors.includes(color) 
                                      ? 'ring-2 ring-black ring-offset-1' 
                                      : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                            
                            {/* HTML5 Color Picker */}
                            <div className="border-t pt-4">
                              <Label className="text-sm font-medium mb-2 block">
                                Or pick any color:
                              </Label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="color"
                                  onChange={(e) => handleColorSelect(e.target.value)}
                                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                                />
                                <span className="text-sm text-gray-600">
                                  Click to open your system color picker
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button 
                                type="button" 
                                onClick={() => setIsColorPickerOpen(false)}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Selected Colors Display */}
                    {selectedColors.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Selected Colors ({selectedColors.length}):
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearAllColors}
                          >
                            Clear All
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {selectedColors.map((color, index) => {
                            const colorData = colorPalette.find(c => c.hex === color);
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border"
                              >
                                <div
                                  className="w-6 h-6 rounded border border-gray-300"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-sm">
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
                      </FormItem>
                    )}
                  />

                  {/* Measurements Section */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Measurements
                    </Label>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="providedByCustomer"
                        checked={form.watch("measurements.providedByCustomer")}
                        onCheckedChange={handleMeasurementCheck}
                      />
                      <Label htmlFor="providedByCustomer">
                        I will provide measurements separately (via phone/visit)
                      </Label>
                    </div>

                    {showMeasurements && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <FormField
                          control={form.control}
                          name="measurements.chest"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chest (inches)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 42" {...field} />
                              </FormControl>
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
                                <Input placeholder="e.g., 34" {...field} />
                              </FormControl>
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
                                <Input placeholder="e.g., 40" {...field} />
                              </FormControl>
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
                                <Input placeholder="e.g., 18" {...field} />
                              </FormControl>
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
                                <Input placeholder="e.g., 32" {...field} />
                              </FormControl>
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
                                <Input placeholder="e.g., 25" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting Request...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Submit Custom Design Request
                        {currentUser && (
                          <span className="text-xs bg-green-600 px-2 py-1 rounded">
                            As logged user
                          </span>
                        )}
                        {!currentUser && (
                          <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                            As guest
                          </span>
                        )}
                      </div>
                    )}
                  </Button>

                  {/* Help Text */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <strong>What happens next?</strong>
                        <ul className="mt-2 space-y-1">
                          <li>• Our design team reviews your request within 24 hours</li>
                          <li>• We'll call you to discuss details and provide a quote</li>
                          <li>• Once confirmed, we start creating your custom piece</li>
                          <li>• Typical completion time: 7-14 business days</li>
                          {currentUser && (
                            <li className="text-green-700 font-medium">
                              • ✅ Your request will be linked to your account for easy tracking
                            </li>
                          )}
                          {!currentUser && (
                            <li className="text-blue-700 font-medium">
                              • 💡 Create an account for easier tracking and faster future orders
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Guest User Benefits */}
                  {!currentUser && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <UserX className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <strong>Submitting as Guest</strong>
                          <p className="mt-1">
                            We welcome guest submissions! However, creating an account offers benefits:
                          </p>
                          <ul className="mt-2 space-y-1 text-xs">
                            <li>• Track your custom design requests</li>
                            <li>• Faster checkout for future orders</li>
                            <li>• Saved measurements and preferences</li>
                            <li>• Order history and status updates</li>
                          </ul>
                          <div className="mt-3">
                            <a 
                              href="/register" 
                              className="text-blue-700 underline hover:no-underline text-sm font-medium"
                            >
                              Create Account →
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Custom Design Process</h2>
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

        {/* User Account Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {currentUser ? "Account Benefits" : "Why Create an Account?"}
            </h2>
            
            {currentUser ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <UserCheck className="h-6 w-6 text-green-600" />
                    <span className="text-lg font-semibold text-green-800">
                      Welcome back, {currentUser.name || currentUser.firstName || 'User'}!
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Auto-filled contact information</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Request tracking and history</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Faster future submissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Saved preferences and measurements</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <p className="text-gray-600 mb-6">
                  While you can submit custom design requests as a guest, creating an account provides additional benefits and a better experience.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">For Logged Users</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Auto-filled contact information</li>
                      <li>• Request tracking dashboard</li>
                      <li>• Saved measurements and preferences</li>
                      <li>• Order history and status updates</li>
                      <li>• Faster future submissions</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <UserX className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold">For Guests</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Manual information entry required</li>
                      <li>• Email notifications only</li>
                      <li>• No request tracking dashboard</li>
                      <li>• Contact us for order status</li>
                      <li>• Full form required each time</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <a href="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Create Account
                    </Button>
                  </a>
                  <a href="/login">
                    <Button variant="outline">
                      Sign In
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}