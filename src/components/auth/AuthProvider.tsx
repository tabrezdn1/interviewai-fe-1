import React, { useEffect, useState } from 'react'
import { supabase, clearAuthTokens } from '../../lib/supabase'
import { AuthProvider as AuthContextProvider } from '../../context/AuthContext'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have any auth tokens that might be invalid
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Auth initialization error:', error.message)
          
          // If we get a refresh token error, clear everything and start fresh
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token')) {
            console.log('Clearing invalid auth tokens...')
            await clearAuthTokens()
          }
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        // Even if initialization fails, we should still render the app
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [])

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  )
}