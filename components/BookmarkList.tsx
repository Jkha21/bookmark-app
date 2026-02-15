'use client';

import { useBookmarks } from '@/hooks/useBookmarks';
import { useState, useEffect, useRef, useCallback } from 'react';

interface BookmarkListProps {
  refreshTrigger: number;
}

export default function BookmarkList({ refreshTrigger }: BookmarkListProps) {
  const { 
    bookmarks, 
    loading, 
    error, 
    deleteBookmark,
    hasMore,
    loadMore 
  } = useBookmarks(refreshTrigger);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Vanilla Intersection Observer for infinite scroll
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !loading && !isScrolling) {
      setIsScrolling(true);
      loadMore();
      // Reset after short delay to prevent rapid calls
      setTimeout(() => setIsScrolling(false), 100);
    }
  }, [hasMore, loading, isScrolling, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [observerCallback]);

  if (loading && bookmarks.length === 0) {
    return (
      <div className="flex min-h-[200px] justify-center items-center py-12 px-4">
        <div className="text-center">
          <div className="mx-auto inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-indigo-600 mb-3"></div>
          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading bookmarks...</div>
        </div>
      </div>
    );
  }

  if (error && !bookmarks.length) {
    return (
      <div className="w-full py-20 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error loading bookmarks</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!bookmarks.length) {
    return (
      <div className="w-full py-20 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2-2 2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No bookmarks yet</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">Add your first bookmark using the form above to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">Your Bookmarks</h2>
          <div className="flex items-center gap-4">
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{bookmarks.length} saved</p>
          </div>
        </div>

        {/* Controls Row */}
        {bookmarks.length > 5 && (
          <div className="mb-6 flex flex-wrap gap-3 sm:gap-4 items-center justify-start pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium">
                All
              </button>
              <button className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/80 dark:hover:bg-blue-800/80 dark:text-blue-200 rounded-lg transition-colors font-medium">
                Recent
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Sort by:</span>
              <select className="bg-transparent border border-gray-300/50 dark:border-gray-600/50 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                <option>Date Added</option>
                <option>Title</option>
                <option>URL</option>
              </select>
            </div>
          </div>
        )}

        {/* Bookmarks Grid */}
        <div className="space-y-3 sm:space-y-4">
          {bookmarks.map((bookmark, index) => (
            <div 
              key={bookmark.id} 
              className={`group bg-white/80 dark:bg-neutral-900/90 rounded-2xl shadow-lg hover:shadow-xl p-4 sm:p-5 md:p-6 backdrop-blur-sm border border-gray-200/50 dark:border-neutral-800/50 hover:border-indigo-200/50 dark:hover:border-indigo-800/50 transition-all duration-300 ${
                index % 2 === 0 ? 'sm:hover:translate-x-1' : 'sm:hover:-translate-x-1'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-base sm:text-lg md:text-xl font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group-hover:underline line-clamp-2 sm:line-clamp-1 break-words transition-colors"
                    title={bookmark.title}
                  >
                    {bookmark.title}
                  </a>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all line-clamp-1 mt-1 sm:mt-2 max-w-full">
                    {bookmark.url}
                  </p>
                </div>
                
                {/* ✅ RESPONSIVE DELETE BUTTON */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 sm:mt-0 sm:ml-auto">
                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-red-100/90 hover:bg-red-200/90 dark:bg-red-900/80 dark:hover:bg-red-800/90 text-red-700 dark:text-red-200 rounded-xl hover:shadow-md transition-all text-xs sm:text-sm font-medium backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 flex items-center justify-center gap-1.5 sm:whitespace-nowrap flex-1 sm:flex-none cursor-pointer"
                    title="Delete bookmark"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden xs:inline sm:text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading More Indicator */}
        {loading && bookmarks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200/30 dark:border-gray-700/30 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              <span>Loading more bookmarks...</span>
            </div>
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        {hasMore && (
          <div 
            ref={sentinelRef}
            className="h-20 flex items-center justify-center py-8 opacity-0"
            aria-hidden="true"
          />
        )}

        {/* No More Items Message */}
        {!hasMore && bookmarks.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200/30 dark:border-gray-700/30 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All bookmarks loaded ({bookmarks.length} total)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
