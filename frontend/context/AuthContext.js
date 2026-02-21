
import { createContext, useContext, useState, useEffect } from 'react';
import api, { logout as apiLogout } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await api.verifyToken();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const userData = await api.login(email, password);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const register = async (userData) => {
    const newUser = await api.register(userData);
    setUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

