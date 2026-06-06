import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Skeleton, alpha, Chip
} from '@mui/material';
import {
  People as PeopleIcon, Description as RFQIcon, Gavel as ApprovalIcon,
  Receipt as InvoiceIcon, Add as AddIcon, TrendingUp, AttachMoney
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import analyticsApi from '../api/analytics';

const STAT_CARDS = [
  { key: 'total_vendors', title: 'Total Vendors', icon: PeopleIcon, color: '#1e40af', gradient: 'linear-gradient(135deg, #1e40af, #1e3a8a)' },
  { key: 'active_rfqs', title: 'Active RFQs', icon: RFQIcon, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { key: 'pending_approvals', title: 'Pending Approvals', icon: ApprovalIcon, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { key: 'recent_invoices', title: 'Recent Invoices', icon: InvoiceIcon, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
];

function StatCard({ title, value, icon: Icon, gradient, color, loading }) {
  return (
    <Card sx={{ height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 24px ${alpha(color, 0.3)}` } }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="overline" sx={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>{title}</Typography>
            {loading ? <Skeleton width={60} height={40} /> : (
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{value ?? 0}</Typography>
            )}
          </Box>
          <Box sx={{ width: 48, height: 48, borderRadius: 3, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(color, 0.4)}` }}>
            <Icon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2, px: 2, py: 1.5, boxShadow: (t) => t.shadows[2] }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>₹{payload[0].value?.toLocaleString()}</Typography>
    </Box>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsApi.getDashboard,
    retry: false,
  });

  const { data: trends } = useQuery({
    queryKey: ['dashboard-trends'],
    queryFn: analyticsApi.getTrends,
    retry: false,
  });

  const trendData = trends || [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <Box className="animate-fade-in">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            {greeting}, {user?.full_name?.split(' ')[0] || 'User'} 👋
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Here's what's happening with your procurement today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/rfqs/new')}>
            Create RFQ
          </Button>
          <Button variant="outlined" color="primary" startIcon={<PeopleIcon />} onClick={() => navigate('/vendors')}>
            Add Vendor
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_CARDS.map(({ key, ...card }) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <StatCard {...card} value={stats?.[key]} loading={isLoading} />
          </Grid>
        ))}
      </Grid>

      {/* Charts & Info */}
      <Grid container spacing={3}>
        {/* Spending Trend */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Monthly Spending Trend</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Procurement expenditure overview</Typography>
                </Box>
                <Chip icon={<TrendingUp sx={{ fontSize: 16 }} />} label="+12.5%" size="small"
                  sx={{ bgcolor: alpha('#10b981', 0.12), color: '#10b981', fontWeight: 600 }} />
              </Box>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${(v/1000)}k`} />
                    <RTooltip content={<CustomTooltip />} />
                    <Bar dataKey="spend" fill="#1e40af" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Quick Summary</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, bgcolor: (t) => alpha(t.palette.primary.main, 0.08), border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}` }}>
                  <AttachMoney sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Total PO Value</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>₹{(stats?.total_po_value || 0).toLocaleString()}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, bgcolor: alpha('#10b981', 0.08), border: `1px solid ${alpha('#10b981', 0.2)}` }}>
                  <InvoiceIcon sx={{ color: '#10b981' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Invoices This Month</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats?.recent_invoices || 0}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, bgcolor: alpha('#f59e0b', 0.08), border: `1px solid ${alpha('#f59e0b', 0.2)}` }}>
                  <ApprovalIcon sx={{ color: '#f59e0b' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Awaiting Approval</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats?.pending_approvals || 0}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
