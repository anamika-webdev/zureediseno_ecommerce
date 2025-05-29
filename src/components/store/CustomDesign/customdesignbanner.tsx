import Link from "next/link";
import Image from "next/image";

export default function CustomDesign() {
  return (
    <div className="min-w-screen bg-gray-50">
      {/* Custom Design Banner */}
      <section className="relative flex items-center justify-center h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/img/1.jpg" // Corrected path
            alt="Custom Design Banner Background"
            fill
            className="object-cover"
            priority
          />
          {/* Light Overlay 
          <div className="absolute inset-0 bg-black/20"></div>*/}
        </div>

        {/* Centered Text and Button */}
        <div className="relative z-10 text-center text-white">
          <span className="text-md uppercase tracking-wide">
            CREATE YOUR STYLE
          </span>
          <h1 className="text-6xl font-bold mt-2">
            Custom Design Studio
          </h1>
          <p className="mt-4 text-xl">
            Design your own unique outfit with our easy-to-use custom design
            tool.</p>
           <p> Unleash your creativity today!</p>
          <br></br>
          <Link href="/tailoredoutfit">
            <button className="btn-primary">
              Design Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}