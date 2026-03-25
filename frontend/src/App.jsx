import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import ChatbotOverlay from './components/ChatbotOverlay';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CropRecommendation from './pages/CropRecommendation';
import DiseasePrediction from './pages/DiseasePrediction';
import MarketPrices from './pages/MarketPrices';
import WeatherAdvisory from './pages/WeatherAdvisory';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './index.css';

// Using an environment variable for Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(AuthContext);
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/crop" element={<ProtectedRoute><CropRecommendation /></ProtectedRoute>} />
                <Route path="/disease" element={<ProtectedRoute><DiseasePrediction /></ProtectedRoute>} />
                <Route path="/prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
                <Route path="/advisory" element={<ProtectedRoute><WeatherAdvisory /></ProtectedRoute>} />
              </Routes>
            </main>
            <ChatbotOverlay />

            <footer className="bg-white border-t border-gray-200 mt-auto">
              <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-500">
                  &copy; 2024 AgriTech. All Rights Reserved. | Made with ❤️ for Farmers
                </p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}