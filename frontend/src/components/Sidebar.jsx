import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Divider, Tooltip, alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin', 'procurement_manager', 'vendor', 'approver'] },
  { text: 'Vendors', icon: <PeopleIcon />, path: '/vendors', roles: ['admin', 'procurement_manager'] },
  { text: 'RFQs', icon: <DescriptionIcon />, path: '/rfqs', roles: ['admin', 'procurement_manager', 'vendor'] },
  { text: 'Quotations', icon: <AssignmentIcon />, path: '/quotations', roles: ['admin', 'procurement_manager', 'vendor'] },
  { text: 'Approvals', icon: <GavelIcon />, path: '/approvals', roles: ['admin', 'procurement_manager', 'approver'] },
  { text: 'Purchase Orders', icon: <ShippingIcon />, path: '/purchase-orders', roles: ['admin', 'procurement_manager', 'vendor'] },
  { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices', roles: ['admin', 'procurement_manager', 'vendor'] },
  { text: 'Activity', icon: <TimelineIcon />, path: '/activity', roles: ['admin', 'procurement_manager'] },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports', roles: ['admin', 'procurement_manager', 'approver'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['admin'] },
];

export default function Sidebar({ drawerWidth, collapsedWidth, collapsed, onToggleCollapse, mobileOpen, onMobileClose, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredItems = MENU_ITEMS.filter(item => !user?.role || item.roles.includes(user.role));
  const currentWidth = collapsed && !isMobile ? collapsedWidth : drawerWidth;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) onMobileClose();
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1 }}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed && !isMobile ? 'center' : 'space-between', px: collapsed && !isMobile ? 1 : 2.5, py: 2, mb: 1 }}>
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem', color: '#fff',
              boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.35)}`,
            }}>
              VB
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'text.primary', letterSpacing: '-0.02em' }}>
              VendorBridge
            </Typography>
          </Box>
        )}
        {collapsed && !isMobile && (
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1rem', color: '#fff',
            boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.35)}`,
          }}>
            VB
          </Box>
        )}
        {!isMobile && (
          <IconButton onClick={onToggleCollapse} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mx: 2, borderColor: 'divider' }} />

      {/* Nav Items */}
      <List sx={{ flex: 1, px: collapsed && !isMobile ? 1 : 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
        {filteredItems.map((item) => {
          const active = isActive(item.path);
          const button = (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => handleNav(item.path)}
                sx={{
                  minHeight: 44,
                  borderRadius: '10px',
                  px: collapsed && !isMobile ? 1.5 : 2,
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                  ...(active && {
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.12) },
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 600 },
                    '&::before': {
                      content: '""', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 24, borderRadius: 4,
                      bgcolor: 'primary.main',
                    },
                  }),
                }}
              >
                <ListItemIcon sx={{
                  minWidth: collapsed && !isMobile ? 0 : 40,
                  justifyContent: 'center',
                  color: active ? 'primary.main' : 'text.secondary',
                  mr: collapsed && !isMobile ? 0 : 1,
                }}>
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }} />
                )}
              </ListItemButton>
            </ListItem>
          );

          return collapsed && !isMobile ? (
            <Tooltip key={item.text} title={item.text} placement="right" arrow>
              {button}
            </Tooltip>
          ) : (
            <React.Fragment key={item.text}>{button}</React.Fragment>
          );
        })}
      </List>

      {/* Bottom Section */}
      <Divider sx={{ mx: 2, borderColor: 'divider' }} />
      <Box sx={{ px: collapsed && !isMobile ? 1 : 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </Box>
        {(!collapsed || isMobile) && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ') || 'Guest'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'background.default', borderRight: (t) => `1px solid ${t.palette.divider}` },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: currentWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.default',
              borderRight: (t) => `1px solid ${t.palette.divider}`,
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
