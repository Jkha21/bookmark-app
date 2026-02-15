'use client';

import { useState } from 'react';
import { useAddBookmark } from '@/hooks/useAddBookmark';

interface BookmarkFormProps {
  onBookmarkAdded: () => void;
}

export default function BookmarkForm({ onBookmarkAdded }: BookmarkFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const { addBookmark, loading, error, clearError } = useAddBookmark();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      return;
    }

    console.log('Adding bookmark:', { title, url });
    const result = await addBookmark(title, url);
    console.log('Add bookmark result:', result);

    if (result?.success) {
      setTitle('');
      setUrl('');
      onBookmarkAdded();
    }
  };

  return (
    <div className="w-full flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/80 dark:bg-gray-800/90 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">Add New Bookmark</h2>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50/90 dark:bg-red-900/80 border border-red-200/50 dark:border-red-800/50 text-red-800 dark:text-red-200 rounded-xl text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., GitHub"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/75 outline-none bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 transition-all text-sm sm:text-base shadow-sm hover:shadow-md disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
              URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://github.com"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/75 outline-none bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 transition-all text-sm sm:text-base shadow-sm hover:shadow-md disabled:opacity-50"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 sm:mt-8 w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold py-3 px-6 sm:py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer backdrop-blur-sm border border-emerald-300/50 dark:border-emerald-700/50"
        >
          {loading ? 'Adding...' : 'Add Bookmark'}
        </button>
      </form>
    </div>
  );
}
