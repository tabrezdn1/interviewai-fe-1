import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './components/auth/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'
import { LandingPage } from './pages/LandingPage'
import { Login } from './pages/Login'
import Dashboard from './pages/Dashboard'
import { InterviewSetup } from './pages/InterviewSetup'
import { InterviewSession } from './pages/InterviewSession'
import FeedbackAnalysis from './pages/FeedbackAnalysis'
import { Settings } from './pages/Settings'
import { Pricing } from './pages/Pricing'
import Billing from './pages/Billing'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interview/setup" 
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
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } 
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App