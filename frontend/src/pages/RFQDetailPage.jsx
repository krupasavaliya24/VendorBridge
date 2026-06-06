import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Divider, alpha
} from '@mui/material';
import { ArrowBack, Publish, Lock, CompareArrows, AttachFile, Download } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import rfqsApi from '../api/rfqs';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS = { draft: 'default', open: 'info', closed: 'success', cancelled: 'error' };

export default function RFQDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rfq, isLoading } = useQuery({
    queryKey: ['rfq', id],
    queryFn: () => rfqsApi.getById(id),
  });

  const publishMutation = useMutation({
    mutationFn: () => rfqsApi.publish(id),
    onSuccess: () => { toast.success('RFQ published!'); queryClient.invalidateQueries({ queryKey: ['rfq', id] }); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to publish'),
  });

  const closeMutation = useMutation({
    mutationFn: () => rfqsApi.close(id),
    onSuccess: () => { toast.success('RFQ closed'); queryClient.invalidateQueries({ queryKey: ['rfq', id] }); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to close'),
  });

  const downloadAttachment = async (file) => {
    try {
      const response = await rfqsApi.downloadAttachment(rfq.id, file.id);
      const blob = new Blob([response.data], { type: file.content_type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download attachment');
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!rfq) return <Typography color="error">RFQ not found</Typography>;

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/rfqs')} sx={{ color: 'text.secondary' }}>Back</Button>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{rfq.rfq_number}</Typography>
            <Chip label={rfq.status} color={STATUS_COLORS[rfq.status]} sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
          </Box>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>{rfq.title}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {rfq.status === 'draft' && <Button variant="contained" startIcon={<Publish />} onClick={() => publishMutation.mutate()} sx={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Publish</Button>}
          {rfq.status === 'open' && <Button variant="contained" startIcon={<Lock />} onClick={() => closeMutation.mutate()} sx={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>Close RFQ</Button>}
          {(rfq.status === 'open' || rfq.status === 'closed') && <Button variant="outlined" startIcon={<CompareArrows />} onClick={() => navigate(`/quotations/compare/${id}`)} sx={{ borderColor: '#334155' }}>Compare Quotations</Button>}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><Typography variant="overline" sx={{ color: 'text.secondary' }}>Deadline</Typography><Typography sx={{ fontWeight: 500 }}>{rfq.deadline ? format(new Date(rfq.deadline), 'dd MMM yyyy HH:mm') : '—'}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="overline" sx={{ color: 'text.secondary' }}>Created</Typography><Typography sx={{ fontWeight: 500 }}>{format(new Date(rfq.created_on), 'dd MMM yyyy')}</Typography></Grid>
              </Grid>
              {rfq.description && <><Divider sx={{ my: 2 }} /><Typography variant="body2" sx={{ color: 'text.secondary' }}>{rfq.description}</Typography></>}
              {rfq.attachments?.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Attachments</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {rfq.attachments.map(file => (
                      <Button
                        key={file.id}
                        size="small"
                        variant="outlined"
                        startIcon={<AttachFile />}
                        endIcon={<Download />}
                        onClick={() => downloadAttachment(file)}
                      >
                        {file.file_name}
                      </Button>
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Line Items ({rfq.items?.length || 0})</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Item Name</TableCell><TableCell align="right">Quantity</TableCell><TableCell>Unit</TableCell><TableCell>Specifications</TableCell><TableCell align="right">Est. Cost</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {(rfq.items || []).map(item => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontWeight: 500 }}>{item.item_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{item.specifications || '—'}</TableCell>
                        <TableCell align="right">{item.estimated_cost ? `₹${item.estimated_cost.toLocaleString()}` : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Vendors */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Assigned Vendors ({rfq.vendors?.length || 0})</Typography>
              {(rfq.vendors || []).map(v => (
                <Box key={v.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, mb: 1, borderRadius: 2, bgcolor: (t) => alpha(t.palette.background.paper, 0.5), border: (t) => `1px solid ${t.palette.divider}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Vendor {v.vendor_id?.slice(0, 8)}</Typography>
                  <Chip label={v.invitation_sent ? 'Invited' : 'Pending'} size="small" color={v.invitation_sent ? 'success' : 'warning'} sx={{ fontSize: '0.7rem' }} />
                </Box>
              ))}
              {(!rfq.vendors || rfq.vendors.length === 0) && <Typography variant="body2" color="text.secondary">No vendors assigned</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
