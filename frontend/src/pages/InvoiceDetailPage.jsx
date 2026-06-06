import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip, Divider,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, alpha
} from '@mui/material';
import { ArrowBack, PictureAsPdf, Print, Email, CheckCircle } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import invoicesApi from '../api/invoices';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS = { draft: 'default', issued: 'info', sent: 'primary', paid: 'success', overdue: 'error', cancelled: 'error' };

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [emailDialog, setEmailDialog] = useState(false);
  const [email, setEmail] = useState('');

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getById(id),
  });

  const downloadPdf = async () => {
    try {
      const response = await invoicesApi.getPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${invoice?.invoice_number || id}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to download PDF'); }
  };

  const sendEmailMutation = useMutation({
    mutationFn: () => invoicesApi.sendEmail(id, email),
    onSuccess: () => { toast.success('Invoice sent via email!'); setEmailDialog(false); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed'),
  });

  const markPaidMutation = useMutation({
    mutationFn: () => invoicesApi.markPaid(id),
    onSuccess: () => { toast.success('Marked as paid'); queryClient.invalidateQueries({ queryKey: ['invoice', id] }); },
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!invoice) return <Typography color="error">Invoice not found</Typography>;

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/invoices')} sx={{ color: 'text.secondary' }}>Back</Button>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{invoice.invoice_number}</Typography>
            <Chip label={invoice.status} color={STATUS_COLORS[invoice.status]} sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>PO: {invoice.po_id?.slice(0, 12)}...</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<PictureAsPdf />} onClick={downloadPdf}
            sx={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Download PDF</Button>
          <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}
            sx={{ borderColor: '#334155' }}>Print</Button>
          <Button variant="outlined" startIcon={<Email />} onClick={() => { setEmailDialog(true); setEmail(''); }}
            sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}>Send Email</Button>
          {invoice.status !== 'paid' && (
            <Button variant="contained" startIcon={<CheckCircle />} onClick={() => markPaidMutation.mutate()}
              sx={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Mark Paid</Button>
          )}
        </Box>
      </Box>

      {/* Invoice Card */}
      <Card id="invoice-print-area">
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Company Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>VendorBridge</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Procurement & Vendor Management ERP</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>INVOICE</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{invoice.invoice_number}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Dates */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>Issued Date</Typography>
              <Typography sx={{ fontWeight: 500 }}>{invoice.issued_at ? format(new Date(invoice.issued_at), 'dd MMM yyyy') : '—'}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>Due Date</Typography>
              <Typography sx={{ fontWeight: 500 }}>{invoice.due_date ? format(new Date(invoice.due_date), 'dd MMM yyyy') : '—'}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>Status</Typography>
              <Chip label={invoice.status} size="small" color={STATUS_COLORS[invoice.status]} sx={{ textTransform: 'capitalize' }} />
            </Grid>
            {invoice.paid_at && (
              <Grid item xs={6} sm={3}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>Paid On</Typography>
                <Typography sx={{ fontWeight: 500 }}>{format(new Date(invoice.paid_at), 'dd MMM yyyy')}</Typography>
              </Grid>
            )}
          </Grid>

          {/* Totals */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ minWidth: 280 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Subtotal</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{invoice.subtotal?.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tax ({invoice.tax_rate}%)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{invoice.tax_amount?.toLocaleString()}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Grand Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>₹{invoice.grand_total?.toLocaleString()}</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>📧 Send Invoice via Email</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Recipient Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEmailDialog(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={() => sendEmailMutation.mutate()} disabled={!email || sendEmailMutation.isPending}
            sx={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            {sendEmailMutation.isPending ? <CircularProgress size={18} color="inherit" /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
