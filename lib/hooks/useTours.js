'use client';

import { useState, useCallback, useEffect } from 'react';

export function useTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get tours with filters
  const getTours = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.q) queryParams.append('q', filters.q);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const res = await fetch(`/api/tours?${queryParams.toString()}`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tours');
      }
      
      setTours(data.data.tours);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tour by ID
  const getTourById = useCallback(async (tourId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tours/${tourId}`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tour');
      }
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tour availability
  const getTourAvailability = useCallback(async (tourId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tours/${tourId}/availability`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tour availability');
      }
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search tours
  const searchTours = useCallback(async (query, filters = {}) => {
    return getTours({ q: query, ...filters });
  }, [getTours]);

  // Load tours on mount with default filters
  const loadTours = useCallback((filters = {}) => {
    getTours(filters);
  }, [getTours]);

  return {
    tours,
    loading,
    error,
    getTours,
    getTourById,
    getTourAvailability,
    searchTours,
    loadTours
  };
}
