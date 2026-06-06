import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Box sx={{ p: 1, borderRadius: '50%', bgcolor: `${color}.light`, color: `${color}.main`, display: 'flex' }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Vendors" value="24" icon={<PeopleIcon />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active RFQs" value="12" icon={<AssignmentIcon />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Approvals" value="5" icon={<TrendingUpIcon />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Recent Invoices" value="8" icon={<ReceiptIcon />} color="error" />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity (Coming Soon)</Typography>
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Connect to the backend /api/v1/analytics/dashboard to fetch real data.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
