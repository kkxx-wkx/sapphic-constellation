import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import GraphPage from './pages/GraphPage';
import InvitePage from './pages/InvitePage';
import ConsentPage from './pages/ConsentPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ConsentAcceptPage from './pages/ConsentAcceptPage';
import AuthPage from './pages/AuthPage';
import { Star } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();

  if (state.loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10">
          <Star className="w-12 h-12 text-blue-300 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!state.user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { state } = useApp();

  if (state.loading) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/graph"
        element={
          <ProtectedRoute>
            <GraphPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invite"
        element={
          <ProtectedRoute>
            <InvitePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consent"
        element={
          <ProtectedRoute>
            <ConsentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consent/:token"
        element={<ConsentAcceptPage />}
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
