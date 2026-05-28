'use client';

import { useState, useCallback, useEffect } from 'react';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get wishlist for user
  const getWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch wishlist');
      }
      
      setWishlist(data.data.wishlist || []);
      return data.data.wishlist;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add tour to wishlist
  const addToWishlist = useCallback(async (tourId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tour_id: tourId })
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to add to wishlist');
      }
      
      // Refresh wishlist
      await getWishlist();
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getWishlist]);

  // Remove tour from wishlist
  const removeFromWishlist = useCallback(async (tourId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/wishlist/${tourId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to remove from wishlist');
      }
      
      // Refresh wishlist
      await getWishlist();
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getWishlist]);

  // Check if tour is in wishlist
  const isInWishlist = useCallback((tourId) => {
    return wishlist.some(item => item.tour_id === tourId);
  }, [wishlist]);

  // Toggle tour in wishlist
  const toggleWishlist = useCallback(async (tourId) => {
    if (isInWishlist(tourId)) {
      await removeFromWishlist(tourId);
      return false;
    } else {
      await addToWishlist(tourId);
      return true;
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // Load wishlist on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getWishlist();
  }, [getWishlist]);

  return {
    wishlist,
    loading,
    error,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist
  };
}
