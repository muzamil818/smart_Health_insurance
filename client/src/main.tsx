import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import Auth from './pages/auth/Auth.tsx';

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HospitalLayout from './pages/hospital/HospitalLayout.tsx';
import HospitalDashboard from './pages/hospital/HospitalDashboard.tsx';
import MyClaims from './pages/hospital/MyClaims.tsx';
import SubmitClaim from './pages/hospital/SubmitClaim.tsx';
import ClaimDetails from './pages/hospital/ClaimDetails.tsx';
import HospitalNotifications from './pages/hospital/HospitalNotifications.tsx';
import HospitalProfile from './pages/hospital/HospitalProfile.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<Auth />} />

        {/* Hospital Dashboard Routes */}
        <Route path="/hospital" element={<HospitalLayout />}>
          <Route index element={<HospitalDashboard />} />
          <Route path="claims" element={<MyClaims />} />
          <Route path="submit-claim" element={<SubmitClaim />} />
          <Route path="claims/:id" element={<ClaimDetails />} />
          <Route path="notifications" element={<HospitalNotifications />} />
          <Route path="profile" element={<HospitalProfile />} />
        </Route>

        {/* Alias /hospitals to /hospital */}
        <Route path="/hospitals" element={<Navigate to="/hospital" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
