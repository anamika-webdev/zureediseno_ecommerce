import Link from "next/link";

interface CollectionBannerProps {
  title: string;
  description: string;
  image: string;
  link: string;
  direction?: "left" | "right";
  children?: React.ReactNode;
}

export default function CollectionBanner({
  title,
  description,
  image,
  link,
  direction = "left",
  children,
}: CollectionBannerProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${direction === "right" ? "lg:flex-row-reverse" : "lg:flex-row"} items-center`}>
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <img
              src={image}
              alt={title}
              className="w-full h-auto object-cover rounded-md"
            />
          </div>

          <div className={`lg:w-1/2 ${direction === "right" ? "lg:pr-16" : "lg:pl-16"}`}>
            <h2 className="heading-md mb-4">{title}</h2>
            <p className="text-gray-600 mb-6">{description}</p>

            {children}

            <Link href={link} className="btn-primary inline-block">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}