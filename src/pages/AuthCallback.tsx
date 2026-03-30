import { useEffect } from 'react';
import { setTokens } from '../lib/api';

const AuthCallback = ({ onLogin }: { onLogin: (user: any) => void }) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken  = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      // Save tokens
      setTokens({ accessToken, refreshToken });

      // Fetch user data
      fetch('http://localhost:4000/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            onLogin(data.user);
          }
          // Redirect to home
          window.location.href = '/';
        })
        .catch(() => {
          window.location.href = '/';
        });
    } else {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-b-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;