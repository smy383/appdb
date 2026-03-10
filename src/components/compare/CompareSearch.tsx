"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AppInfo } from "@/types/app";

interface SearchResult {
  id: string;
  name: string;
  artistName: string;
  artworkUrl: string;
  primaryGenreName: string;
}

interface CompareSearchProps {
  onSelect: (app: AppInfo) => void;
  placeholder: string;
  selectedApp?: AppInfo | null;
  onClear?: () => void;
}

export default function CompareSearch({
  onSelect,
  placeholder,
  selectedApp,
  onClear,
}: CompareSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(term.trim())}`
      );
      const data = await res.json();
      setResults(data.results || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelect(result: SearchResult) {
    setIsOpen(false);
    setQuery("");
    setResults([]);

    // Fetch full app details
    try {
      const res = await fetch(`/api/app/${result.id}`);
      if (res.ok) {
        const app: AppInfo = await res.json();
        onSelect(app);
      }
    } catch (error) {
      console.error("Failed to fetch app details:", error);
    }
  }

  if (selectedApp) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-900 p-4">
        <img
          src={selectedApp.artworkUrl}
          alt={selectedApp.name}
          className="h-14 w-14 flex-shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {selectedApp.name}
          </p>
          <p className="truncate text-xs text-gray-400">
            {selectedApp.artistName}
          </p>
          <span className="mt-1 inline-block rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
            {selectedApp.primaryGenreName}
          </span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="flex-shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-700 bg-gray-900 py-4 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-800"
            >
              <img
                src={result.artworkUrl}
                alt={result.name}
                className="h-10 w-10 flex-shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {result.name}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {result.artistName}
                </p>
              </div>
              <span className="flex-shrink-0 rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                {result.primaryGenreName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
