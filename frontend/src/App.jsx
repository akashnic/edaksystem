import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ReceivePage } from './pages/ReceivePage';
import { DispatchPage } from './pages/DispatchPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { UserManagementPage } from './pages/UserManagementPage';

function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RECEIVER']} />}>
                  <Route path="receive" element={<ReceivePage />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER']} />}>
                  <Route path="dispatch" element={<DispatchPage />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="users" element={<UserManagementPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  );
}

export default App;
