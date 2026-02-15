'use client';

import { useState, useCallback } from 'react';
import { supabase, ensureDatabaseInitialized } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function useAddBookmark() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const addBookmark = useCallback(
    async (title: string, url: string) => {
      setError('');
      setLoading(true);

      try {
        // Check authentication
        if (!user?.id) {
          throw new Error('You must be logged in to add bookmarks');
        }

        // Ensure database is initialized
        await ensureDatabaseInitialized();

        // Validate inputs
        if (!title.trim() || !url.trim()) {
          setError('Please fill in all fields');
          return { success: false };
        }

        // Validate URL format
        try {
          new URL(url);
        } catch {
          setError('Please enter a valid URL');
          return { success: false };
        }

        // Insert bookmark
        const { data, error: insertError } = await supabase
          .from('bookmarks')
          .insert([
            {
              title: title.trim(),
              url: url.trim(),
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          
          // Handle specific table errors
          if (insertError.message.includes('bookmarks') || insertError.message.includes('relation')) {
            setError('Database not ready. Please refresh and try again.');
          } else {
            setError(`Failed to add bookmark: ${insertError.message}`);
          }
          return { success: false };
        }

        console.log('Bookmark added:', data);
        // Broadcast to other tabs as a fast-fallback for realtime
        try {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('bookmarks');
            bc.postMessage({ type: 'INSERT', bookmark: data });
            bc.close();
          }
        } catch (bcErr) {
          console.warn('BroadcastChannel failed:', bcErr);
        }

        return { success: true, bookmark: data };

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add bookmark';
        setError(errorMsg);
        console.error('Error adding bookmark:', err);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const clearError = useCallback(() => setError(''), []);

  return {
    addBookmark,
    loading,
    error,
    clearError,
  };
}
