import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Eagerly loaded components
import Navbar from './components/layout/Navbar';
import AuthProvider from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './components/ThemeProvider';

// Lazily loaded pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InterviewSetup = lazy(() => import('./pages/InterviewSetup'));
const InterviewSession = lazy(() => import('./pages/InterviewSession'));
const FeedbackAnalysis = lazy(() => import('./pages/FeedbackAnalysis'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="interview-ai-theme">
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/setup" 
                    element={
                      <ProtectedRoute>
                        <InterviewSetup />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/interview/:id" 
                    element={
                      <ProtectedRoute>
                        <InterviewSession />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/feedback/:id" 
                    element={
                      <ProtectedRoute>
                        <FeedbackAnalysis />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </motion.div>
            </Suspense>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;