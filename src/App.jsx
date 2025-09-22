import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import QuickNav from './components/QuickNav';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-100 to-purple-200 relative overflow-hidden">
          {/* Beautiful pink rose animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Primary rose orbs */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-300/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-300/25 to-fuchsia-400/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Secondary warm accents */}
            <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-gradient-to-br from-pink-300/22 to-rose-400/22 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-violet-300/18 to-purple-400/18 rounded-full blur-3xl animate-pulse delay-1500"></div>
            
            {/* Magical highlights */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-fuchsia-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
            <div className="absolute top-20 left-1/3 w-48 h-48 bg-gradient-to-br from-rose-200/18 to-pink-300/18 rounded-full blur-2xl animate-pulse delay-3000"></div>
            <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-gradient-to-br from-purple-200/16 to-violet-300/16 rounded-full blur-3xl animate-pulse delay-2500"></div>
            <div className="absolute top-3/4 left-1/5 w-40 h-40 bg-gradient-to-br from-pink-200/20 to-rose-300/20 rounded-full blur-2xl animate-pulse delay-4000"></div>
            <div className="absolute top-10 right-1/5 w-32 h-32 bg-gradient-to-br from-fuchsia-100/12 to-purple-200/12 rounded-full blur-xl animate-pulse delay-5000"></div>
            
            {/* Rose shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-50/10 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/8 to-transparent"></div>
          </div>
          <Navbar />
          <main className="container mx-auto px-4 py-8 relative z-10">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:id" element={<DestinationDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected user routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <QuickNav />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
