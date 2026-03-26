import React, { useContext, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const AuthPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      login({
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      }, token);

      navigate('/');
    } catch (err) {
      console.error("Login failed:", err);
      setError("Google Login failed. Please try again.");
    }
  };

  const handleGoogleFailure = () => {
    setError("Google Sign-In was unsuccessful. Try again later.");
  };

  const handleGuestLogin = () => {
    login({
      name: 'Guest Farmer',
      email: 'guest@agritech.com',
      picture: null
    }, 'guest-token');
    navigate('/');
  };

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLoginMode ? 'http://localhost:5001/api/auth/login' : 'http://localhost:5001/api/auth/signup';
      
      const payload = isLoginMode 
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const res = await axios.post(endpoint, payload);

      if (isLoginMode) {
        const { token, user } = res.data;
        login({
          name: user.username,
          email: user.email,
          picture: null
        }, token);
        navigate('/');
      } else {
        setIsLoginMode(true);
        setFormData({ username: '', email: '', password: '' });
        setError("Registration successful! Please sign in with your new credentials.");
      }
    } catch (err) {
      console.error(err);
      setError(typeof err.response?.data === 'string' ? err.response.data : "Authentication logic failed. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero.png" 
          alt="Agriculture Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1A2E24]/80 backdrop-blur-sm"></div>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgb(0,0,0,0.3)] border border-[#E9F0EC] space-y-8" style={{animation: 'float 6s ease-in-out infinite'}}>
        
        {/* Header */}
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-[#1A2E24] shadow-md">
             <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-[#1A2E24] tracking-tight">
            {isLoginMode ? 'Welcome Back' : 'Join AgriTech'}
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-gray-500">
            {isLoginMode ? 'Sign in to access your smart dashboard' : 'Create an account to start farming smarter'}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          
          {error && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${error.includes('successful') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              <p>{error}</p>
            </div>
          )}
          
          {/* Native Auth Form */}
          <form onSubmit={handleManualAuth} className="space-y-5">
            {!isLoginMode && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-agri-main transition-colors" size={18} />
                <input 
                  type="text" 
                  required 
                  placeholder="Full Name" 
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-[#E9F0EC] focus:border-agri-main focus:ring-4 focus:ring-agri-main/10 outline-none transition-all font-medium text-gray-800 placeholder-gray-400 bg-[#F9FBFA]"
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-agri-main transition-colors" size={18} />
              <input 
                type="email" 
                required 
                placeholder="Email Address" 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-[#E9F0EC] focus:border-agri-main focus:ring-4 focus:ring-agri-main/10 outline-none transition-all font-medium text-gray-800 placeholder-gray-400 bg-[#F9FBFA]"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-agri-main transition-colors" size={18} />
              <input 
                type="password" 
                required 
                placeholder="Password" 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-[#E9F0EC] focus:border-agri-main focus:ring-4 focus:ring-agri-main/10 outline-none transition-all font-medium text-gray-800 placeholder-gray-400 bg-[#F9FBFA]"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#1A2E24] hover:bg-agri-main text-white font-bold py-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isLoginMode ? "Sign In Securely" : "Create My Account")}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="text-center pb-2">
            <button 
              type="button" 
              onClick={() => { setIsLoginMode(!isLoginMode); setError(null); }} 
              className="text-sm font-bold text-gray-500 hover:text-agri-main transition-colors"
            >
              {isLoginMode ? "New to AgriTech? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center w-full">
            <div className="flex-grow border-t border-[#E9F0EC]"></div>
            <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">or login with</span>
            <div className="flex-grow border-t border-[#E9F0EC]"></div>
          </div>
            
          {/* Universal Auth Actions */}
          <div className="w-full flex flex-col items-center gap-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              width="300"
            />

            <button
              onClick={handleGuestLogin}
              className="w-full mt-2 bg-[#F9FBFA] border-2 border-[#E9F0EC] text-gray-500 py-3.5 px-6 rounded-xl font-bold hover:bg-gray-50 hover:text-[#1A2E24] transition-all flex items-center justify-center gap-2"
            >
              <Leaf size={18} />
              Continue as Guest Mode
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
