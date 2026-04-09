import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Context
import AdminLayout from './components/AdminLayout'; // The dark-themed layout we just built
import { AuthProvider, useAuth } from './context/authContext';

// Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerifications from './pages/AdminVerifications';
import AdminProperties from './pages/AdminProperties';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminLeases from './pages/AdminLeases';
import AdminSettings from './pages/AdminSettings';
import toast from 'react-hot-toast';

// --- Protected Route Wrapper ---
// Ensures only users with the 'admin' role can access the layout
const ProtectedAdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  // console.log(user);


  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Admin...</div>;

  // Strict check: Must be logged in AND have the admin role
  if (!user || user.role !== 'admin') {
    toast.error("You are not authorized to login!!");
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route (Only Login) */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/verifications" element={<AdminVerifications />} />
            <Route path="/properties" element={<AdminProperties />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/reports" element={<AdminReports />} />
            <Route path="/leases" element={<AdminLeases />} />
            <Route path="/settings" element={<AdminSettings />} />
            {/* Future routes: /users, /reports, /settings */}
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;