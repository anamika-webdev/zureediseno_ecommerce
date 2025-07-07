// File: src/components/store/layout/header/header.tsx
"use client";

import Link from "next/link";
import { ShoppingBag, User, Search, Menu, LogOut, ChevronDown, Scissors } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { CartDrawer } from "../../CartDrawer";

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for categories navigation
interface CategoryNavigation {
  id: string;
  name: string;
  slug: string; // Changed from url to slug to match API
  url: string;
  subcategories: SubcategoryNavigation[];
  _count?: {
    products: number;
  };
}

interface SubcategoryNavigation {
  id: string;
  name: string;
  slug: string; // Changed from url to slug to match API
  url: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Context hooks with error handling
  const cart = useCart();
  const auth = useAuth();

  // Custom hook for fetching categories navigation
  const useCategoriesNavigation = () => {
    const [categories, setCategories] = useState<CategoryNavigation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await fetch('/api/categories-with-subcategories');
          if (response.ok) {
            const data = await response.json();
            // Transform data to match expected format and filter for header navigation
            const navigationCategories = data
              .map((cat: any) => ({
                ...cat,
                url: cat.slug, // Map slug to url for compatibility
                subcategories: cat.subcategories?.map((sub: any) => ({
                  ...sub,
                  url: sub.slug // Map slug to url for compatibility
                })) || []
              }))
              .filter((cat: CategoryNavigation) => 
                cat.subcategories.length > 0 || 
                cat.name.toLowerCase().includes('men') || 
                cat.name.toLowerCase().includes('women') || 
                cat.name.toLowerCase().includes('kids')
              )
              .slice(0, 6); // Limit to prevent overflow
            setCategories(navigationCategories);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          // Fallback to static categories if API fails
          setCategories([
            {
              id: 'fallback-men',
              name: 'Men',
              slug: 'men',
              url: 'men',
              subcategories: []
            },
            {
              id: 'fallback-women',
              name: 'Women',
              slug: 'women',
              url: 'women',
              subcategories: []
            },
            {
              id: 'fallback-kids',
              name: 'Kids',
              slug: 'kids',
              url: 'kids',
              subcategories: []
            }
          ]);
        } finally {
          setLoading(false);
        }
      };

      if (mounted) {
        fetchCategories();
      }
    }, [mounted]);

    return { categories, loading };
  };

  // Get categories for navigation
  const { categories, loading: categoriesLoading } = useCategoriesNavigation();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe access to context values - Updated for new cart context
  const cartItemCount = cart?.itemCount || 0;
  const { user, loginAsGuest, logout, isAuthenticated, isGuest } = auth || {};

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthDialog = (open: boolean) => {
    setIsAuthDialogOpen(open);
  };

  const handleGuestLogin = () => {
    if (loginAsGuest) {
      loginAsGuest();
      setIsAuthDialogOpen(false);
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
      setIsAuthDialogOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button 
            onClick={handleMenuToggle} 
            aria-label="Toggle menu"
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Logo */}
        <div className="text-2xl font-serif">
          <Link href="/" className="font-medium flex items-center">
            <img 
              src="/assets/icons/logo.png" 
              alt="Zuree" 
              className="h-14"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl font-bold text-zuree-red">Zuree</span>';
              }}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
          <ul className="flex items-center space-x-8">
            <li>
              <Link href="/" className="text-sm font-medium hover:text-zuree-red transition-colors">
                Home
              </Link>
            </li>
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-sm font-medium hover:text-zuree-red transition-colors">
                  Shop
                  <ChevronDown className="h-4 w-4 ml-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                  <DropdownMenuItem asChild>
                    <Link href="/shop" className="w-full font-medium">
                      All Collections
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  
                  {categoriesLoading ? (
                    <DropdownMenuItem disabled>
                      <span className="text-gray-500">Loading categories...</span>
                    </DropdownMenuItem>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id}>
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/products/${category.url}`} 
                            className="w-full font-medium hover:text-zuree-red"
                          >
                            {category.name}
                            {category._count?.products && (
                              <span className="ml-auto text-xs text-gray-500">
                                ({category._count.products})
                              </span>
                            )}
                          </Link>
                        </DropdownMenuItem>
                        
                        {/* Show subcategories (limit to 5 to prevent overflow) */}
                        {category.subcategories.slice(0, 5).map((subcategory) => (
                          <DropdownMenuItem key={subcategory.id} asChild>
                            <Link 
                              href={`/products/${category.url}?subcategory=${subcategory.url}`} 
                              className="w-full pl-4 text-sm text-gray-600 hover:text-zuree-red"
                            >
                              {subcategory.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        
                        {/* Show "View all" if more than 5 subcategories */}
                        {category.subcategories.length > 5 && (
                          <DropdownMenuItem asChild>
                            <Link 
                              href={`/products/${category.url}`} 
                              className="w-full pl-4 text-xs text-zuree-red italic hover:underline"
                            >
                              View all {category.name.toLowerCase()} →
                            </Link>
                          </DropdownMenuItem>
                        )}
                        
                        {/* Add separator between categories except for the last one */}
                        {categories.indexOf(category) < categories.length - 1 && (
                          <DropdownMenuSeparator />
                        )}
                      </div>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <Link href="/shop" className="text-sm font-medium hover:text-zuree-red transition-colors">
                Explore Designs
              </Link>
            </li>
            <li>
              <Link href="/tailoredoutfit" className="text-sm font-medium hover:text-zuree-red transition-colors flex items-center">
                <Scissors className="h-4 w-4 mr-1" /> Custom Design
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-sm font-medium hover:text-zuree-red transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm font-medium hover:text-zuree-red transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white p-4 shadow-md z-50 border-t">
            <ul className="flex flex-col space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-sm font-medium hover:text-zuree-red transition-colors block py-2"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
              </li>
              <li>
                <div className="flex flex-col space-y-1">
                  <Link 
                    href="/shop" 
                    className="text-sm font-medium hover:text-zuree-red transition-colors block py-2"
                    onClick={closeMobileMenu}
                  >
                    All Collections
                  </Link>
                  
                  {/* Mobile Categories Navigation */}
                  <div className="pl-4 space-y-2">
                    {categoriesLoading ? (
                      <span className="text-sm text-gray-500">Loading categories...</span>
                    ) : (
                      categories.map((category) => (
                        <div key={category.id} className="space-y-1">
                          <Link 
                            href={`/products/${category.url}`} 
                            className="text-sm font-medium hover:text-zuree-red transition-colors block py-1"
                            onClick={closeMobileMenu}
                          >
                            {category.name}
                          </Link>
                          
                          {/* Mobile Subcategories */}
                          {category.subcategories.length > 0 && (
                            <div className="pl-4 space-y-1">
                              {category.subcategories.slice(0, 3).map((subcategory) => (
                                <Link 
                                  key={subcategory.id}
                                  href={`/products/${category.url}?subcategory=${subcategory.url}`} 
                                  className="text-xs text-gray-600 hover:text-zuree-red transition-colors block py-1"
                                  onClick={closeMobileMenu}
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                              {category.subcategories.length > 3 && (
                                <Link 
                                  href={`/products/${category.url}`} 
                                  className="text-xs text-zuree-red italic block py-1"
                                  onClick={closeMobileMenu}
                                >
                                  View all →
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </li>
              <li>
                <Link 
                  href="/shop" 
                  className="text-sm font-medium hover:text-zuree-red transition-colors block py-2"
                  onClick={closeMobileMenu}
                >
                  Explore Designs
                </Link>
              </li>
              <li>
                <Link 
                  href="/tailoredoutfit" 
                  className="text-sm font-medium hover:text-zuree-red transition-colors flex items-center py-2"
                  onClick={closeMobileMenu}
                >
                  <Scissors className="h-4 w-4 mr-1" /> Custom Design
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sm font-medium hover:text-zuree-red transition-colors block py-2"
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm font-medium hover:text-zuree-red transition-colors block py-2"
                  onClick={closeMobileMenu}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center space-x-6">
          {/* Search Button - You can enhance this later */}
          <button 
            aria-label="Search" 
            className="hidden md:block p-1 hover:bg-gray-100 rounded"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Auth Section - Using Clerk components for better integration */}
          <div className="flex items-center">
            <SignedOut>
              <SignInButton>
                <button 
                  aria-label="Sign In"
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <User className="h-5 w-5" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Cart Drawer - Using the new CartDrawer component */}
          <CartDrawer />
        </div>
      </div>
    </header>
  );
};

export default Header;