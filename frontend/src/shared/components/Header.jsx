import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../modules/auth/AuthContext';
import { apiClient } from '../api/client';
import './Header.css';

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/vendors': 'Vendors',
  '/rfqs': 'RFQs',
  '/rfqs/new': 'Create RFQ',
  '/approvals': 'Approvals',
  '/purchase-orders': 'Purchase Orders',
  '/invoices': 'Invoices',
  '/reports': 'Reports',
  '/activity': 'Activity Logs',
  '/settings': 'Settings',
};

export default function Header({ sidebarCollapsed, onMobileToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (ROUTE_TITLES[path]) return ROUTE_TITLES[path];
    if (path.startsWith('/rfqs/')) return 'RFQ Details';
    if (path.startsWith('/purchase-orders/')) return 'PO Details';
    if (path.startsWith('/invoices/')) return 'Invoice Details';
    if (path.startsWith('/quotations/compare')) return 'Compare Quotations';
    if (path.startsWith('/quotations/submit')) return 'Submit Quotation';
    return 'VendorBridge';
  };

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => apiClient.get('/notifications/unread-count').then(r => r.data),
    refetchInterval: 30000,
    retry: false,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications').then(r => r.data),
    enabled: showNotifications,
    retry: false,
  });

  const markAllRead = useMutation({
    mutationFn: () => apiClient.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markRead = useMutation({
    mutationFn: (id) => apiClient.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Click outside handlers
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const count = unreadCount?.count || 0;
  const notifList = Array.isArray(notifications) ? notifications : (notifications?.items || []);

  return (
    <header className={`header ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`} id="app-header">
      <div className="header-left">
        <button className="header-mobile-toggle" onClick={onMobileToggle} id="header-mobile-toggle">
          ☰
        </button>
        <h2 className="header-title">{getPageTitle()}</h2>
      </div>

      <div className="header-right">
        {/* Notifications */}
        <div className="header-notification" ref={notifRef}>
          <button
            className="header-notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            id="header-notification-btn"
          >
            🔔
            {count > 0 && (
              <span className="header-notification-badge" id="header-notification-badge">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="header-notification-dropdown" id="notification-dropdown">
              <div className="notification-dropdown-header">
                <span className="notification-dropdown-title">Notifications</span>
                {count > 0 && (
                  <button
                    className="notification-dropdown-mark-all"
                    onClick={() => markAllRead.mutate()}
                    id="mark-all-read-btn"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifList.length === 0 ? (
                  <div className="notification-empty">No notifications yet</div>
                ) : (
                  notifList.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                      onClick={() => !notif.is_read && markRead.mutate(notif.id)}
                      id={`notification-item-${notif.id}`}
                    >
                      <div className="notification-item-icon">📌</div>
                      <div className="notification-item-content">
                        <div className="notification-item-text">{notif.message || notif.title}</div>
                        <div className="notification-item-time">{formatTime(notif.created_at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="header-user-menu" ref={userRef}>
          <button
            className="header-user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            id="header-user-btn"
          >
            <div className="header-user-avatar">{getInitials(user?.full_name)}</div>
            <span className="header-user-name">{user?.full_name || 'User'}</span>
          </button>

          {showUserMenu && (
            <div className="header-user-dropdown" id="header-user-dropdown">
              <button className="header-user-dropdown-item" id="user-menu-profile">
                👤 Profile
              </button>
              <div className="header-user-dropdown-divider" />
              <button
                className="header-user-dropdown-item"
                onClick={logout}
                id="user-menu-logout"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
