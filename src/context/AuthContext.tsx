import React, { createContext, useState, useEffect } from 'react';
import { mockUser } from '../data/users';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (provider: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth state in localStorage on initial load
    const savedUser = localStorage.getItem('interviewai_user');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (provider: string): Promise<void> => {
    // Mock login - replace with actual OAuth implementation
    console.log(`Logging in with ${provider}`);
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to state and localStorage
    setUser(mockUser);
    localStorage.setItem('interviewai_user', JSON.stringify(mockUser));
    
    setLoading(false);
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('interviewai_user');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;