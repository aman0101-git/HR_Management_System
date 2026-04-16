import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from "@/app/layouts/DashboardLayout";
import LoginPage from '@/features/auth/LoginPage';
import AdminDashboard from '@/features/admin/dashboard/AdminDashboard';
import HrDashboard from '@/features/hr/dashboard/HrDashboard';
import SupervisorDashboard from '@/features/supervisor/dashboard/SupervisorDashboard';
import AddCandidate from '@/features/hr/candidates/AddCandidates';
import CandidateProfile from '@/features/hr/candidates/CandidateProfile';
import AnalyticsDashboard from '@/features/hr/dashboard/AnalyticsDashboard';
import MyLeadsList from '@/features/hr/candidates/MyLeadsList';

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
      
      {/* Root Redirect based on generic login */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* PROTECTED ROUTES WRAPPED IN DASHBOARD LAYOUT */}
      <Route element={<DashboardLayout />}>
        
        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth role="ADMIN">
              <AdminDashboard />
            </RequireAuth>
          }
        />

        {/* HR ROUTES */}
        <Route
          path="/hr/dashboard"
          element={
            <RequireAuth role="HR">
              <HrDashboard />
            </RequireAuth>
          }
        />
        
        {/* FIXED: Added missing pipeline list route */}
        <Route
          path="/hr/candidates"
          element={
            <RequireAuth role="HR">
              <MyLeadsList />
            </RequireAuth>
          }
        />

        <Route
          path="/hr/add"
          element={
            <RequireAuth role="HR">
              <AddCandidate />
            </RequireAuth>
          }
        />
        <Route
          path="/hr/candidates/:id"
          element={
            <RequireAuth role="HR">
              <CandidateProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/hr/analytics"
          element={
            <RequireAuth role="HR">
              <AnalyticsDashboard />
            </RequireAuth>
          }
        />
        
        {/* SUPERVISOR ROUTES */}
        <Route
          path="/supervisor/dashboard"
          element={
            <RequireAuth role="SUPERVISOR">
              <SupervisorDashboard />
            </RequireAuth>
          }
        /> 
             
      </Route>
    </Routes>
  );
}