import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import ChatbotOverlay from './components/ChatbotOverlay';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CropRecommendation from './pages/CropRecommendation';
import DiseasePrediction from './pages/DiseasePrediction';
import ScanHistory from './pages/ScanHistory';
import UserProfile from './pages/UserProfile';
import CropCalendar from './pages/CropCalendar';
import MarketPrices from './pages/MarketPrices';
import WeatherAdvisory from './pages/WeatherAdvisory';
import MyFarm from './pages/MyFarm';
import Subsidies from './pages/Subsidies';
import Calculator from './pages/Calculator';
import Logistics from './pages/Logistics';
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
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CropCalendar /></ProtectedRoute>} />
                <Route path="/prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
                <Route path="/advisory" element={<ProtectedRoute><WeatherAdvisory /></ProtectedRoute>} />
                <Route path="/my-farm" element={<ProtectedRoute><MyFarm /></ProtectedRoute>} />
                <Route path="/subsidies" element={<ProtectedRoute><Subsidies /></ProtectedRoute>} />
                <Route path="/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
                <Route path="/logistics" element={<ProtectedRoute><Logistics /></ProtectedRoute>} />
              </Routes>
            </main>
            <ChatbotOverlay />

            <footer className="bg-white border-t border-gray-200 mt-auto">
              <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-500">
                  &copy; 2026 AgriTech. All Rights Reserved. | Made with ❤️ARYA for Farmers
                </p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}