import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Github, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import EmailSignInForm from '../components/auth/EmailSignInForm';
import EmailSignUpForm from '../components/auth/EmailSignUpForm';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<'oauth' | 'email'>('oauth');
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { login, signUp, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if the URL has signup parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setIsSignUp(true);
    }
    
    // Check if we're returning from an OAuth redirect
    if (location.hash && (location.hash.includes('access_token') || location.hash.includes('error'))) {
      setIsRedirecting(true);
    }
  }, [location]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);
  
  const handleOAuthLogin = async (provider: string) => {
    try {
      setError(null);
      setIsSubmitting(true);
      setIsRedirecting(true);
      await login(provider, undefined, { redirectTo: `${window.location.origin}/dashboard` });
      // Note: The page will redirect, so we don't need to navigate here
    } catch (error) {
      console.error('Login failed:', error);
      setError('Authentication failed. Please try again.');
      setIsRedirecting(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEmailSignIn = async (data: { email: string; password: string }) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login('email', data);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in failed:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEmailSignUp = async (data: { email: string; password: string; name: string }) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signUp(data);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign up failed:', error);
      
      // Handle specific error cases
      if (error.code === 'user_already_exists' || error.message?.includes('User already registered')) {
        setError('This email is already registered. Please sign in instead.');
        // Automatically switch to sign-in mode to help the user
        setIsSignUp(false);
      } else {
        setError(error.error_description || error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4 mx-auto"></div>
          <h3 className="text-lg font-medium mb-2">
            {isRedirecting ? 'Redirecting to authenticate...' : 'Loading...'}
          </h3>
          <p className="text-muted-foreground">
            {isRedirecting ? 'Please wait while we connect to your account.' : 'Please wait...'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 bg-muted/30 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border shadow-md">
          <CardHeader className="text-center space-y-1">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Sign up to start practicing interviews with AI' 
                : 'Sign in to continue your interview practice'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            
            {formMode === 'oauth' ? (
              <div className="space-y-4">
                <Button
                  onClick={() => handleOAuthLogin('google')}
                  variant="outline"
                  className="w-full justify-center gap-3"
                  disabled={isSubmitting}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {isSubmitting ? 'Connecting...' : 'Continue with Google'}
                </Button>
                
                <Button
                  onClick={() => handleOAuthLogin('github')}
                  variant="outline"
                  className="w-full justify-center gap-3 bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
                  disabled={isSubmitting}
                >
                  <Github className="h-5 w-5" />
                  {isSubmitting ? 'Connecting...' : 'Continue with GitHub'}
                </Button>
                
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-4 text-sm text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setFormMode('email')}
                  variant="outline"
                  className="w-full justify-center gap-3"
                >
                  <Mail className="h-5 w-5" />
                  Continue with Email
                </Button>
              </div>
            ) : (
              <>
                {isSignUp ? (
                  <EmailSignUpForm 
                    onSubmit={handleEmailSignUp}
                    isLoading={isSubmitting}
                    onCancel={() => setFormMode('oauth')}
                  />
                ) : (
                  <EmailSignInForm 
                    onSubmit={handleEmailSignIn}
                    isLoading={isSubmitting}
                    onCancel={() => setFormMode('oauth')}
                  />
                )}
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-medium hover:text-primary/90"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;