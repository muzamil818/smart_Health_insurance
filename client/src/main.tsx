import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './index.css';

import App from './App.tsx';
import Auth from './pages/auth/Auth.tsx';
import NotFound from './pages/NotFound.tsx';

// Hospital portal
import HospitalLayout from './pages/hospital/HospitalLayout.tsx';
import HospitalDashboard from './pages/hospital/HospitalDashboard.tsx';
import MyClaims from './pages/hospital/MyClaims.tsx';
import SubmitClaim from './pages/hospital/SubmitClaim.tsx';
import ClaimDetails from './pages/hospital/ClaimDetails.tsx';
import HospitalNotifications from './pages/hospital/HospitalNotifications.tsx';
import HospitalProfile from './pages/hospital/HospitalProfile.tsx';

// Insurance officer portal
import OfficerLayout from './pages/officer/OfficerLayout.tsx';
import OfficerDashboard from './pages/officer/OfficerDashboard.tsx';
import OfficerClaims from './pages/officer/OfficerClaims.tsx';
import OfficerClaimReview from './pages/officer/OfficerClaimReview.tsx';
import FraudAnalytics from './pages/officer/FraudAnalytics.tsx';

// Administrator portal
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AdminUsers from './pages/admin/AdminUsers.tsx';
import AdminHospitals from './pages/admin/AdminHospitals.tsx';
import AdminPolicies from './pages/admin/AdminPolicies.tsx';
import AdminAuditLogs from './pages/admin/AdminAuditLogs.tsx';

// Policyholder (member) portal
import PolicyholderLayout from './pages/policyholder/PolicyholderLayout.tsx';
import PolicyholderDashboard from './pages/policyholder/PolicyholderDashboard.tsx';
import MyPolicy from './pages/policyholder/MyPolicy.tsx';
import PolicyholderClaims from './pages/policyholder/PolicyholderClaims.tsx';
import PolicyholderClaimDetails from './pages/policyholder/PolicyholderClaimDetails.tsx';
import PolicyholderNotifications from './pages/policyholder/PolicyholderNotifications.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<Auth />} />

        {/* Hospital portal */}
        <Route path="/hospital" element={<HospitalLayout />}>
          <Route index element={<HospitalDashboard />} />
          <Route path="claims" element={<MyClaims />} />
          <Route path="submit-claim" element={<SubmitClaim />} />
          <Route path="claims/:id" element={<ClaimDetails />} />
          <Route path="notifications" element={<HospitalNotifications />} />
          <Route path="profile" element={<HospitalProfile />} />
        </Route>

        {/* Insurance officer portal */}
        <Route path="/officer" element={<OfficerLayout />}>
          <Route index element={<OfficerDashboard />} />
          <Route path="claims" element={<OfficerClaims />} />
          <Route path="claims/:id" element={<OfficerClaimReview />} />
          <Route path="analytics" element={<FraudAnalytics />} />
        </Route>

        {/* Administrator portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="policies" element={<AdminPolicies />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>

        {/* Policyholder (member) portal */}
        <Route path="/policyholder" element={<PolicyholderLayout />}>
          <Route index element={<PolicyholderDashboard />} />
          <Route path="policy" element={<MyPolicy />} />
          <Route path="claims" element={<PolicyholderClaims />} />
          <Route path="claims/:id" element={<PolicyholderClaimDetails />} />
          <Route path="notifications" element={<PolicyholderNotifications />} />
        </Route>

        {/* Convenience aliases for the plural paths used in the public nav */}
        <Route path="/hospitals" element={<Navigate to="/hospital" replace />} />
        <Route path="/policies" element={<Navigate to="/policyholder/policy" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
