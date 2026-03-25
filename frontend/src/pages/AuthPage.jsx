import React, { useContext, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

const AuthPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

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
      setError("Login failed. Please try again.");
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-agri-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full glass-panel p-10 space-y-8" style={{animation: 'float 6s ease-in-out infinite'}}>
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-agri-main shadow-lg">
             <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to AgriTech
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Empowering farmers with smart agricultural solutions
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-sm text-gray-500">Sign in to access your dashboard</p>
            
            <div className="w-full flex justify-center mt-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                useOneTap
                theme="filled_blue"
                shape="pill"
              />
            </div>

            <div className="flex items-center w-full mt-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              onClick={handleGuestLogin}
              className="w-full bg-agri-earth text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Leaf size={20} />
              Continue as Guest
            </button>
            
            <p className="text-xs text-gray-400 text-center mt-2">
              Guest mode gives you full access to all features without signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
