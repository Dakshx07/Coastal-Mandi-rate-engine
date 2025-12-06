import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserView } from './components/UserView';
import { AdminPanel } from './components/AdminPanel';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { SettingsPage } from './components/SettingsPage';
import { IntroPage } from './components/IntroPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
          <div className="mt-4 text-blue-400 font-bold text-sm animate-pulse">Loading Coastal Mandi...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" /> : <IntroPage />} />
      <Route path="/home" element={user ? <UserView /> : <Navigate to="/" />} />
      <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/home" /> : <SignUpPage />} />

      {/* Protected Routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    </Routes>
  );
}

import { OfflineAlert } from './components/OfflineAlert';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <HashRouter>
          <OfflineAlert />
          <AppRoutes />
        </HashRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;