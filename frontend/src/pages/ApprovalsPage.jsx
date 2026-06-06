import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Grid, CircularProgress, alpha
} from '@mui/material';
import { CheckCircle, Cancel, Gavel } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import approvalsApi from '../api/approvals';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending: 'warning', approved: 'success', rejected: 'error' };

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');

  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ['approvals-pending'],
    queryFn: approvalsApi.getPending,
    enabled: tab === 0,
  });

  const { data: all, isLoading: allLoading } = useQuery({
    queryKey: ['approvals-all'],
    queryFn: () => approvalsApi.getAll({ page: 1, page_size: 50 }),
    enabled: tab === 1,
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, status, remarks }) => approvalsApi.decide(id, { status, remarks }),
    onSuccess: () => {
      toast.success(action === 'approved' ? 'Approved!' : 'Rejected');
      queryClient.invalidateQueries({ queryKey: ['approvals-pending'] });
      queryClient.invalidateQueries({ queryKey: ['approvals-all'] });
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed'),
  });

  const openDecide = (approval, act) => {
    setSelectedApproval(approval); setAction(act); setRemarks(''); setDialogOpen(true);
  };

  const handleDecide = () => {
    decideMutation.mutate({ id: selectedApproval.id, status: action, remarks });
  };

  const approvals = tab === 0 ? (Array.isArray(pending) ? pending : []) : (all?.items || []);
  const loading = tab === 0 ? pendingLoading : allLoading;

  return (
    <Box className="animate-fade-in">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Approval Workflow</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Review and process procurement approvals</Typography>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Pending" />
        <Tab label="All Approvals" />
      </Tabs>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

      <Grid container spacing={2}>
        {approvals.map(a => (
          <Grid item xs={12} sm={6} md={4} key={a.id}>
            <Card sx={{
              transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
              borderLeft: `4px solid`,
              borderLeftColor: a.status === 'pending' ? 'warning.main' : a.status === 'approved' ? 'success.main' : 'error.main',
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Gavel sx={{ color: 'text.secondary' }} />
                  <Chip label={a.status} size="small" color={STATUS_COLORS[a.status]} sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Quotation</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5 }}>{a.quotation_id?.slice(0, 12)}...</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Created: {format(new Date(a.created_on), 'dd MMM yyyy HH:mm')}
                </Typography>
                {a.remarks && <Typography variant="body2" sx={{ mt: 1, p: 1.5, bgcolor: (t) => alpha(t.palette.divider, 0.3), borderRadius: 2, fontSize: '0.8rem', fontStyle: 'italic' }}>"{a.remarks}"</Typography>}
                {a.decided_at && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>Decided: {format(new Date(a.decided_at), 'dd MMM yyyy HH:mm')}</Typography>}

                {a.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button size="small" variant="contained" startIcon={<CheckCircle />} onClick={() => openDecide(a, 'approved')}
                      sx={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '0.75rem' }}>Approve</Button>
                    <Button size="small" variant="contained" startIcon={<Cancel />} onClick={() => openDecide(a, 'rejected')}
                      sx={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontSize: '0.75rem' }}>Reject</Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!loading && approvals.length === 0 && (
        <Card><CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">No approvals found</Typography>
        </CardContent></Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{action === 'approved' ? '✅ Approve Request' : '❌ Reject Request'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Remarks (optional)" multiline rows={3} value={remarks}
            onChange={(e) => setRemarks(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDecide} disabled={decideMutation.isPending}
            sx={{ background: action === 'approved' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            {decideMutation.isPending ? <CircularProgress size={18} color="inherit" /> : action === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
