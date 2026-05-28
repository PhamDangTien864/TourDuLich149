'use client';

import { useState, useCallback } from 'react';

export function useUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user by ID
  const getUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/customers/${userId}`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/customers/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update user');
      }

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
      const updatedUser = { ...storedUser, ...userData };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (userId, currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/customers/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword, newPassword })
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to change password');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUser,
    updateUser,
    changePassword
  };
}
