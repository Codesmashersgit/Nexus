
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const fetchProfile = async (token) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const res = await axios.get(`${backendUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    if (token && username) {
      setIsLoggedIn(true);
      setUser({ name: username, email: email || "Anonymous", role: role || 'user', subscription: { planType: 'free', active: false } });
      fetchProfile(token);
    }
  }, []);

  const login = ({ token, username, email, role }) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role || 'user');
    setIsLoggedIn(true);
    setUser({ name: username, email: email, role: role || 'user', subscription: { planType: 'free', active: false } });
    fetchProfile(token);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
