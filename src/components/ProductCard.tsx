// src/components/ProductCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { toast } from 'sonner'

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sleeveType?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  inStock: boolean;
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the first available variant for default selection
    const firstVariant = product.variants.find(v => v.stock > 0);
    
    if (!firstVariant) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage?.url || '/placeholder.jpg',
      slug: product.slug,
      size: firstVariant.size,
      color: firstVariant.color,
      quantity: 1
    });

    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <Link href={`/product/${product.slug}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <Badge className="bg-blue-600 text-white">Featured</Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive">{discountPercentage}% OFF</Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>

          {/* Quick Add to Cart */}
          {product.inStock && (
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button 
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-gray-800 text-white"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice!.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Available Sizes */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {[...new Set(product.variants.map(v => v.size))].slice(0, 4).map((size) => (
                <span 
                  key={size}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                >
                  {size}
                </span>
              ))}
              {[...new Set(product.variants.map(v => v.size))].length > 4 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  +{[...new Set(product.variants.map(v => v.size))].length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}