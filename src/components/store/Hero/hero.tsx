// src/components/store/Hero/hero.tsx - Final Working Version
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  // Fallback click handlers for buttons if Link doesn't work
  const handleShopClick = () => {
    router.push('/shop');
  };

  const handleCustomDesignClick = () => {
    router.push('/tailoredoutfit');
  };

  return (
    <section className="relative h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <video
          src="/assets/video/Hero.mp4"
          className="absolute top-0 left-0 object-cover w-full h-full"
          autoPlay
          loop
          muted
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-lg text-white">
          <h1 className="heading-xl mb-4">Welcome to Zuree</h1>
          <p className="text-xl mb-8">Where tradition meets modernity!</p>
          
          <div className="flex flex-wrap gap-4">
            {/* Method 1: Link with explicit styling (recommended) */}
            <Link 
              href="/shop" 
              className="inline-block bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors font-medium text-sm tracking-wide rounded-md dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Shop Collection
            </Link>
            
            <Link 
              href="/tailoredoutfit" 
              className="inline-block bg-white/80 backdrop-blur-sm border border-white/30 text-gray-900 py-3 px-6 hover:bg-white/90 transition-colors font-medium text-sm tracking-wide rounded-md"
            >
              Custom Design
            </Link>
          </div>
          
          {/* Fallback buttons in case Link approach doesn't work */}
          <div className="hidden">
            <button 
              onClick={handleShopClick}
              className="btn-primary mr-4"
            >
              Shop Collection
            </button>
            
            <button 
              onClick={handleCustomDesignClick}
              className="btn-secondary bg-white/80 backdrop-blur-sm border-transparent"
            >
              Custom Design
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};