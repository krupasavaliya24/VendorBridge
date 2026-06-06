import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Chip, alpha, Grid
} from '@mui/material';
import { ArrowBack, CheckCircle, Gavel } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import quotationsApi from '../api/quotations';
import approvalsApi from '../api/approvals';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const COLORS = ['#1e40af', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];

export default function QuotationComparePage() {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['quotation-compare', rfqId],
    queryFn: () => quotationsApi.compare(rfqId),
  });

  const selectMutation = useMutation({
    mutationFn: (qId) => quotationsApi.select(qId),
    onSuccess: () => { toast.success('Vendor selected!'); queryClient.invalidateQueries({ queryKey: ['quotation-compare', rfqId] }); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed'),
  });

  const approvalMutation = useMutation({
    mutationFn: (qId) => approvalsApi.create({ quotation_id: qId, approver_id: user?.id }),
    onSuccess: () => { toast.success('Approval requested!'); navigate('/approvals'); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed'),
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const quotations = data?.quotations || [];
  if (quotations.length === 0) return (
    <Box className="animate-fade-in">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary', mb: 2 }}>Back</Button>
      <Card><CardContent sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No quotations submitted for this RFQ yet.</Typography></CardContent></Card>
    </Box>
  );

  // Find lowest price per item
  const allItems = quotations[0]?.items || [];
  const lowestPrices = {};
  allItems.forEach((_, idx) => {
    const prices = quotations.map(q => q.items?.[idx]?.unit_price || Infinity);
    lowestPrices[idx] = Math.min(...prices);
  });

  const chartData = quotations.map((q, i) => ({ name: q.quotation_number || `Vendor ${i + 1}`, total: q.total_amount, fill: COLORS[i % COLORS.length] }));

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>Back</Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Quotation Comparison</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Compare vendor quotations side by side</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Total Amount Comparison</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `₹${(v / 1000)}k`} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' }} labelStyle={{ color: '#64748b' }} formatter={v => [`₹${v.toLocaleString()}`, 'Total']} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {quotations.map((q, i) => (
              <Grid item xs={12} sm={6} key={q.id}>
                <Card sx={{ border: q.status === 'selected' ? '2px solid #10b981' : undefined, transition: 'all 0.2s' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS[i % COLORS.length] }}>{q.quotation_number}</Typography>
                      {q.status === 'selected' && <Chip label="Selected" size="small" color="success" />}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>₹{q.total_amount?.toLocaleString()}</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>📦 {q.delivery_days || '—'} days</Typography>
                      {q.vendor_score && <Typography variant="caption" sx={{ color: '#10b981' }}>⭐ Score: {q.vendor_score.toFixed(1)}</Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      {q.status !== 'selected' && (
                        <Button size="small" variant="outlined" startIcon={<CheckCircle />}
                          onClick={() => selectMutation.mutate(q.id)} sx={{ fontSize: '0.7rem', borderColor: '#10b981', color: '#10b981' }}>Select</Button>
                      )}
                      <Button size="small" variant="outlined" color="primary" startIcon={<Gavel />}
                        onClick={() => approvalMutation.mutate(q.id)} sx={{ fontSize: '0.7rem' }}>Request Approval</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Detailed Comparison Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Item-wise Comparison</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      {quotations.map((q, i) => <TableCell key={q.id} align="right" sx={{ color: COLORS[i % COLORS.length], fontWeight: 600 }}>{q.quotation_number}</TableCell>)}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 500 }}>{item.item_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        {quotations.map(q => {
                          const qItem = q.items?.[idx];
                          const isLowest = qItem?.unit_price === lowestPrices[idx];
                          return (
                            <TableCell key={q.id} align="right" sx={{ fontWeight: isLowest ? 700 : 400, color: isLowest ? '#10b981' : 'text.primary', bgcolor: isLowest ? alpha('#10b981', 0.08) : 'transparent' }}>
                              ₹{qItem?.unit_price?.toLocaleString() || '—'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Total</TableCell>
                      {quotations.map(q => <TableCell key={q.id} align="right" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{q.total_amount?.toLocaleString()}</TableCell>)}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
