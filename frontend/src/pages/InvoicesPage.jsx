import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, MenuItem, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, alpha, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Visibility, PictureAsPdf, Email, CheckCircle } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import invoicesApi from '../api/invoices';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS = { draft: 'default', issued: 'info', sent: 'primary', paid: 'success', overdue: 'error', cancelled: 'error' };

export default function InvoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [emailDialog, setEmailDialog] = useState({ open: false, id: null });
  const [email, setEmail] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page + 1, pageSize, statusFilter],
    queryFn: () => invoicesApi.getAll({ page: page + 1, page_size: pageSize, status: statusFilter || undefined }),
  });

  const downloadPdf = async (id) => {
    try {
      const response = await invoicesApi.getPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${id}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to download PDF'); }
  };

  const sendEmailMutation = useMutation({
    mutationFn: ({ id, email }) => invoicesApi.sendEmail(id, email),
    onSuccess: () => { toast.success('Invoice sent!'); setEmailDialog({ open: false, id: null }); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to send'),
  });

  const markPaidMutation = useMutation({
    mutationFn: invoicesApi.markPaid,
    onSuccess: () => { toast.success('Marked as paid'); queryClient.invalidateQueries({ queryKey: ['invoices'] }); },
  });

  const columns = [
    { field: 'invoice_number', headerName: 'Invoice #', width: 150, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light', cursor: 'pointer' }} onClick={() => navigate(`/invoices/${p.row.id}`)}>{p.value}</Typography> },
    { field: 'grand_total', headerName: 'Amount', width: 130, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{p.value?.toLocaleString()}</Typography> },
    { field: 'status', headerName: 'Status', width: 110, renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || 'default'} sx={{ fontWeight: 500, textTransform: 'capitalize', fontSize: '0.72rem' }} /> },
    { field: 'issued_at', headerName: 'Issued', width: 120, renderCell: (p) => p.value ? format(new Date(p.value), 'dd MMM yy') : '—' },
    { field: 'due_date', headerName: 'Due Date', width: 120, renderCell: (p) => p.value ? format(new Date(p.value), 'dd MMM yy') : '—' },
    { field: 'created_on', headerName: 'Created', width: 120, renderCell: (p) => format(new Date(p.value), 'dd MMM yy') },
    {
      field: 'actions', headerName: 'Actions', width: 180, sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => navigate(`/invoices/${p.row.id}`)} sx={{ color: 'text.secondary' }}><Visibility fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => downloadPdf(p.row.id)} sx={{ color: 'error.main' }}><PictureAsPdf fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => { setEmailDialog({ open: true, id: p.row.id }); setEmail(''); }} sx={{ color: 'info.main' }}><Email fontSize="small" /></IconButton>
          {p.row.status !== 'paid' && <IconButton size="small" onClick={() => markPaidMutation.mutate(p.row.id)} sx={{ color: 'success.main' }}><CheckCircle fontSize="small" /></IconButton>}
        </Box>
      ),
    },
  ];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Invoices</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage invoices, download PDFs, and send via email</Typography>
        </Box>
        <TextField select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small" label="Status" sx={{ minWidth: 140 }}>
          <MenuItem value="">All</MenuItem>
          {Object.keys(STATUS_COLORS).map(s => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
        </TextField>
      </Box>

      <Box sx={{ bgcolor: (t) => alpha(t.palette.background.paper, 0.8), borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <DataGrid
          rows={data?.items || []} columns={columns} loading={isLoading}
          paginationMode="server" rowCount={data?.total || 0}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick autoHeight
          sx={{ border: 'none' }}
        />
      </Box>

      <Dialog open={emailDialog.open} onClose={() => setEmailDialog({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>📧 Send Invoice via Email</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Recipient Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEmailDialog({ open: false, id: null })} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={() => sendEmailMutation.mutate({ id: emailDialog.id, email })}
            disabled={!email || sendEmailMutation.isPending} sx={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            {sendEmailMutation.isPending ? <CircularProgress size={18} color="inherit" /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
