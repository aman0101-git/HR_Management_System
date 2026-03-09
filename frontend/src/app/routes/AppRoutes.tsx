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
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* PROTECTED ROUTES WRAPPED IN DASHBOARD LAYOUT */}
      {/* The DashboardLayout contains the Navbar and an <Outlet /> for these nested routes */}
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
        <Route
          path="/hr/candidates/add"
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