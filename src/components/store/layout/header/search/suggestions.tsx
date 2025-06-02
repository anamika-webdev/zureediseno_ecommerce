"use client";

import { SearchResult } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SuggestionsProps {
  suggestions: SearchResult[];
  onSuggestionClick?: () => void;
}

export default function Suggestions({ suggestions, onSuggestionClick }: SuggestionsProps) {
  const router = useRouter();

  const handlePush = (slug?: string) => {
    if (slug) {
      router.push(`/product/${slug}`);
    }
    onSuggestionClick?.();
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {suggestions.map((sugg) => (
        <div
          key={sugg.id}
          className="w-full h-20 px-6 cursor-pointer hover:bg-[#f5f5f5] flex items-center gap-x-2"
          onClick={() => handlePush(sugg.slug)}
        >
          {sugg.image && (
            <Image
              src={sugg.image}
              alt={sugg.name}
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded-md bg-gray-200"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{sugg.name}</h4>
            {sugg.description && (
              <p className="text-sm text-gray-600 truncate">{sugg.description}</p>
            )}
            {sugg.price && (
              <p className="text-sm font-semibold text-blue-600">₹{sugg.price}</p>
            )}
          </div>
          {sugg.category && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {sugg.category}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}