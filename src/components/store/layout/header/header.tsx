"use client";

import Link from "next/link";
import { ShoppingBag, User, Search, Menu, LogOut, ChevronDown, Scissors } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
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
  slug: string;
  subcategories: SubcategoryNavigation[];
  _count?: {
    products: number;
  };
}

interface SubcategoryNavigation {
  id: string;
  name: string;
  slug: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

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
            console.log('Categories API response:', data); // Debug log
            
            // Transform data to match expected format
            const navigationCategories = data
              .map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                subcategories: cat.subcategories?.map((sub: any) => ({
                  id: sub.id,
                  name: sub.name,
                  slug: sub.slug
                })) || [],
                _count: cat._count || undefined
              }))
              .filter((cat: CategoryNavigation) => 
                // Show categories that have subcategories OR are main categories
                cat.subcategories.length > 0 || 
                cat.name.toLowerCase().includes('men') || 
                cat.name.toLowerCase().includes('women') || 
                cat.name.toLowerCase().includes('kids') ||
                cat.name.toLowerCase().includes('shirts') ||
                cat.name.toLowerCase().includes('dresses')
              )
              .slice(0, 8); // Limit to prevent overflow
            
            console.log('Processed categories:', navigationCategories); // Debug log
            setCategories(navigationCategories);
          } else {
            console.error('Failed to fetch categories:', response.status);
            // Fallback to static categories if API fails
            setCategories([
              {
                id: 'fallback-men',
                name: 'Men',
                slug: 'men',
                subcategories: []
              },
              {
                id: 'fallback-women',
                name: 'Women',
                slug: 'women',
                subcategories: []
              },
              {
                id: 'fallback-kids',
                name: 'Kids',
                slug: 'kids',
                subcategories: []
              }
            ]);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          // Fallback to static categories if API fails
          setCategories([
            {
              id: 'fallback-men',
              name: 'Men',
              slug: 'men',
              subcategories: []
            },
            {
              id: 'fallback-women',
              name: 'Women',
              slug: 'women',
              subcategories: []
            },
            {
              id: 'fallback-kids',
              name: 'Kids',
              slug: 'kids',
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

  // Safe access to context values
  const cartItemCount = cart?.itemCount || 0;
  const { user, login, register, logout, isAuthenticated, isGuest, loginAsGuest, loading } = auth || {};

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthDialog = (open: boolean) => {
    setIsAuthDialogOpen(open);
    if (!open) {
      // Reset form when closing
      setAuthError('');
      setLoginEmail('');
      setLoginPassword('');
      setSignupFirstName('');
      setSignupLastName('');
      setSignupEmail('');
      setSignupPassword('');
      setAuthMode('login');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (login) {
        await login(loginEmail, loginPassword);
        setIsAuthDialogOpen(false);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (register) {
        await register(signupFirstName, signupLastName, signupEmail, signupPassword);
        setIsAuthDialogOpen(false);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
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
    }
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button 
            onClick={handleMenuToggle} 
            aria-label="Toggle menu"
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
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
              <Link href="/" className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors">
                Home
              </Link>
            </li>
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors">
                  Shop
                  <ChevronDown className="h-4 w-4 ml-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem asChild>
                    <Link href="/shop" className="w-full font-medium text-gray-900 dark:text-white hover:text-zuree-red">
                      All Collections
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                  
                  {categoriesLoading ? (
                    <DropdownMenuItem disabled>
                      <span className="text-gray-500 dark:text-gray-400">Loading categories...</span>
                    </DropdownMenuItem>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <div key={category.id}>
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/shop?category=${category.slug}`} 
                            className="w-full font-medium text-gray-900 dark:text-white hover:text-zuree-red"
                          >
                            {category.name}
                            {category._count?.products && (
                              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                                ({category._count.products})
                              </span>
                            )}
                          </Link>
                        </DropdownMenuItem>
                        
                        {/* Show subcategories (limit to 5 to prevent overflow) */}
                        {category.subcategories.slice(0, 5).map((subcategory) => (
                          <DropdownMenuItem key={subcategory.id} asChild>
                            <Link 
                              href={`/shop?category=${category.slug}&subcategory=${subcategory.slug}`} 
                              className="w-full pl-4 text-sm text-gray-600 dark:text-gray-300 hover:text-zuree-red"
                            >
                              {subcategory.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        
                        {/* Show "View all" if more than 5 subcategories */}
                        {category.subcategories.length > 5 && (
                          <DropdownMenuItem asChild>
                            <Link 
                              href={`/shop?category=${category.slug}`} 
                              className="w-full pl-4 text-xs text-zuree-red italic hover:underline"
                            >
                              View all {category.name.toLowerCase()} →
                            </Link>
                          </DropdownMenuItem>
                        )}
                        
                        {/* Add separator between categories except for the last one */}
                        {categories.indexOf(category) < categories.length - 1 && (
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                        )}
                      </div>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      <span className="text-gray-500 dark:text-gray-400">No categories available</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <Link href="/shop" className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors">
                Explore Designs
              </Link>
            </li>
            <li>
              <Link href="/tailoredoutfit" className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors flex items-center">
                <Scissors className="h-4 w-4 mr-1" /> Custom Design
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 p-4 shadow-md z-50 border-t border-gray-200 dark:border-gray-700">
            <ul className="flex flex-col space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors block py-2"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
              </li>
              <li>
                <div className="flex flex-col space-y-1">
                  <Link 
                    href="/shop" 
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors block py-2"
                    onClick={closeMobileMenu}
                  >
                    All Collections
                  </Link>
                  
                  {/* Mobile Categories Navigation */}
                  <div className="pl-4 space-y-2">
                    {categoriesLoading ? (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</span>
                    ) : (
                      categories.map((category) => (
                        <div key={category.id} className="space-y-1">
                          <Link 
                            href={`/shop?category=${category.slug}`} 
                            className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-zuree-red transition-colors block py-1"
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
                                  href={`/shop?category=${category.slug}&subcategory=${subcategory.slug}`} 
                                  className="text-xs text-gray-600 dark:text-gray-300 hover:text-zuree-red transition-colors block py-1"
                                  onClick={closeMobileMenu}
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                              {category.subcategories.length > 3 && (
                                <Link 
                                  href={`/shop?category=${category.slug}`} 
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
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors block py-2"
                  onClick={closeMobileMenu}
                >
                  Explore Designs
                </Link>
              </li>
              <li>
                <Link 
                  href="/tailoredoutfit" 
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors flex items-center py-2"
                  onClick={closeMobileMenu}
                >
                  <Scissors className="h-4 w-4 mr-1" /> Custom Design
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors block py-2"
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors block py-2"
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
          {/* Search Button */}
          <button 
            aria-label="Search" 
            className="hidden md:block p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <Search className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>

          {/* Auth Section - Custom Implementation */}
          <div className="flex items-center">
            {loading ? (
              <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    {user.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.name || user.email} 
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="hidden md:inline text-sm">
                      {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full flex items-center text-gray-900 dark:text-white hover:text-zuree-red">
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                    </>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'SELLER') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="w-full flex items-center text-gray-900 dark:text-white hover:text-zuree-red">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full flex items-center text-gray-900 dark:text-white hover:text-zuree-red">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="w-full flex items-center text-gray-900 dark:text-white hover:text-zuree-red">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                  <DropdownMenuItem onClick={handleLogout} className="w-full flex items-center text-gray-900 dark:text-white hover:text-zuree-red cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Dialog open={isAuthDialogOpen} onOpenChange={handleAuthDialog}>
                <DialogTrigger asChild>
                  <button 
                    aria-label="Sign In"
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-900 dark:text-white" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                      {authMode === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                      {authMode === 'login' 
                        ? 'Welcome back! Please sign in to continue.' 
                        : 'Join us today and start shopping!'
                      }
                    </DialogDescription>
                  </DialogHeader>

                  {authError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                      {authError}
                    </div>
                  )}

                  {authMode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Input
                          type="password"
                          placeholder="Password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-zuree-red hover:bg-zuree-red/90" 
                        disabled={authLoading}
                      >
                        {authLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="text"
                          placeholder="First name"
                          value={signupFirstName}
                          onChange={(e) => setSignupFirstName(e.target.value)}
                          required
                        />
                        <Input
                          type="text"
                          placeholder="Last name"
                          value={signupLastName}
                          onChange={(e) => setSignupLastName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Input
                          type="password"
                          placeholder="Password (min 6 characters)"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-zuree-red hover:bg-zuree-red/90" 
                        disabled={authLoading}
                      >
                        {authLoading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  )}

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleGuestLogin}
                      variant="outline" 
                      className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Continue as Guest
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        className="text-sm text-zuree-red hover:underline"
                      >
                        {authMode === 'login' 
                          ? "Don't have an account? Sign up" 
                          : "Already have an account? Sign in"
                        }
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Cart Drawer */}
          <CartDrawer />
        </div>
      </div>
    </header>
  );
};

export default Header;