import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './shared/components/Layout';
import DashboardPage from './modules/dashboard/DashboardPage';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #334155',
        }
      }} />
      <Routes>
        <Route path="/login" element={<div>Login Page (MUI Version coming soon)</div>} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="vendors" element={<div>Vendors Page</div>} />
          <Route path="rfqs" element={<div>RFQs Page</div>} />
          <Route path="quotations" element={<div>Quotations Page</div>} />
          <Route path="approvals" element={<div>Approvals Page</div>} />
          <Route path="purchase-orders" element={<div>Purchase Orders Page</div>} />
          <Route path="invoices" element={<div>Invoices Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
