import  Hero  from "@/components/store/Hero/hero";
import Newsletter from "@/components/store/newsletter/newsletter";
import CustomDesign from '@/components/store/CustomDesign/customdesignbanner';
import CollectionBanner from "@/components/store/CollectionBanner/CollectionBanner";
export default async function HomePage() {
    return (
        <div>
           <Hero />
           <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="heading-md mb-4">Curated solutions with our exclusive range of products</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Your one-stop solution provider in the world of fashion. With our exclusive range of furniture, custom fabrics, timeless wallpapers, and coordinating art both volume-based and personal dwellings.
          </p>
        </div>
        
           <CustomDesign />
             <CollectionBanner
          title="Men's Collection"
          description="Explore the Men's collection, where elegant design meets comfort. Find beautifully crafted pieces for every occasion."
          image="/assets/img/customshirt.jpg"
           link="/products/men"
        
        />
            <CollectionBanner
          title="Women's Collection"
          description="Explore the women's collection, where elegant design meets comfort. Find beautifully crafted pieces for every occasion."
          image="https://images.unsplash.com/photo-1588117260148-b47818741c74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
          link="/products/women"
          direction="right"
        />
        
        <CollectionBanner
          title="Kids' Collection"
          description="Bright, comfortable, and durable clothing for the little ones. Dress with love."
          image="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1372&q=80"
          link="/products/kids"
        />

           <Newsletter />
           
        </div>
    );


    
}