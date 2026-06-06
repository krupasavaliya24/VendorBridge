import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Skeleton, alpha, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider
} from '@mui/material';
import {
  People as PeopleIcon, Description as RFQIcon, Gavel as ApprovalIcon,
  Receipt as InvoiceIcon, Add as AddIcon, TrendingUp, AttachMoney
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import analyticsApi from '../api/analytics';
import purchaseOrdersApi from '../api/purchaseOrders';

const STAT_CARDS_MOCK = [
  { key: 'active_rfqs', title: "Active RFQ's" },
  { key: 'pending_approvals', title: 'Pending Approvals' },
  { key: 'pos_this_month', title: "PO's this month" },
  { key: 'overdue_invoices', title: 'overdue invoices' },
];

function StatCard({ title, value, loading }) {
  return (
    <Card sx={{ 
      height: '100%', 
      bgcolor: 'info.main',
      color: 'text.primary',
      borderColor: alpha('#dfdcd6', 0.2),
      borderWidth: 1,
      borderStyle: 'solid',
      boxShadow: 'none',
      borderRadius: 3,
      transition: 'all 0.2s ease',
      '&:hover': { 
        borderColor: 'primary.main',
        boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.25)}`,
        transform: 'translateY(-2px)'
      }
    }}>
      <CardContent sx={{ p: '24px !important', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <Skeleton width={60} height={48} sx={{ mb: 1, bgcolor: alpha('#000000', 0.08) }} />
        ) : (
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'inherit', mb: 1, textAlign: 'center', fontSize: '2rem' }}>
            {value}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, textAlign: 'center', fontSize: '0.85rem', textTransform: 'none' }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'info.main', border: (t) => `1px solid ${alpha('#dfdcd6', 0.3)}`, borderRadius: 2, px: 2, py: 1.5, boxShadow: (t) => t.shadows[2] }}>
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

  const { data: poResponse } = useQuery({
    queryKey: ['recent-pos'],
    queryFn: () => purchaseOrdersApi.getAll({ page: 1, page_size: 5 }),
    retry: false,
  });

  const trendData = trends || [];

  const getDisplayValue = (key, stats) => {
    if (isLoading) {
      return '...';
    }
    if (!stats) {
      if (key === 'pos_this_month') return '₹0';
      return '0';
    }
    if (key === 'active_rfqs') return stats.active_rfqs ?? '0';
    if (key === 'pending_approvals') return stats.pending_approvals ?? '0';
    if (key === 'pos_this_month') {
      const val = stats.total_po_value || 0;
      if (val >= 100000) {
        return `₹${(val / 100000).toFixed(1)}L`;
      }
      return `₹${val.toLocaleString()}`;
    }
    if (key === 'overdue_invoices') {
      return stats.recent_invoices ?? '0';
    }
    return '0';
  };

  const recentPOs = React.useMemo(() => {
    if (!poResponse || !poResponse.items) {
      return [];
    }
    return poResponse.items.slice(0, 3).map((po, index) => ({
      po_number: po.po_number,
      vendor: po.vendor_name || po.vendor?.name || `Vendor ${po.vendor_id?.slice(0, 5) || index + 1}`,
      amount: `₹${po.grand_total?.toLocaleString()}`,
      status: po.status,
    }));
  }, [poResponse]);

  const roleName = user?.role
    ? user.role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Procurement Officer';

  return (
    <Box className="animate-fade-in" sx={{ color: 'text.primary' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Welcome back, {roleName} - Today's Overview
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_CARDS_MOCK.map(card => (
          <Grid item xs={12} sm={6} md={3} key={card.key}>
            <StatCard 
              title={card.title} 
              value={getDisplayValue(card.key, stats)} 
              loading={isLoading} 
            />
          </Grid>
        ))}
      </Grid>

      {/* Columns Swapped: Recent POs on Left, Spending Trends on Right */}
      <Grid container spacing={3}>
        {/* Recent Purchase Orders (Left) */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'info.main', color: 'text.primary' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'inherit' }}>
                Recent Purchase Orders
              </Typography>
              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 400 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha('#000000', 0.04) }}>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, color: 'text.secondary', borderBottomColor: alpha('#000000', 0.08) }}>PO#</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, color: 'text.secondary', borderBottomColor: alpha('#000000', 0.08) }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, color: 'text.secondary', borderBottomColor: alpha('#000000', 0.08) }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, color: 'text.secondary', borderBottomColor: alpha('#000000', 0.08) }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPOs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary', fontWeight: 500 }}>
                          No recent purchase orders
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentPOs.map((po, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.dark', py: 1.5, borderBottomColor: alpha('#000000', 0.08) }}>
                            {po.po_number}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, color: 'text.primary', borderBottomColor: alpha('#000000', 0.08) }}>{po.vendor}</TableCell>
                          <TableCell sx={{ py: 1.5, color: 'text.primary', borderBottomColor: alpha('#000000', 0.08) }}>{po.amount}</TableCell>
                          <TableCell sx={{ py: 1.5, borderBottomColor: alpha('#000000', 0.08) }}>
                            <Chip 
                              label={po.status} 
                              size="small" 
                              color={
                                po.status.toLowerCase() === 'approved' || po.status.toLowerCase() === 'completed' || po.status.toLowerCase() === 'issued' ? 'success' :
                                po.status.toLowerCase() === 'pending' || po.status.toLowerCase() === 'in_progress' ? 'warning' : 'default'
                              } 
                              sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.72rem' }} 
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Spending Trends (Right) */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'info.main', color: 'text.primary' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'inherit' }}>
                Spending Trends last 6 months
              </Typography>
              <Box sx={{ width: '100%', height: 240, mt: 'auto' }}>
                <ResponsiveContainer>
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000000', 0.1)} />
                    <XAxis dataKey="month" stroke="#545454" fontSize={11} />
                    <YAxis stroke="#545454" fontSize={11} tickFormatter={(v) => `₹${(v/1000)}k`} />
                    <RTooltip content={<CustomTooltip />} />
                    <Bar dataKey="spend" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Divider and Bottom Actions */}
      <Divider sx={{ my: 4, borderColor: 'divider' }} />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', flexWrap: 'wrap', mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={() => navigate('/rfqs/new')}
          sx={{ borderRadius: 3, px: 3, py: 1 }}
        >
          + new RFQ
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/vendors')}
          sx={{ borderRadius: 3, px: 3, py: 1 }}
        >
          Add Vendor
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/invoices')}
          sx={{ borderRadius: 3, px: 3, py: 1 }}
        >
          view Invoices
        </Button>
      </Box>
    </Box>
  );
}
