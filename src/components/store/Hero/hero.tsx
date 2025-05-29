import Link from "next/link";

export default function Hero() {
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
            <button 
             // onClick={() => handleNavigate('/shop')}
              className="btn-primary"
            >
              Shop Collection
            </button>
            <button 
             // onClick={() => handleNavigate('/explore')}
              className="btn-secondary bg-white/80 backdrop-blur-sm border-transparent"
            >
              Explore Designs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

