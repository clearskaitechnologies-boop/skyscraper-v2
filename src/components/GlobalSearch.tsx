"use client";

import {
  Briefcase,
  Building2,
  Clock,
  Cpu,
  FileText,
  Search,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback,useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  type: "lead" | "claim" | "contact" | "project" | "report";
  subtitle?: string;
  href: string;
  metadata?: Record<string, any>;
}

const getTypeIcon = (type: SearchResult["type"]) => {
  const iconClass = "h-4 w-4";
  switch (type) {
    case "lead":
      return <Briefcase className={iconClass} />;
    case "claim":
      return <FileText className={iconClass} />;
    case "contact":
      return <User className={iconClass} />;
    case "project":
      return <Cpu className={iconClass} />;
    case "report":
      return <Building2 className={iconClass} />;
    default:
      return <Search className={iconClass} />;
  }
};

const getTypeColor = (type: SearchResult["type"]) => {
  switch (type) {
    case "lead":
      return "text-blue-600 bg-blue-50";
    case "claim":
      return "text-orange-600 bg-orange-50";
    case "contact":
      return "text-purple-600 bg-purple-50";
    case "project":
      return "text-green-600 bg-green-50";
    case "report":
      return "text-indigo-600 bg-indigo-50";
    default:
      return "text-slate-600 bg-slate-50";
  }
};

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

export default function GlobalSearch({
  className,
  placeholder = "Search leads, claims, contacts...",
}: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((result: SearchResult) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.id !== result.id);
      const updated = [result, ...filtered].slice(0, 5); // Keep only 5 recent
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search/global?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [debouncedQuery, performSearch]);

  // Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(result);
      router.push(result.href);
      setIsOpen(false);
      setQuery("");
      setResults([]);
    },
    [router, saveRecentSearch]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const currentResults = results.length > 0 ? results : recentSearches;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < currentResults.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (currentResults[selectedIndex]) {
            handleSelect(currentResults[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, recentSearches, selectedIndex, handleSelect]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const currentResults = results.length > 0 ? results : recentSearches;
  const showResults = isOpen && (results.length > 0 || recentSearches.length > 0 || query.length > 0);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentResults[selectedIndex]) {
            handleSelect(currentResults[selectedIndex]);
          }
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            data-global-search
            className="w-64 rounded-lg border-slate-200 py-2 pl-10 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[400px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-3 text-center text-sm text-slate-500">
              Searching...
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-500">No results found for "{query}"</p>
              <p className="mt-1 text-xs text-slate-400">
                Try searching for leads, claims, contacts, or projects
              </p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && results.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Results ({results.length})
              </div>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    index === selectedIndex
                      ? "bg-blue-50 text-blue-900"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      getTypeColor(result.type)
                    )}
                  >
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-sm font-medium">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="truncate text-xs text-slate-500">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="text-xs capitalize text-slate-400">
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!isLoading && query.length < 2 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recent
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    index === selectedIndex
                      ? "bg-blue-50 text-blue-900"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-sm font-medium">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="truncate text-xs text-slate-500">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="text-xs capitalize text-slate-400">
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
