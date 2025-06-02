"use client";

import { SearchResult } from "@/lib/types";
import { Search as SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useState } from "react";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Mock search results for now
      // Replace this with actual API call when search endpoint is available
      const mockResults: SearchResult[] = [
        {
          id: "1",
          name: "Classic White Shirt",
          description: "Premium cotton shirt for formal occasions",
          price: 2999,
          image: "/images/products/shirt1.jpg",
          category: "Men's Clothing",
          slug: "classic-white-shirt"
        },
        {
          id: "2", 
          name: "Casual Denim Jacket",
          description: "Comfortable denim jacket for casual wear",
          price: 3999,
          image: "/images/products/jacket1.jpg",
          category: "Men's Clothing",
          slug: "casual-denim-jacket"
        }
      ].filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.description?.toLowerCase().includes(value.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchTerm("");
    if (result.slug) {
      router.push(`/product/${result.slug}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="relative flex-1 max-w-lg">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.trim().length >= 2 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchResults.map((result) => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              {result.image && (
                <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={result.image}
                    alt={result.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{result.name}</h4>
                {result.description && (
                  <p className="text-sm text-gray-600 truncate">{result.description}</p>
                )}
                {result.price && (
                  <p className="text-sm font-semibold text-blue-600">₹{result.price}</p>
                )}
              </div>
              {result.category && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {result.category}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showResults && searchTerm.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
          No products found for "{searchTerm}"
        </div>
      )}
    </div>
  );
}