import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * This component handles the OAuth callback from external providers
 * It should be rendered at the /auth/callback route
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Completing your sign in...');

  useEffect(() => {
    // Process the OAuth callback
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback handler executing");
        setMessage("Processing authentication response...");
        
        // Check for access_token in hash (implicit flow)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log("Found access_token in hash, setting session manually");
            setMessage("Setting up your session...");
            
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              throw error;
            }
            
            if (data.session) {
              console.log("Session set successfully!");
              navigate('/dashboard');
              return;
            }
          }
        }
        
        // Check for code in URL (PKCE flow)
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
          console.log("Found code parameter, exchanging for session");
          setMessage("Exchanging authorization code...");
          
          // The code exchange should happen automatically via Supabase's detectSessionInUrl
          // We just need to get the session to confirm
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (data.session) {
            console.log("Session obtained successfully!");
            navigate('/dashboard');
          } else {
            // If still no session, let's try to process it manually
            setMessage("Finalizing authentication...");
            
            // Wait a moment to allow Supabase to process
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: retryData, error: retryError } = await supabase.auth.getSession();
            
            if (retryError) {
              throw retryError;
            }
            
            if (retryData.session) {
              console.log("Session obtained on retry!");
              navigate('/dashboard');
            } else {
              throw new Error("Could not establish a session. Please try logging in again.");
            }
          }
        } else {
          // Check for stored tokens from processHashParams
          const accessToken = sessionStorage.getItem('sb-access-token');
          const refreshToken = sessionStorage.getItem('sb-refresh-token');
          
          if (accessToken && refreshToken) {
            console.log("Found stored tokens, setting session");
            setMessage("Setting up your session from stored tokens...");
            
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              throw error;
            }
            
            if (data.session) {
              // Clean up tokens
              sessionStorage.removeItem('sb-access-token');
              sessionStorage.removeItem('sb-refresh-token');
              
              console.log("Session set successfully from stored tokens!");
              navigate('/dashboard');
              return;
            }
          }
          
          // No code or token found
          throw new Error("No authentication code or token found in the URL.");
        }
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        setError(error.message || 'Authentication failed');
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login?error=' + encodeURIComponent(error.message || 'Authentication failed'));
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg border text-center">
        {error ? (
          <>
            <div className="text-destructive text-xl mb-4">Authentication Error</div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-6 mx-auto"></div>
            <h3 className="text-xl font-medium mb-3">Almost there!</h3>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground/70 mt-4">
              If you're not redirected automatically, please click <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">here</button>.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;