// app/store/about/page.tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Metadata for SEO - This works in Server Components
export const metadata = {
  title: "About Zuree - Our Story and Values",
  description: "Learn about Zuree's journey, values, and vision for sustainable fashion.",
};

export default function AboutPage() {
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
                <BreadcrumbPage>About Us</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="heading-md mt-4">About Zuree</h1>
          <p className="text-gray-600 mt-2">The story of our journey</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <h2 className="text-2xl font-medium mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2010, Zuree began as a small boutique in the heart of the fashion district. 
              Our founder, inspired by a passion for quality craftsmanship and sustainable fashion, 
              envisioned a brand that would combine contemporary design with traditional artisanal techniques.
            </p>
            <p className="text-gray-600">
              Over the years, we've grown into an internationally recognized label, 
              but our core values remain unchanged: quality materials, ethical production, 
              and timeless designs that transcend seasonal trends.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="Design studio" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-medium mb-6 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-zuree-beige rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zuree-red"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Sustainability</h3>
              <p className="text-gray-600">
                We're committed to reducing our environmental footprint through responsible sourcing and ethical manufacturing practices.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-zuree-beige rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zuree-red"><path d="M20.9 6c-.9-1.9-3.1-3-5.4-3a7 7 0 0 0-5.5 3m0 0-2.3 5"></path><path d="M3.1 8c.9-1.9 3.1-3 5.4-3 2.2 0 4.1 1 5.5 3m0 0 1.7 3.7"></path><path d="M12 12a5 5 0 0 1 5 5c0 2-1.8 3.5-4 4a1 1 0 0 1-.8-.7L12 12"></path><path d="M12 12a5 5 0 0 0-5 5c0 2 1.8 3.5 4 4a1 1 0 0 0 .8-.7L12 12Z"></path></svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Quality</h3>
              <p className="text-gray-600">
                We believe in creating garments that last, using premium materials and partnering with skilled artisans.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-zuree-beige rounded-full  flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zuree-red"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Community</h3>
              <p className="text-gray-600">
                We support the communities where our products are made through fair wages and local initiatives.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-zuree-beige p-8 rounded-lg mb-16">
          <h2 className="text-2xl font-medium mb-6 text-center">Our Vision</h2>
          <p className="text-center max-w-3xl mx-auto text-gray-700">
            "We envision a world where fashion is a force for good, where every garment tells a story of craftsmanship and care, 
            and where style and sustainability are not mutually exclusive."
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1574634534894-89d7576c8259?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1164&q=80" 
              alt="Team working together" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-medium mb-4">Join Our Journey</h2>
            <p className="text-gray-600 mb-4">
              At Zuree, we believe that fashion is more than just clothing—it's a form of self-expression, 
              a reflection of cultural currents, and an opportunity to make conscious choices.
            </p>
            <p className="text-gray-600">
              We invite you to be part of our story as we continue to grow and evolve. 
              Whether you're a long-time customer or discovering us for the first time, 
              we're grateful for your support in our mission to create beautiful, responsible fashion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}