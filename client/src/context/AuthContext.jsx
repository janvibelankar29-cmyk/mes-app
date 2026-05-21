import React, { createContext, useContext, useState, useEffect } from 'react';

// Roles: 'ADMIN', 'MANAGER', 'OPERATOR'
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Mocking auth state for Phase 8 demonstration
  const [user, setUser] = useState({
    id: 'usr_1',
    name: 'Jane Doe',
    role: 'MANAGER',
    shift: 'Morning'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Helper to check if current user has required role
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const login = async (credentials) => {
    setIsLoading(true);
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser({ id: 'usr_1', name: 'Jane Doe', role: 'MANAGER', shift: 'Morning' });
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, hasRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
