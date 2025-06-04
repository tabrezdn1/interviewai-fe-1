import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Go back to previous page in history
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="relative mb-6">
          <h1 className="text-9xl font-bold text-muted/10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent font-bold">404</span>
          </div>
        </div>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link to="/" className="gap-2 inline-flex items-center">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button onClick={goBack} variant="outline" className="gap-2 inline-flex items-center">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;