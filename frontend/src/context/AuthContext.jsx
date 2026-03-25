import React, { createContext, useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    // If token exists, we could theoretically fetch user details from backend here
    // For now, if there's a token, we assume logged in.
    if (token) {
      // In a real app, verify token with backend
      // setUser(decoded_user_data)
    }
  }, [token]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
