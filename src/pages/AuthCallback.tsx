import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * This component handles the OAuth callback from external providers
 * It should be rendered at the /auth/callback route
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Process the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL (the Supabase client will automatically handle this)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session during auth callback:', error);
          navigate('/login?error=Authentication failed');
          return;
        }
        
        if (data.session) {
          console.log('Successfully authenticated!');
          // Redirect to dashboard after successful authentication
          navigate('/dashboard');
        } else {
          // If no session was created, redirect back to login
          navigate('/login?error=Authentication failed');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login?error=Authentication failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4 mx-auto"></div>
        <h3 className="text-lg font-medium mb-2">Completing authentication...</h3>
        <p className="text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;