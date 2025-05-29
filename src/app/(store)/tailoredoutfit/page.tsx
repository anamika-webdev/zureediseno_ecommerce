"use client";

import React, { useState, useEffect } from "react";
import { Scissors, Ruler, Shirt, PenTool, Phone, Image as ImageIcon, FileText, Palette, SwatchBook } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const tailorFormSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  designDescription: z.string().min(10, "Please provide a detailed description"),
  colorDescription: z.string().min(3, "Please specify your color preferences"),
  measurements: z.object({
    chest: z.string().optional(),
    waist: z.string().optional(),
    hips: z.string().optional(),
    shoulders: z.string().optional(),
    inseam: z.string().optional(),
    sleeves: z.string().optional(),
    providedByCustomer: z.boolean().default(false),
  }),
  fabricPreference: z.string().min(1, "Please select a fabric preference"),
  image: z.instanceof(FileList).optional(),
});

type TailorFormValues = z.infer<typeof tailorFormSchema>;

// Initial color palette options
const colorPalette = [
  { name: "Royal Purple", hex: "#8B5CF6" },
  { name: "Soft Pink", hex: "#FFDEE2" },
  { name: "Ocean Blue", hex: "#0EA5E9" },
  { name: "Emerald Green", hex: "#10B981" },
  { name: "Bright Red", hex: "#EF4444" },
  { name: "Soft Yellow", hex: "#FEF7CD" },
  { name: "Midnight Blue", hex: "#1E40AF" },
  { name: "Soft Orange", hex: "#FEC6A1" },
  { name: "Turquoise", hex: "#14B8A6" },
  { name: "Soft Purple", hex: "#E5DEFF" },
  { name: "Magenta", hex: "#D946EF" },
  { name: "Charcoal", hex: "#403E43" },
];

// Updated image that better matches the website theme
const tailoringImage = {
  src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
  alt: "Elegant custom tailoring workspace with fabric samples",
};

export default function TailorOutfit() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("#000000");
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<TailorFormValues>({
    resolver: zodResolver(tailorFormSchema),
    defaultValues: {
      phoneNumber: "",
      designDescription: "",
      colorDescription: "",
      measurements: {
        chest: "",
        waist: "",
        hips: "",
        shoulders: "",
        inseam: "",
        sleeves: "",
        providedByCustomer: false,
      },
      fabricPreference: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      form.setValue("image", files);
      
      // Create preview
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

  const handleColorSelect = (hex: string) => {
    setSelectedColor(hex);
    const colorName = colorPalette.find(color => color.hex === hex)?.name || hex;
    const currentDescription = form.getValues("colorDescription");
    
    // Add the color with its code to the description if it's not already there
    if (!currentDescription.includes(hex)) {
      const newDescription = currentDescription 
        ? `${currentDescription}, ${colorName} (${hex})` 
        : `${colorName} (${hex})`;
      form.setValue("colorDescription", newDescription);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const addCustomColor = () => {
    // Add the custom color to the description with its hex code
    const currentDescription = form.getValues("colorDescription");
    const newDescription = currentDescription 
      ? `${currentDescription}, Custom (${customColor})` 
      : `Custom (${customColor})`;
    
    form.setValue("colorDescription", newDescription);
    setSelectedColor(customColor);
    
    // Show notification that color was added
    toast({
      title: "Color Added",
      description: `Custom color ${customColor} has been added to your palette.`,
    });
  };

  const onSubmit = (data: TailorFormValues) => {
    setIsSubmitting(true);
    
    // Here you would typically send this data to your backend
    console.log("Form data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Request Submitted",
        description: "Our experts will contact you shortly.",
      });
      form.reset();
      setPreviewImage(null);
      setShowMeasurements(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
    
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="heading-lg mb-4">Custom Design</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Experience our custom tailoring service where you can create bespoke garments tailored to your exact measurements and style preferences.
          </p>
        </div>
        
        <div className="bg-gray-100 rounded-lg overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-full">
              {/* Single full-height image */}
              <img 
                src={tailoringImage.src} 
                alt={tailoringImage.alt} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h2 className="heading-md mb-4">Request Your Custom Design</h2>
              <p className="text-gray-600 mb-6">
                Fill out the form below with your requirements.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          <Input placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                        <img 
                          src={previewImage} 
                          alt="Design preview" 
                          className="max-h-40 rounded-md border" 
                        />
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="designDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Design Description
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the design, style, and any specific details you want"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Color Library
                        </FormLabel>
                        <div className="mb-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 px-2">
                                <Palette className="h-4 w-4 mr-2" /> 
                                Select Colors
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72">
                              <div className="space-y-4">
                                <h4 className="font-medium text-sm">Color Palette</h4>
                                <div className="flex flex-wrap gap-2">
                                  {colorPalette.map((color) => (
                                    <button
                                      key={color.hex}
                                      type="button"
                                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                                        selectedColor === color.hex ? 'border-black scale-110' : 'border-transparent hover:scale-105'
                                      }`}
                                      style={{ backgroundColor: color.hex }}
                                      onClick={() => handleColorSelect(color.hex)}
                                      title={color.name}
                                    />
                                  ))}
                                </div>
                                
                                <div className="border-t pt-3">
                                  <h4 className="font-medium text-sm mb-2">Custom Color</h4>
                                  <div className="flex items-center gap-3">
                                    <Input 
                                      type="color" 
                                      value={customColor}
                                      onChange={handleCustomColorChange}
                                      className="w-12 h-8 p-1"
                                    />
                                    <div 
                                      className="w-8 h-8 rounded-full border"
                                      style={{ backgroundColor: customColor }}
                                    ></div>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm"
                                      onClick={addCustomColor}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Royal Purple (#8B5CF6), Soft Pink (#FFDEE2)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Measurements Section */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="providedByCustomer"
                        checked={form.watch("measurements.providedByCustomer")}
                        onCheckedChange={handleMeasurementCheck}
                      />
                      <div className="space-y-1 leading-none">
                        <Label
                          htmlFor="providedByCustomer"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I will provide measurements later
                        </Label>
                        <p className="text-sm text-gray-500">
                          Check this if you prefer to provide measurements during a call or visit to our store
                        </p>
                      </div>
                    </div>

                    {!form.watch("measurements.providedByCustomer") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="chest" className="flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Chest (inches)
                          </Label>
                          <Input
                            id="chest"
                            placeholder="e.g., 40"
                            {...form.register("measurements.chest")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="waist" className="flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Waist (inches)
                          </Label>
                          <Input
                            id="waist"
                            placeholder="e.g., 34"
                            {...form.register("measurements.waist")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hips" className="flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Hips (inches)
                          </Label>
                          <Input
                            id="hips"
                            placeholder="e.g., 42"
                            {...form.register("measurements.hips")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="shoulders" className="flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Shoulders (inches)
                          </Label>
                          <Input
                            id="shoulders"
                            placeholder="e.g., 18"
                            {...form.register("measurements.shoulders")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="inseam" className="flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Inseam (inches)
                          </Label>
                          <Input
                            id="inseam"
                            placeholder="e.g., 32"
                            {...form.register("measurements.inseam")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sleeves" className="flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Sleeve Length (inches)
                          </Label>
                          <Input
                            id="sleeves"
                            placeholder="e.g., 25"
                            {...form.register("measurements.sleeves")}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fabric Selection Section */}
                  <FormField
                    control={form.control}
                    name="fabricPreference"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2">
                          <SwatchBook className="h-4 w-4" />
                          Fabric Library
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cotton" id="cotton" />
                              <Label htmlFor="cotton">Premium Cotton</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="linen" id="linen" />
                              <Label htmlFor="linen">Linen</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="silk" id="silk" />
                              <Label htmlFor="silk">Silk</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wool" id="wool" />
                              <Label htmlFor="wool">Wool</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="blend" id="blend" />
                              <Label htmlFor="blend">Cotton-Polyester Blend</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other">Other (specify in description)</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
}