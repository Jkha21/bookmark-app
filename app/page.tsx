'use client';

import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import BookmarkForm from '@/components/BookmarkForm';
import BookmarkList from '@/components/BookmarkList';
import { useState, useMemo } from 'react';

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Memoize header content to prevent re-renders
  const headerContent = useMemo(() => ({
    logo: (
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
    ),
    title: "My Bookmarks",
    subtitle: "Organize your links"
  }), []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center w-screen px-4 py-12 sm:py-24">
        <div className="text-center">
          <div className="mx-auto inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      {/* Optimized Header - Memoized + Stable */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-white/80 dark:border-neutral-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
            
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {headerContent.logo}
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {headerContent.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 hidden lg:block">
                  {headerContent.subtitle}
                </p>
              </div>
            </div>

            {/* Right: User info + Sign out */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
              {/* Email - Responsive truncation */}
              <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-blue-50/90 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 text-xs sm:text-sm font-medium rounded-lg backdrop-blur-sm border border-blue-200/60 dark:border-blue-800/60 shadow-sm truncate max-w-[140px] sm:max-w-[200px] lg:max-w-none hidden sm:inline">
                {user.email}
              </div>
              
              {/* Responsive Sign Out Button */}
              <button
                onClick={signOut}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/90 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:shadow-sm transition-all text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer flex-shrink-0"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full bg-gray-50 dark:bg-neutral-950 min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <BookmarkForm onBookmarkAdded={() => setRefreshTrigger(prev => prev + 1)} />
          
          {/* Optimized divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300/30 dark:via-gray-700/50 to-transparent my-8 sm:my-12 border-0" 
               aria-hidden="true">
          </div>
          
          <BookmarkList refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </>
  );
}
