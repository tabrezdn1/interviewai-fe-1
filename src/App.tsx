import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import FeedbackAnalysis from './pages/FeedbackAnalysis';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/layout/Navbar';
import AuthProvider from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="interview-ai-theme">
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
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
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;