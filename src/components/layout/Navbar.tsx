import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, BarChart2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isTransparent 
          ? "bg-transparent py-5" 
          : "bg-white/80 backdrop-blur-md shadow-sm py-3"
      )}
    >
      <div className="container-custom mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          className="text-2xl font-bold flex items-center gap-2 transition-colors"
          onClick={closeMenu}
        >
          {/* Logo with glow effect on hover */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full opacity-0 group-hover:opacity-70 blur-md transition-opacity"></div>
            <div className="relative">
              <MessageSquare className={cn(
                "h-6 w-6 transition-colors", 
                isTransparent ? "text-white" : "text-primary-600"
              )} />
            </div>
          </div>
          <span className={cn(
            "transition-colors", 
            isTransparent ? "text-white" : "text-gray-900"
          )}>
            InterviewAI
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6">
            {user ? (
              <>
                <NavLink 
                  to="/dashboard" 
                  label="Dashboard" 
                  isTransparent={isTransparent}
                />
                <NavLink 
                  to="/setup" 
                  label="New Interview" 
                  isTransparent={isTransparent}
                />
              </>
            ) : (
              <>
                <NavLink 
                  to="/#features" 
                  label="Features" 
                  isTransparent={isTransparent}
                />
                <NavLink 
                  to="/pricing" 
                  label="Pricing" 
                  isTransparent={isTransparent}
                />
                <NavLink 
                  to="/about" 
                  label="About" 
                  isTransparent={isTransparent}
                />
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "font-medium", 
                    isTransparent ? "text-white" : "text-gray-700"
                  )}>
                    {user.name}
                  </span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className={cn(
                    "flex items-center gap-2",
                    isTransparent ? "text-white hover:bg-white/10" : "text-gray-700"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className={isTransparent ? "text-white hover:bg-white/10" : ""}>
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/login?signup=true">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={cn(
            "md:hidden focus:outline-none",
            isTransparent ? "text-white" : "text-gray-700"
          )}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container-custom mx-auto flex flex-col space-y-3">
            {user ? (
              <>
                <MobileNavLink to="/dashboard\" label="Dashboard\" onClick={closeMenu} />
                <MobileNavLink to="/setup" label="New Interview" onClick={closeMenu} />
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700">{user.name}</span>
                  </div>
                  <Button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    variant="outline"
                    className="w-full justify-center gap-2 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <MobileNavLink to="/#features" label="Features" onClick={closeMenu} />
                <MobileNavLink to="/pricing" label="Pricing" onClick={closeMenu} />
                <MobileNavLink to="/about" label="About" onClick={closeMenu} />
                <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={closeMenu}
                  >
                    <Link to="/login">
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    className="w-full justify-center"
                    onClick={closeMenu}
                  >
                    <Link to="/login?signup=true">
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  label: string;
  isTransparent: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, label, isTransparent }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.hash === to;
  
  return (
    <Link 
      to={to} 
      className={cn(
        "font-medium transition-colors relative group",
        isActive 
          ? "text-primary-600" 
          : isTransparent 
            ? "text-white/90 hover:text-white" 
            : "text-gray-700 hover:text-primary-600"
      )}
    >
      {label}
      <span className={cn(
        "absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full",
        isActive ? "w-full" : "w-0"
      )}></span>
    </Link>
  );
};

interface MobileNavLinkProps {
  to: string;
  label: string;
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.hash === to;
  
  return (
    <Link 
      to={to} 
      className={cn(
        "py-2 px-4 font-medium", 
        isActive ? "text-primary-600" : "text-gray-700"
      )}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default Navbar;