'use client';

import { useState, useCallback } from 'react';

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get bookings for user
  const getBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
      
      setBookings(data.data);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get booking by ID
  const getBookingById = useCallback(async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch booking');
      }
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create booking
  const createBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }
      
      // Refresh bookings list
      await getBookings();
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getBookings]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      // Refresh bookings list
      await getBookings();
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getBookings]);

  // Get booking history
  const getBookingHistory = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const res = await fetch(`/api/bookings/history?${queryParams.toString()}`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch booking history');
      }
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load bookings on mount
  const loadBookings = useCallback(() => {
    getBookings();
  }, [getBookings]);

  return {
    bookings,
    loading,
    error,
    getBookings,
    getBookingById,
    createBooking,
    cancelBooking,
    getBookingHistory,
    loadBookings
  };
}
