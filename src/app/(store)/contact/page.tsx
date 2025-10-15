"use client";

import { useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
     
      
      <div className="bg-zuree-beige py-8 px-4">
        <div className="container mx-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Contact Us</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="heading-md mt-4">Contact Us</h1>
          <p className="text-gray-600 mt-2">We'd love to hear from you</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-medium mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about our products, orders, or anything else? We're here to help!
              <br /> Fill out the form, and our team will get back to you as soon as possible.
            </p>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-zuree-beige p-3 rounded-full">
                  <MapPin className="h-5 w-5 text-zuree-red" />
                </div>
                <div>
                  <h3 className="font-medium">Visit Us</h3>
                  <p className="text-gray-600">USA: 2320 Ponce De Leon Blvd, Coral Gables, FL 33134</p>
                  <p className="text-gray-600">India: Plot no. 23, Udyog Vihar Phase 1, Dundahera Village, Sector 20, Gurugram, Haryana 122022</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-zuree-beige p-3 rounded-full">
                  <Phone className="h-5 w-5 text-zuree-red" />
                </div>
                <div>
                  <h3 className="font-medium">Call Us</h3>
                  <p className="text-gray-600">+91 97114 11526</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-zuree-beige p-3 rounded-full">
                  <Mail className="h-5 w-5 text-zuree-red" />
                </div>
                <div>
                  <h3 className="font-medium">Email Us</h3>
                  <p className="text-gray-600">Contact@zuree.in</p>
                </div>
              </div>
             
              <div className="flex items-start space-x-4">
                <div className="bg-zuree-beige p-3 rounded-full">
                  <Clock className="h-5 w-5 text-zuree-red" />
                </div>
                <div>
                  <h3 className="font-medium">Business Hours</h3>
                  <p className="text-gray-600">Monday-Friday: 9am - 6pm</p>
                  <p className="text-gray-600">Saturday: 10am - 4pm</p>
                  <p className="text-gray-600">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-medium mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      className="h-32"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-zuree-red text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-medium mb-6 text-center">Our Location</h2>
          <div className="rounded-lg overflow-hidden shadow-md h-96">
            <iframe
              title="Zuree Store Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d423283.43554977553!2d-118.69192087205032!3d34.020608375992306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA%2C%20USA!5e0!3m2!1sen!2sca!4v1679960091850!5m2!1sen!2sca"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}