import React from 'react';
import { AuthProvider as ContextProvider } from '../../context/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <ContextProvider>{children}</ContextProvider>;
};

export default AuthProvider;