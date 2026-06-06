import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/AuthContext';

const ROLE_ACCESS = {
  admin: ['/', '/vendors', '/rfqs', '/rfqs/new', '/quotations', '/approvals', '/purchase-orders', '/invoices', '/reports', '/activity', '/settings'],
  procurement_officer: ['/', '/vendors', '/rfqs', '/rfqs/new', '/quotations', '/approvals', '/purchase-orders', '/invoices', '/reports', '/activity'],
  vendor: ['/', '/rfqs', '/quotations', '/purchase-orders', '/invoices'],
  approver: ['/', '/approvals', '/rfqs', '/purchase-orders', '/reports'],
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
