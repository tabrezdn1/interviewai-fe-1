import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * This component handles the OAuth callback from external providers
 * It should be rendered at the /auth/callback route
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process the OAuth callback
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback handler executing");
        
        // Check if we have hash params from the redirect
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log("Found access token in hash, setting session manually");
          // Manually set the session if we have token in hash
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          if (sessionError) {
            console.error('Error setting session manually:', sessionError);
            setError(sessionError.message);
            return;
          }
          
          if (sessionData.session) {
            console.log('Successfully set session from hash params');
            navigate('/dashboard');
            return;
          }
        }
        
        // Get the session (Supabase should handle extracting it from URL)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session during auth callback:', error);
          setError(error.message);
          setTimeout(() => navigate('/login?error=' + encodeURIComponent(error.message)), 1500);
          return;
        }
        
        if (data.session) {
          console.log('Successfully authenticated!');
          // Redirect to dashboard after successful authentication
          navigate('/dashboard');
        } else {
          // If no session was created, redirect back to login
          setError('No session was created. Please try again.');
          setTimeout(() => navigate('/login?error=Authentication failed'), 1500);
        }
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        setError(error.message || 'An unexpected error occurred');
        setTimeout(() => navigate('/login?error=' + encodeURIComponent('Authentication failed')), 1500);
      }
    };

    handleAuthCallback();
  }, [navigate, location.hash]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-destructive text-xl mb-4">Authentication Error</div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4 mx-auto"></div>
            <h3 className="text-lg font-medium mb-2">Completing authentication...</h3>
            <p className="text-muted-foreground">Please wait while we sign you in.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;