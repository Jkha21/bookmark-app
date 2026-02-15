'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, ensureDatabaseInitialized } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface UseBookmarksReturn {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string;
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  deleteBookmark: (id: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

export function useBookmarks(refreshTrigger: number): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();
  const PAGE_SIZE = 10;

  const fetchBookmarks = useCallback(async (isLoadMore = false, resetPage = false) => {
    if (!user?.id) {
      console.log('👤 No user - clearing bookmarks');
      setBookmarks([]);
      setLoading(false);
      setInitialLoading(false);
      return;
    }

    if (resetPage) {
      setPage(1);
      setHasMore(true);
    }

    const currentLoading = isLoadMore ? false : true;
    if (!isLoadMore) setLoading(currentLoading);
    if (!isLoadMore) setError('');

    try {
      await ensureDatabaseInitialized();
      
      console.log('🔍 Fetching bookmarks for user:', {
        userId: user.id,
        page: resetPage ? 1 : page,
        isLoadMore,
        pageSize: PAGE_SIZE
      });

      const offset = (page - 1) * PAGE_SIZE;
      
      const { data, error: fetchError, count } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      console.log('📊 Raw Supabase response:', { 
        dataLength: data?.length, 
        totalCount: count,
        offset,
        page,
        hasMore: count ? (offset + (data?.length || 0)) < count : false
      });

      if (fetchError) {
        const errorDetails = {
          userId: user.id,
          errorKeys: Object.keys(fetchError),
          errorType: typeof fetchError,
          isEmptyObject: Object.keys(fetchError).length === 0,
          fullError: JSON.stringify(fetchError, null, 2)
        };
        
        console.error('🚨 SUPABASE RLS ERROR - Policies blocking access:', errorDetails);
        
        setError('🚨 RLS Policy Error: Run this SQL in Supabase:\n\n' +
                'CREATE POLICY "Users can view own bookmarks" ON bookmarks\n' +
                'FOR SELECT USING (auth.uid()::text = user_id::text);\n\n' +
                '1. Supabase Dashboard → SQL Editor → Paste → Run');
        setBookmarks([]);
      } else {
        console.log('✅ Bookmarks loaded:', data?.length || 0);
        
        if (resetPage || initialLoading) {
          setBookmarks(data || []);
        } else {
          setBookmarks(prev => [...prev, ...(data || [])]);
        }
        
        // Update hasMore based on count
        if (count !== null) {
          setHasMore((offset + (data?.length || 0)) < count);
        } else {
          setHasMore((data || []).length === PAGE_SIZE);
        }
        
        setError('');
      }
    } catch (err) {
      console.error('🌐 Network/fetch error:', err);
      setError('Network error - check your connection');
      setBookmarks([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [user?.id, page, initialLoading]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !user?.id) return;
    
    console.log('📄 Loading more bookmarks... page:', page + 1);
    setPage(prev => prev + 1);
    await fetchBookmarks(true);
  }, [loading, hasMore, user?.id, page, fetchBookmarks]);

  const deleteBookmark = useCallback(async (id: string) => {
    if (!user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      console.log('🗑️ Deleting bookmark:', id);
      
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        const errorMessage = deleteError.message || 'Delete failed (check RLS)';
        return { success: false, error: errorMessage };
      }

      console.log('✅ Bookmark deleted');
      
      // Update local state optimistically
      setBookmarks(prev => prev.filter(b => b.id !== id));
      
      // Broadcast deletion to other tabs
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('bookmarks');
          bc.postMessage({ type: 'DELETE', bookmark: { id } });
          bc.close();
        }
      } catch (bcErr) {
        console.warn('BroadcastChannel delete failed:', bcErr);
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete bookmark';
      console.error('❌ Delete failed:', err);
      return { success: false, error: errorMsg };
    }
  }, [user?.id]);

  const refetch = useCallback(() => {
    fetchBookmarks(false, true);
  }, [fetchBookmarks]);

  // Initial fetch and refresh trigger
  useEffect(() => {
    fetchBookmarks(false, true);
  }, [fetchBookmarks, refreshTrigger]);

  // Realtime subscription for this user's bookmarks
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`bookmarks:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          try {
            const ev = payload.eventType;
            if (ev === 'INSERT') {
              const newRow = payload.new as unknown as Bookmark;
              setBookmarks((prev) => {
                if (prev.find((b) => b.id === newRow.id)) return prev;
                // Insert at top for new bookmarks
                const updated = [newRow, ...prev];
                // If we have more than PAGE_SIZE, trim from bottom
                if (updated.length > PAGE_SIZE * 2) {
                  updated.splice(PAGE_SIZE * 2);
                  setHasMore(true);
                }
                return updated;
              });
            } else if (ev === 'UPDATE') {
              const updated = payload.new as unknown as Bookmark;
              setBookmarks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            } else if (ev === 'DELETE') {
              const oldRow = payload.old as unknown as Bookmark;
              setBookmarks((prev) => {
                const newBookmarks = prev.filter((b) => b.id !== oldRow.id);
                // If we deleted from first page, refetch to maintain pagination
                if (prev.length <= PAGE_SIZE * 2) {
                  refetch();
                }
                return newBookmarks;
              });
            }
          } catch (err) {
            console.error('Realtime handling error:', err);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        // ignore
      }
    };
  }, [user?.id, refetch]);

  // BroadcastChannel fallback for same-browser tabs
  useEffect(() => {
    if (!user?.id || typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const bc = new BroadcastChannel('bookmarks');
    const onMessage = (ev: MessageEvent) => {
      try {
        const msg = ev.data;
        if (!msg || msg.bookmark?.user_id !== user.id) return;

        if (msg.type === 'INSERT') {
          setBookmarks((prev) => {
            if (prev.find((b) => b.id === msg.bookmark.id)) return prev;
            return [msg.bookmark, ...prev];
          });
        } else if (msg.type === 'UPDATE') {
          setBookmarks((prev) => prev.map((b) => (b.id === msg.bookmark.id ? msg.bookmark : b)));
        } else if (msg.type === 'DELETE') {
          setBookmarks((prev) => prev.filter((b) => b.id !== msg.bookmark.id));
        }
      } catch (err) {
        console.error('BroadcastChannel message error:', err);
      }
    };

    bc.addEventListener('message', onMessage as any);
    return () => {
      try {
        bc.removeEventListener('message', onMessage as any);
        bc.close();
      } catch (err) {
        // ignore
      }
    };
  }, [user?.id]);

  return {
    bookmarks,
    loading,
    error,
    deleteBookmark,
    refetch,
    hasMore,
    page,
    loadMore,
  };
}
