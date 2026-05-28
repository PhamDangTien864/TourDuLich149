'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Error parsing user_data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for storage changes (sync across tabs)
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error('Error parsing user_data:', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user data in localStorage
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser(data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.clear();
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    router.push('/login');
    router.refresh();
  }, [router]);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if user is admin
  const isAdmin = user?.role_id === 1 || user?.role === 1;

  // Check if user is customer
  const isCustomer = user?.role_id === 2 || user?.role === 2;

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isCustomer,
    login,
    register,
    logout
  };
}
