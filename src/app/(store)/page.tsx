import  Hero  from "@/components/store/Hero/hero";
import Newsletter from "@/components/store/newsletter/newsletter";
import CombinedBanners from '@/components/store/CombinedBanners/CombinedBanners';
import CollectionBanner from "@/components/store/CollectionBanner/CollectionBanner";

export default async function HomePage() {
    return (
        <div>
           <Hero />
           <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="heading-md mb-4">Curated solutions with our exclusive range of products</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
           Your one-stop solution provider in the world of fashion. With our exclusive range of fabrics, timeless design, and coordinating freshness with technology for both volume-based and personal dwellings.</p>
        </div>
        
           <CombinedBanners />
             <CollectionBanner
          title="Men's Collection"
          description="Explore the Men's collection, where elegant design meets comfort. Find beautifully crafted pieces for every occasion."
          image="/assets/img/MensCollection.jpg"
           link="/products/men"
        
        />
            <CollectionBanner
          title="Women's Collection"
          description="Explore the women's collection, where elegant design meets comfort. Find beautifully crafted pieces for every occasion."
          image="/assets/img/Women.png"
          link="/products/women"
          direction="right"
        />
        
        <CollectionBanner
          title="Kids' Collection"
          description="Bright, comfortable, and durable clothing for the little ones. Dress with love."
          image="/assets/img/Kids_Collection.png"
          link="/products/Kids"
        />

           <Newsletter />
           
        </div>
    );
}