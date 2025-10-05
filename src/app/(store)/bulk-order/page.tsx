// src/app/(store)/bulk-order/page.tsx
"use client";

import { useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Phone, Mail, Clock, CheckCircle, Package, Truck, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function BulkOrder() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    productType: "",
    quantity: "",
    description: "",
    deliveryDate: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/bulk-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Request Submitted Successfully!",
          description: "Our team will contact you within 24 hours to discuss your bulk order.",
        });
        
        // Reset form
        setFormData({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          productType: "",
          quantity: "",
          description: "",
          deliveryDate: ""
        });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-zuree-beige dark:bg-gray-800 py-8 px-4">
        <div className="container mx-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Bulk Order</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="heading-md mt-4 text-gray-900 dark:text-white">Bulk Order Inquiry</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Order in bulk and get special pricing for your business needs
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Side - Benefits & Info */}
          <div>
            <h2 className="text-2xl font-medium mb-6 text-gray-900 dark:text-white">
              Why Choose Bulk Orders?
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="bg-zuree-beige dark:bg-gray-700 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-zuree-red" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Competitive Pricing</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get special discounts on bulk orders. The more you order, the more you save!
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-zuree-beige dark:bg-gray-700 p-3 rounded-full">
                  <Package className="h-6 w-6 text-zuree-red" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Custom Solutions</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Tailored products and packaging options to meet your specific requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-zuree-beige dark:bg-gray-700 p-3 rounded-full">
                  <Truck className="h-6 w-6 text-zuree-red" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Reliable Delivery</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    On-time delivery with flexible shipping options for large orders.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-zuree-beige dark:bg-gray-700 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-zuree-red" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Quality Assurance</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Premium quality products with rigorous quality control for every order.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Need Immediate Assistance?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-zuree-red" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Call us at:</p>
                    <a href="tel:+919711411526" className="text-gray-900 dark:text-white font-medium hover:text-zuree-red">
                      +91 97114 11526
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-zuree-red" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Email us at:</p>
                    <a href="mailto:Contact@zuree.in" className="text-gray-900 dark:text-white font-medium hover:text-zuree-red">
                      Contact@zuree.in
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-zuree-red" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Business Hours:</p>
                    <p className="text-gray-900 dark:text-white font-medium">Mon-Fri: 9am - 6pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <Layers className="h-8 w-8 text-zuree-red" />
                <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                  Request a Quote
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Fill out the form below and our team will get back to you with a customized quote within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Name *
                  </label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Your company name"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Person *
                  </label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="productType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Type *
                  </label>
                  <Input
                    id="productType"
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    placeholder="e.g., Men's Shirts, Women's Dresses, Kids Wear"
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity *
                    </label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Min. 50 pieces"
                      required
                      min="50"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expected Delivery
                    </label>
                    <Input
                      id="deliveryDate"
                      name="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Details
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please provide any specific requirements, customizations, or questions..."
                    rows={5}
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-zuree-red hover:bg-zuree-red/90 text-white py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Bulk Order Inquiry'}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By submitting this form, you agree to our terms and conditions.
                  We'll contact you within 24 hours.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-medium mb-8 text-center text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                What is the minimum order quantity?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Our minimum bulk order quantity is 10 pieces. However, we can discuss custom requirements based on your needs.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                How long does it take to process bulk orders?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Typical processing time is 2-4 weeks depending on the quantity and customization requirements.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Can I customize the products?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Yes! We offer customization options including colors, sizes, logos, and packaging for bulk orders.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                What payment terms do you offer?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We offer flexible payment terms including advance payment, COD for verified businesses, and installment options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}