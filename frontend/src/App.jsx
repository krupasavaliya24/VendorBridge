import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const VendorsPage = lazy(() => import('./pages/VendorsPage'));
const RFQsPage = lazy(() => import('./pages/RFQsPage'));
const RFQCreatePage = lazy(() => import('./pages/RFQCreatePage'));
const RFQDetailPage = lazy(() => import('./pages/RFQDetailPage'));
const QuotationsPage = lazy(() => import('./pages/QuotationsPage'));
const QuotationSubmitPage = lazy(() => import('./pages/QuotationSubmitPage'));
const QuotationComparePage = lazy(() => import('./pages/QuotationComparePage'));
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage'));
const PurchaseOrdersPage = lazy(() => import('./pages/PurchaseOrdersPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const InvoiceDetailPage = lazy(() => import('./pages/InvoiceDetailPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: 'primary.main' }} />
    </Box>
  );
}

function SuspenseWrap({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function Protected({ children, roles }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <SuspenseWrap>{children}</SuspenseWrap>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SuspenseWrap><LoginPage /></SuspenseWrap>} />
        <Route path="/signup" element={<SuspenseWrap><SignupPage /></SuspenseWrap>} />
        <Route path="/forgot-password" element={<SuspenseWrap><ForgotPasswordPage /></SuspenseWrap>} />
        <Route path="/reset-password" element={<SuspenseWrap><ResetPasswordPage /></SuspenseWrap>} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Protected><DashboardPage /></Protected>} />
          <Route path="users" element={<Protected roles={['admin']}><UsersPage /></Protected>} />
          <Route path="vendors" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager']}><VendorsPage /></Protected>} />
          <Route path="rfqs" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager', 'vendor']}><RFQsPage /></Protected>} />
          <Route path="rfqs/new" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager']}><RFQCreatePage /></Protected>} />
          <Route path="rfqs/:id" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager', 'vendor']}><RFQDetailPage /></Protected>} />
          <Route path="quotations" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager', 'vendor']}><QuotationsPage /></Protected>} />
          <Route path="quotations/submit/:rfqId" element={<Protected roles={['vendor']}><QuotationSubmitPage /></Protected>} />
          <Route path="quotations/compare/:rfqId" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager']}><QuotationComparePage /></Protected>} />
          <Route path="approvals" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager', 'approver']}><ApprovalsPage /></Protected>} />
          <Route path="purchase-orders" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager', 'vendor']}><PurchaseOrdersPage /></Protected>} />
          <Route path="invoices" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager', 'vendor']}><InvoicesPage /></Protected>} />
          <Route path="invoices/:id" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager', 'vendor']}><InvoiceDetailPage /></Protected>} />
          <Route path="activity" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager']}><ActivityPage /></Protected>} />
          <Route path="reports" element={<Protected roles={['admin', 'procurement_officer', 'procurement_manager', 'approver']}><ReportsPage /></Protected>} />
          <Route path="settings" element={<Protected roles={['admin']}><SettingsPage /></Protected>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
