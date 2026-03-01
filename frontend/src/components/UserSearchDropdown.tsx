"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Spinner } from "@/components/ui";

interface UserSearchResult {
  id: string;
  nickname: string;
  email: string;
}

interface UserSearchDropdownProps {
  placeholder?: string;
  onSelect: (user: { id: string; nickname: string; email: string }) => void;
  selectedUser: { id: string; nickname: string; email: string } | null;
  onClear: () => void;
}

export default function UserSearchDropdown({
  placeholder = "사용자 검색...",
  onSelect,
  selectedUser,
  onClear,
}: UserSearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.get<UserSearchResult[]>(
        `/api/admin/users/search?q=${encodeURIComponent(keyword)}`
      );
      setResults(data);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      search(value);
    }, 300);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSelect = (user: UserSearchResult) => {
    onSelect(user);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onClear();
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  if (selectedUser) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium">{selectedUser.nickname}</span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {selectedUser.email}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="선택 해제"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Spinner size="sm" />
        </div>
      )}

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              검색 결과 없음
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto py-1">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user)}
                    className="w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="font-medium">{user.nickname}</span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      {user.email}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
