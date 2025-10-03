// src/components/store/BulkOrder/BulkOrderBanner.tsx
import Link from "next/link";
import Image from "next/image";

export default function BulkOrderBanner() {
  return (
    <div className="min-w-screen bg-gray-50">
      {/* Bulk Order Banner */}
      <section className="relative flex items-center justify-center h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/public/assets/img/BulkOrderBanner/BulkOrderBanner (1).jpg"
            alt="Bulk Order Banner Background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Centered Text and Button */}
        <div className="relative z-10 text-center text-white px-4">
          <span className="text-md uppercase tracking-wide">
            ORDER IN VOLUME
          </span>
          <h1 className="text-6xl font-bold mt-2">
            Bulk Order Solutions
          </h1>
          <p className="mt-4 text-xl max-w-2xl mx-auto">
            Get competitive pricing and custom solutions for your business needs.
          </p>
          <p className="text-lg">
            Perfect for corporate uniforms, events, and wholesale requirements!
          </p>
          <br />
          <Link href="/bulk-order">
            <button className="btn-primary bg-zuree-red hover:bg-zuree-red/90 text-white px-8 py-3 rounded-md font-medium transition-colors">
              Request a Quote
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}