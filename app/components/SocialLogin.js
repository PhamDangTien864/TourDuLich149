'use client';

import { useState } from 'react';
import { Chrome as GoogleIcon, Facebook as FacebookIcon, Loader2 } from 'lucide-react';

export default function SocialLogin({ onSuccess, onError }) {
  const [loading, setLoading] = useState(null); // 'google' | 'facebook' | null

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      // Load Google Identity Services
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initializeGoogleSignIn();
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    } catch (error) {
      console.error('Google login error:', error);
      onError?.(error);
      setLoading(null);
    }
  };

  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.error('Google sign-in not displayed');
        setLoading(null);
      }
    });
  };

  const handleGoogleCallback = async (response) => {
    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          accessToken: response.credential,
          userInfo: parseJwt(response.credential)
        })
      });

      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        onSuccess?.(data.user);
      } else {
        onError?.(data.error);
      }
    } catch (error) {
      console.error('Google callback error:', error);
      onError?.(error);
    } finally {
      setLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading('facebook');
    try {
      // Load Facebook SDK
      if (!window.FB) {
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.onload = () => initializeFacebookSDK();
        document.head.appendChild(script);
      } else {
        initializeFacebookSDK();
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      onError?.(error);
      setLoading(null);
    }
  };

  const initializeFacebookSDK = () => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });

      window.FB.login(function(response) {
        if (response.authResponse) {
          handleFacebookCallback(response.authResponse.accessToken);
        } else {
          console.error('Facebook login failed');
          setLoading(null);
        }
      }, { scope: 'email,public_profile' });
    };

    // Load SDK
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  };

  const handleFacebookCallback = async (accessToken) => {
    try {
      // Get user info from Facebook
      window.FB.api('/me', { fields: 'name,email,picture' }, async (response) => {
        const res = await fetch('/api/auth/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'facebook',
            accessToken,
            userInfo: {
              id: response.id,
              name: response.name,
              email: response.email,
              picture: response.picture?.data?.url
            }
          })
        });

        const data = await res.json();
        
        if (data.success) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          onSuccess?.(data.user);
        } else {
          onError?.(data.error);
        }
        setLoading(null);
      });
    } catch (error) {
      console.error('Facebook callback error:', error);
      onError?.(error);
      setLoading(null);
    }
  };

  // Helper function to parse JWT token
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500 font-bold">Hoặc đăng nhập với</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleGoogleLogin}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'google' ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <GoogleIcon size={20} className="text-red-500" />
          )}
          <span>Google</span>
        </button>

        <button
          onClick={handleFacebookLogin}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'facebook' ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <FacebookIcon size={20} className="text-blue-600" />
          )}
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
}
