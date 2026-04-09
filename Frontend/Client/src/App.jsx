import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// --- COMPONENTS ---
import Header from './components/Header';
import Footer from './components/Footer';

// --- PAGES ---
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import SelectRole from './pages/SelectRole';
import ExploreProperties from './pages/ExploreProperties';
import PropertyDetails from './pages/PropertyDetails';
import ForgotPassword from './pages/ForgotPassword';
import ComingSoon from './pages/ComingSoon';

import LeaseDetails from './pages/LeaseDetails';
import PaymentReceipt from './pages/PaymentReceipt';

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// --- DASHBOARDS ---
import DashboardLayout from './layout/DashboardLayout';

// --- Tenant Pages ---
import TenantOverview from './pages/Tenant/TenantOverview'
import TenantPayments from './pages/Tenant/TenantPayments';
import TenantMaintenance from './pages/Tenant/TenantMaintenance';
import TenantVisits from './pages/Tenant/TenantVisits';
import TenantApplications from './pages/Tenant/TenantApplications';
import TenantDocuments from './pages/Tenant/TenantDocuments';
import TenanatMessages from './pages/Tenant/TenantMessages';
import TenantSettings from './pages/Tenant/TenantSettings';

// --- Landlord Pages ---
import LandlordOverview from './pages/Landlord/LandlordOverview';
import LandlordProperties from './pages/Landlord/LandlordProperties';
import AddProperty from './pages/Landlord/AddProperty';
import EditProperty from './pages/Landlord/EditProperty';
import LandlordVisits from './pages/Landlord/LandlordVisits';
import LandlordApplications from './pages/Landlord/LandlordApplications';
import LandlordLeases from './pages/Landlord/LandlordLeases';
import LandlordTenants from './pages/Landlord/LandlordTenants';
import LandlordFinances from './pages/Landlord/LandlordFinances';
import LandlordMaintenance from './pages/Landlord/LandlordMaintenance';
import LandlordReports from './pages/Landlord/LandlordReports';
import LandlordSettings from './pages/Landlord/LandlordSettings';

// --- CONTEXT & AUTH ---
import './App.css';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Header />
        <main style={{ padding: '1rem' }}>
          <Routes>

            {/* Public Routes */}
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/explore' element={<ExploreProperties />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/blog"
              element={
                <ComingSoon
                  pageName="Our Blog"
                  description="We are preparing ultimate guides, market insights, and rental tips for landlords and tenants."
                />
              }
            />
            <Route
              path="/careers"
              element={
                <ComingSoon
                  pageName="Careers"
                  description="We are building a team to revolutionize property management. Open roles will be posted here."
                />
              }
            />

            {/* Tenant Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/tenant/dashboard" element={<TenantOverview />} />
                <Route path="/tenant/payments" element={<TenantPayments />} />
                <Route path="/tenant/maintenance" element={<TenantMaintenance />} />
                <Route path="/tenant/visits" element={<TenantVisits />} />
                <Route path="/tenant/applications" element={<TenantApplications />} />
                <Route path="/tenant/documents" element={<TenantDocuments />} />
                <Route path="/tenant/leases/:id" element={<LeaseDetails />} />
                <Route path="/tenant/messages" element={<TenanatMessages />} />
                <Route path="/tenant/settings" element={<TenantSettings />} />
                <Route path="/tenant/receipts/:id" element={<PaymentReceipt />} />
              </Route>
            </Route>

            {/* Landlord Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["landlord"]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/landlord/dashboard" element={<LandlordOverview />} />
                <Route path="/landlord/finances" element={<LandlordFinances />} />
                <Route path="/landlord/reports" element={<LandlordReports />} />
                <Route path="/landlord/properties" element={<LandlordProperties />} />
                <Route path="/landlord/add-property" element={<AddProperty />} />
                <Route path="/landlord/edit-property/:id" element={<EditProperty />} />
                <Route path="/landlord/visits" element={<LandlordVisits />} />
                <Route path="/landlord/applications" element={<LandlordApplications />} />
                <Route path="/landlord/leases" element={<LandlordLeases />} />
                <Route path="/landlord/leases/:id" element={<LeaseDetails />} />
                <Route path="/landlord/tenants" element={<LandlordTenants />} />
                <Route path="/landlord/maintenance" element={<LandlordMaintenance />} />
                <Route path="/landlord/settings" element={<LandlordSettings />} />
                <Route path="/landlord/receipts/:id" element={<PaymentReceipt />} />
              </Route>
            </Route>

            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;
