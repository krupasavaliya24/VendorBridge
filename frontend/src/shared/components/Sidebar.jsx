import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { section: 'Main', items: [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'procurement_officer', 'vendor', 'approver'] },
  ]},
  { section: 'Procurement', items: [
    { path: '/vendors', label: 'Vendors', icon: '🏢', roles: ['admin', 'procurement_officer'] },
    { path: '/rfqs', label: 'RFQs', icon: '📄', roles: ['admin', 'procurement_officer', 'approver'], vendorLabel: 'My RFQs', vendorRoles: ['vendor'] },
    { path: '/quotations/compare', label: 'Quotations', icon: '💰', roles: ['admin', 'procurement_officer'], vendorLabel: 'My Quotations', vendorRoles: ['vendor'] },
    { path: '/approvals', label: 'Approvals', icon: '✅', roles: ['admin', 'procurement_officer', 'approver'] },
    { path: '/purchase-orders', label: 'Purchase Orders', icon: '📦', roles: ['admin', 'procurement_officer', 'approver', 'vendor'] },
    { path: '/invoices', label: 'Invoices', icon: '🧾', roles: ['admin', 'procurement_officer', 'vendor'] },
  ]},
  { section: 'Analytics', items: [
    { path: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'procurement_officer', 'approver'] },
    { path: '/activity', label: 'Activity Logs', icon: '📋', roles: ['admin', 'procurement_officer'] },
  ]},
  { section: 'System', items: [
    { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
  ]},
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role || 'admin';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleName = (role || '').replace(/_/g, ' ');

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">V</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">VendorBridge</span>
          <span className="sidebar-brand-subtitle">Procurement ERP</span>
        </div>
      </div>

      <nav className="sidebar-nav" id="sidebar-nav">
        {NAV_ITEMS.map((section) => {
          const visibleItems = section.items.filter(
            (item) => item.roles.includes(role) || (item.vendorRoles && item.vendorRoles.includes(role))
          );

          if (visibleItems.length === 0) return null;

          return (
            <div className="sidebar-section" key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {visibleItems.map((item) => {
                const label = item.vendorRoles?.includes(role) ? (item.vendorLabel || item.label) : item.label;
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    id={`sidebar-link-${item.path.replace(/\//g, '-').replace(/^-/, '')}`}
                    end={item.path === '/'}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span className="sidebar-link-text">{label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-user" id="sidebar-user-section">
        <div className="sidebar-user-avatar">{getInitials(user?.full_name)}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.full_name || 'User'}</div>
          <div className="sidebar-user-role">{roleName}</div>
        </div>
        <button
          className="sidebar-logout-btn"
          onClick={logout}
          title="Logout"
          id="sidebar-logout-btn"
        >
          🚪
        </button>
      </div>

      <button className="sidebar-toggle" onClick={onToggle} id="sidebar-toggle-btn">
        <span className="sidebar-toggle-icon">◀</span>
      </button>
    </aside>
  );
}
