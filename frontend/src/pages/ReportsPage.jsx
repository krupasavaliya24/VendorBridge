import React from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Skeleton, alpha, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { TrendingUp, People, AttachMoney, Speed } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import analyticsApi from '../api/analytics';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#151c2c', border: '1px solid #1e293b', borderRadius: 2, px: 2, py: 1.5 }}>
      <Typography variant="caption" sx={{ color: '#94a3b8' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>₹{payload[0].value?.toLocaleString()}</Typography>
    </Box>
  );
};

export default function ReportsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['report-stats'], queryFn: analyticsApi.getDashboard, retry: false });
  const { data: trends } = useQuery({ queryKey: ['report-trends'], queryFn: analyticsApi.getTrends, retry: false });
  const { data: vendors, isLoading: vendorsLoading } = useQuery({ queryKey: ['vendor-performance'], queryFn: analyticsApi.getVendorPerformance, retry: false });

  const trendData = trends || [];
  const vendorData = vendors || [];

  const summaryCards = [
    { title: 'Total Vendors', value: stats?.total_vendors, icon: People, color: '#8B1A1A' },
    { title: 'Active RFQs', value: stats?.active_rfqs, icon: TrendingUp, color: '#3b82f6' },
    { title: 'Total PO Value', value: stats?.total_po_value ? `₹${stats.total_po_value.toLocaleString()}` : '₹0', icon: AttachMoney, color: '#10b981' },
    { title: 'Pending Approvals', value: stats?.pending_approvals, icon: Speed, color: '#f59e0b' },
  ];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Reports & Analytics</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Procurement insights and trends</Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="overline" sx={{ fontSize: '0.65rem' }}>{card.title}</Typography>
                    {statsLoading ? <Skeleton width={60} height={36} /> : (
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{card.value ?? 0}</Typography>
                    )}
                  </Box>
                  <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: alpha(card.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon sx={{ color: card.color, fontSize: 22 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Trend Chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Monthly Procurement Spend</Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v / 1000)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="spend" fill="#8B1A1A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vendor Performance */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Vendor Performance</Typography>
              {vendorsLoading ? <Skeleton height={200} /> : vendorData.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No vendor data available</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow>
                      <TableCell>Vendor</TableCell><TableCell align="right">POs</TableCell><TableCell align="right">Spend</TableCell><TableCell align="right">Rating</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {vendorData.slice(0, 8).map((v, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{v.vendor_name}</TableCell>
                          <TableCell align="right">{v.total_pos}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem' }}>₹{v.total_spend?.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Chip label={`★ ${v.rating?.toFixed(1)}`} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
