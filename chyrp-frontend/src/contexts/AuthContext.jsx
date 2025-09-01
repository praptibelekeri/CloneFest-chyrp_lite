import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('blogUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login - in a real app, this would make an API call
    if (email && password) {
      const mockUser = {
        id: 1,
        email: email,
        name: email.split('@')[0],
        role: 'user'
      };
      setUser(mockUser);
      localStorage.setItem('blogUser', JSON.stringify(mockUser));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = async (name, email, password) => {
    // Mock registration - in a real app, this would make an API call
    if (name && email && password) {
      const mockUser = {
        id: Date.now(),
        email: email,
        name: name,
        role: 'user'
      };
      setUser(mockUser);
      localStorage.setItem('blogUser', JSON.stringify(mockUser));
      return { success: true };
    }
    return { success: false, error: 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blogUser');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};