import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Box, Menu, MenuItem, Divider, Avatar, alpha, CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import notificationsApi from '../api/notifications';

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/vendors': 'Vendors',
  '/rfqs': 'RFQs',
  '/rfqs/new': 'Create RFQ',
  '/quotations': 'Quotations',
  '/approvals': 'Approvals',
  '/purchase-orders': 'Purchase Orders',
  '/invoices': 'Invoices',
  '/activity': 'Activity Logs',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
};

export default function Header({ collapsed, onMobileToggle, isMobile }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (ROUTE_TITLES[path]) return ROUTE_TITLES[path];
    if (path.startsWith('/rfqs/')) return 'RFQ Details';
    if (path.startsWith('/quotations/compare')) return 'Compare Quotations';
    if (path.startsWith('/quotations/submit')) return 'Submit Quotation';
    if (path.startsWith('/purchase-orders/')) return 'PO Details';
    if (path.startsWith('/invoices/')) return 'Invoice Details';
    return 'VendorBridge';
  };

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30000,
    retry: false,
  });

  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: () => notificationsApi.getAll({ page: 1, size: 10 }),
    enabled: Boolean(notifAnchor),
    retry: false,
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    },
  });

  const unreadCount = unreadData?.count || 0;
  const notifications = Array.isArray(notifData) ? notifData : (notifData?.items || []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <AppBar position="fixed" sx={{
      left: isMobile ? 0 : collapsed ? '72px' : '260px',
      width: isMobile ? '100%' : collapsed ? 'calc(100% - 72px)' : 'calc(100% - 260px)',
      transition: 'all 0.3s ease',
    }}>
      <Toolbar sx={{ gap: 1 }}>
        {isMobile && (
          <IconButton onClick={onMobileToggle} edge="start" sx={{ color: 'text.secondary' }}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
          {getPageTitle()}
        </Typography>

        {/* Notifications */}
        <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ color: 'text.secondary' }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          PaperProps={{ sx: { width: 360, maxHeight: 420 } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Typography variant="caption" onClick={() => markAllRead.mutate()} sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Mark all read
              </Typography>
            )}
          </Box>
          <Divider />
          {notifLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
            </Box>
          ) : (
            notifications.slice(0, 8).map((n) => (
              <MenuItem key={n.id} sx={{
                py: 1.5, px: 2, flexDirection: 'column', alignItems: 'flex-start',
                bgcolor: !n.is_read ? (t) => alpha(t.palette.primary.main, 0.06) : 'transparent',
              }}>
                <Typography variant="body2" sx={{ fontWeight: n.is_read ? 400 : 600, color: 'text.primary', fontSize: '0.82rem' }}>
                  {n.message || n.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">{formatTime(n.created_on)}</Typography>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* User Menu */}
        <IconButton onClick={(e) => setUserAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
          <Avatar sx={{
            width: 34, height: 34,
            bgcolor: 'primary.main',
            fontSize: '0.8rem', fontWeight: 700,
          }}>
            {getInitials(user?.full_name)}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={userAnchor}
          open={Boolean(userAnchor)}
          onClose={() => setUserAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{user?.full_name || 'User'}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => setUserAnchor(null)}>
            <PersonIcon sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} /> Profile
          </MenuItem>
          <MenuItem onClick={() => { setUserAnchor(null); logout(); }}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 18, color: 'error.main' }} />
            <Typography color="error.main">Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
