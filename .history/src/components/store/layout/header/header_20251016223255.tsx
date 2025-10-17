"use client";
export const dynamic = 'force-dynamic'
import Link from "next/link";
import { ShoppingBag, User, Search, Menu, LogOut, ChevronDown, Scissors, Package, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { CartDrawer } from "../../CartDrawer";
import { ModeToggle } from "@/components/mode-toggle";
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

  // Context hooks
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
                cat.subcategories.length > 0 || 
                cat.name.toLowerCase() === 'kids' || 
                cat.name.toLowerCase() === 'men' || 
                cat.name.toLowerCase() === 'women'
              );

            setCategories(navigationCategories);
          }
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCategories();
    }, []);

    return { categories, loading };
  };

  const { categories, loading: categoriesLoading } = useCategoriesNavigation();
  const { items: cartItems } = cart || { items: [] };
  const { user } = auth || { user: null };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (!auth?.login) {
        throw new Error('Authentication not available');
      }

      await auth.login(loginEmail, loginPassword);
      setIsAuthDialogOpen(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (!auth?.signup) {
        throw new Error('Authentication not available');
      }

      await auth.signup(signupFirstName, signupLastName, signupEmail, signupPassword);
      setIsAuthDialogOpen(false);
      setSignupFirstName('');
      setSignupLastName('');
      setSignupEmail('');
      setSignupPassword('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth?.logout) {
        await auth.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
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
                    Explore Designs
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
                          {/* Main Category Link - Redirects to category page */}
                          <DropdownMenuItem asChild>
                            <Link 
                              href={`/shop?category=${category.slug}`}
                              className="w-full font-semibold text-gray-900 dark:text-white hover:text-zuree-red"
                            >
                              {category.name}
                              {category._count?.products && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({category._count.products})
                                </span>
                              )}
                            </Link>
                          </DropdownMenuItem>
                          
                          {/* Subcategories - Redirect to category page for now */}
                          {category.subcategories.length > 0 && (
                            <>
                              {category.subcategories.map((subcategory) => (
                                <DropdownMenuItem key={subcategory.id} asChild>
                                  <Link 
                                    href={`/shop?category=${category.slug}`}
                                    className="w-full pl-4 text-sm text-gray-600 dark:text-gray-300 hover:text-zuree-red"
                                  >
                                    {subcategory.name}
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                              
                              {/* View All Link */}
                              {category.subcategories.length > 3 && (
                                <DropdownMenuItem asChild>
                                  <Link 
                                    href={`/shop?category=${category.slug}`} 
                                    className="w-full pl-4 text-xs text-zuree-red italic hover:underline"
                                  >
                                    View all {category.name.toLowerCase()} →
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          
                          {/* Separator between categories */}
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
                <Link href="/tailoredoutfit" className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors flex items-center">
                  <Scissors className="h-4 w-4 mr-1" /> Custom Design
                </Link>
              </li>
              <li>
                <Link href="/bulk-order" className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors flex items-center">
                  <Layers className="h-4 w-4 mr-1" /> Bulk Order
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

          {/* Mobile Navigation Dropdown */}
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
                    
                    {/* Mobile Categories */}
                    <div className="pl-4 space-y-2">
                      {categoriesLoading ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                      ) : (
                        categories.map((category) => (
                          <div key={category.id} className="space-y-1">
                            {/* Main Category - Mobile */}
                            <Link 
                              href={`/shop?category=${category.slug}`} 
                              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-zuree-red transition-colors block py-1"
                              onClick={closeMobileMenu}
                            >
                              {category.name}
                            </Link>
                            
                            {/* Subcategories - Mobile */}
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
                    href="/tailoredoutfit" 
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors flex items-center py-2"
                    onClick={closeMobileMenu}
                  >
                    <Scissors className="h-4 w-4 mr-1" /> Custom Design
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/bulk-order" 
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-zuree-red transition-colors flex items-center py-2"
                    onClick={closeMobileMenu}
                  >
                    <Layers className="h-4 w-4 mr-1" /> Bulk Order
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

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <ModeToggle />
            
            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-900 dark:text-white">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-900 dark:text-white">
                    <User className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800">
                  <DialogHeader>
                    <DialogTitle>{authMode === 'login' ? 'Login' : 'Sign Up'}</DialogTitle>
                    <DialogDescription>
                      {authMode === 'login' 
                        ? 'Enter your credentials to access your account' 
                        : 'Create a new account to get started'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {authError && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded">
                      {authError}
                    </div>
                  )}

                  {authMode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <Input
                          id="email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                        <Input
                          id="password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={authLoading}>
                        {authLoading ? 'Logging in...' : 'Login'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="w-full"
                        onClick={() => setAuthMode('signup')}
                      >
                        Don't have an account? Sign up
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
                          <Input
                            id="firstName"
                            value={signupFirstName}
                            onChange={(e) => setSignupFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
                          <Input
                            id="lastName"
                            value={signupLastName}
                            onChange={(e) => setSignupLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="signupEmail" className="block text-sm font-medium mb-1">Email</label>
                        <Input
                          id="signupEmail"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="signupPassword" className="block text-sm font-medium mb-1">Password</label>
                        <Input
                          id="signupPassword"
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={authLoading}>
                        {authLoading ? 'Creating account...' : 'Sign Up'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="w-full"
                        onClick={() => setAuthMode('login')}
                      >
                        Already have an account? Login
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            )}

            {/* Cart */}
            <CartDrawer>
              <Button variant="ghost" size="icon" className="relative text-gray-900 dark:text-white">
                <ShoppingBag className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-zuree-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </CartDrawer>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;