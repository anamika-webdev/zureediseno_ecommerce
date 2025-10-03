// src/components/store/CombinedBanners/SplitBanners.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function SplitBanners() {
  return (
    <div className="w-full bg-gray-50 py-12">
      <div className="w-full px-6 lg:px-8 xl:px-12">
        {/* Desktop 60/40 Split Layout */}
        <div className="hidden md:flex gap-6 h-[550px]">
          {/* Custom Design Banner - 60% Width */}
          <div className="flex-[60] group">
            <Link href="/tailoredoutfit">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer">
                {/* Background Image */}
                <Image
                  src="/assets/img/1.jpg"
                  alt="Custom Design Banner"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent group-hover:from-black/60 transition-colors duration-500"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-10">
                  <div className="transform transition-all duration-500 group-hover:translate-y-[-10px]">
                    <span className="inline-block text-sm font-bold uppercase tracking-[3px] mb-4 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">
                      Create Your Style
                    </span>
                    <h2 className="text-6xl font-extrabold mb-5 drop-shadow-2xl leading-tight">
                      Custom Design<br />Studio
                    </h2>
                    <p className="text-xl mb-8 max-w-lg opacity-95 leading-relaxed">
                      Design your own unique outfit with our easy-to-use custom design tool. Unleash your creativity today!
                    </p>
                    <button className="bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl transform dark:bg-white dark:text-black dark:hover:bg-gray-200">
                      Design Now →
                    </button>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-6 right-6 w-20 h-20 border-t-4 border-r-4 border-white/40 rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 w-20 h-20 border-b-4 border-l-4 border-white/40 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating Badge */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg transform transition-all duration-500 group-hover:scale-110">
                  <p className="text-black text-xs font-bold uppercase tracking-wider">Popular</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Bulk Order Banner - 40% Width */}
          <div className="flex-[40] group">
            <Link href="/bulk-order">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer">
                {/* Background Image */}
                <Image
                  src="/assets/img/BulkOrderBanner/BulkOrderBanner (1).jpg"
                  alt="Bulk Order Banner"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent group-hover:from-black/70 transition-colors duration-500"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8">
                  <div className="transform transition-all duration-500 group-hover:translate-y-[-10px]">
                    <span className="inline-block text-sm font-bold uppercase tracking-[3px] mb-4 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">
                       Order in Volume
                    </span>
                    <h2 className="text-5xl font-extrabold mb-5 drop-shadow-2xl leading-tight">
                      Bulk Order<br />Solutions
                    </h2>
                    <p className="text-base mb-8 max-w-sm opacity-95 leading-relaxed">
                      Get competitive pricing and custom solutions for your business needs.Order minimum 10 units of any design via our bulk order solution.
                    </p>
                     <button className="bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl transform dark:bg-white dark:text-black dark:hover:bg-gray-200">
                     Order Now →
                    </button>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-white/40 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-white/40 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating Badge */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg transform transition-all duration-500 group-hover:scale-110">
                  <p className="text-black text-xs font-bold uppercase tracking-wider">B2B</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Tablet Layout (md to lg) - Optimized */}
        <div className="hidden md:block lg:hidden">
          <div className="flex gap-4 h-[500px]">
            <div className="flex-[55]">
              <Link href="/tailoredoutfit">
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src="/assets/img/1.jpg"
                    alt="Custom Design Banner"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
                    <span className="text-xs font-semibold uppercase tracking-wider mb-3 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full">
                      Create Your Style
                    </span>
                    <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
                      Custom Design<br />Studio
                    </h2>
                    <p className="text-sm mb-6 max-w-sm opacity-90">
                      Design your own unique outfit with our tools
                    </p>
                    <button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200">
                      Design Now
                    </button>
                  </div>
                </div>
              </Link>
            </div>
            <div className="flex-[45]">
              <Link href="/bulk-order">
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src="/assets/img/BulkOrderBanner/BulkOrderBanner (1).jpg"
                    alt="Bulk Order Banner"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
                    <span className="text-xs font-semibold uppercase tracking-wider mb-3 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-black border border-gray-200">
                      Order in Volume
                    </span>
                    <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">
                      Bulk Orders
                    </h2>
                    <p className="text-sm mb-6 max-w-xs opacity-90">
                      Competitive pricing for businesses
                    </p>
                    <button className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-lg font-semibold text-sm transition-colors">
                      Request Quote
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Stacked Layout */}
        <div className="md:hidden space-y-6">
          {/* Custom Design Banner - Mobile */}
          <Link href="/tailoredoutfit">
            <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/assets/img/1.jpg"
                alt="Custom Design Banner"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
                <span className="text-xs font-bold uppercase tracking-wider mb-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  Create Your Style
                </span>
                <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
                  Custom Design<br />Studio
                </h2>
                <p className="text-base mb-6 max-w-sm opacity-95">
                  Design your own unique outfit with our custom design tool. Unleash your creativity!
                </p>
                <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200">
                  Design Now
                </button>
              </div>
            </div>
          </Link>

          {/* Bulk Order Banner - Mobile */}
          <Link href="/bulk-order">
            <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/assets/img/BulkOrderBanner/BulkOrderBanner (1).jpg"
                alt="Bulk Order Banner"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
                <span className="text-xs font-bold uppercase tracking-wider mb-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-black border border-gray-200">
                  Order in Volume
                </span>
                <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
                  Bulk Order<br />Solutions
                </h2>
                <p className="text-base mb-6 max-w-sm opacity-95">
                  Get competitive pricing and custom solutions for your business needs
                </p>
                <button className="bg-white hover:bg-gray-100 text-black px-8 py-3 rounded-xl font-bold transition-colors shadow-lg">
                  Request Quote
                </button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}