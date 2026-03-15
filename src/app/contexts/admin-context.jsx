import { createContext, useContext, useState } from 'react';

const AdminContext = createContext(undefined);

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  return (
    <AdminContext.Provider value={{ isAuthenticated, adminMode, setIsAuthenticated, setAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
