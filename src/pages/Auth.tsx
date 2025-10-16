import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { trackCompleteRegistration } from '@/services/facebookPixelService';

const Auth = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Get returnTo parameter from URL
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get('returnTo');
    
    // If user is already authenticated, redirect to returnTo or dashboard
    if (user && !loading) {
      const targetPath = returnTo || '/dashboard';
      console.log('🔄 [AUTH] User authenticated, redirecting to:', targetPath);
      
      // Track successful registration/login
      trackCompleteRegistration('Google');
      
      navigate(targetPath);
      return;
    }

    // If not loading and no user, trigger Google sign-in
    if (!loading && !user) {
      signInWithGoogle();
    }
  }, [user, loading, signInWithGoogle, navigate]);

  return (
    <div className="page-container bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center bg-black/20 border-white/10 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-tiptop-purple mb-2">tiptop</h1>
            <h2 className="text-xl font-semibold text-white mb-2">Sign In to Continue</h2>
            <p className="text-gray-300">Redirecting you to Google to sign in...</p>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin text-tiptop-purple" />
            <span>Signing you in with Google...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;