import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = isMobile ? DRAWER_WIDTH : (collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        collapsedWidth={DRAWER_COLLAPSED}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        isMobile={isMobile}
      />
      <Box
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : `${sidebarWidth}px`,
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
        }}
      >
        <Header
          collapsed={collapsed}
          onMobileToggle={() => setMobileOpen(true)}
          isMobile={isMobile}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            pt: { xs: 10, sm: 11 },
            maxWidth: { xs: '100%', lg: 1440 },
            width: '100%',
            minWidth: 0,
            mx: 'auto',
            bgcolor: 'background.paper',
            borderRadius: { md: 4 },
            my: { md: 2 },
            mr: { md: 2 },
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
