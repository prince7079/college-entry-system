
import { createContext, useContext, useState, useEffect } from 'react';
import { io as ioClient } from 'socket.io-client';
import api, { logout as apiLogout } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    const client = ioClient(baseUrl, {
      auth: { token },
      reconnection: true,
      withCredentials: true,
    });

    client.on('connect', () => console.log('socket connected', client.id));
    client.on('disconnect', () => console.log('socket disconnected'));
    setSocket(client);

    return () => {
      client.disconnect();
      setSocket(null);
    };
  }, [user]);

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
    if (socket) {
      try { socket.disconnect(); } catch(e) {}
      setSocket(null);
    }
  };

  const register = async (userData) => {
    const newUser = await api.register(userData);
    setUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, socket }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
