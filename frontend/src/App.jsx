import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();
  const homePath = isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/login';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={homePath} replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={homePath} replace /> : <Signup />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to={homePath} replace /> : <ForgotPassword />} />
      <Route path="/admin-twc-login" element={isAuthenticated ? <Navigate to={homePath} replace /> : <AdminLogin />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={['user']} redirectTo="/login">
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRoles={['admin']} redirectTo="/admin-twc-login">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            className: 'twc-toast',
            success: {
              iconTheme: { primary: '#E8522A', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#F87171', secondary: '#FFFFFF' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
