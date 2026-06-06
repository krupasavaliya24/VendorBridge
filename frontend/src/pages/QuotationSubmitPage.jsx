import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, alpha, Grid
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import rfqsApi from '../api/rfqs';
import quotationsApi from '../api/quotations';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function QuotationSubmitPage() {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prices, setPrices] = useState({});
  const [deliveryDays, setDeliveryDays] = useState('');
  const [notes, setNotes] = useState('');

  const { data: rfq, isLoading } = useQuery({
    queryKey: ['rfq-for-quotation', rfqId],
    queryFn: () => rfqsApi.getById(rfqId),
  });

  const submitMutation = useMutation({
    mutationFn: quotationsApi.create,
    onSuccess: () => { toast.success('Quotation submitted!'); navigate('/quotations'); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to submit'),
  });

  const handleSubmit = () => {
    const items = (rfq?.items || []).map(item => ({
      rfq_item_id: item.id, item_name: item.item_name, quantity: item.quantity,
      unit_price: parseFloat(prices[item.id] || 0),
    }));
    if (items.some(i => !i.unit_price || i.unit_price <= 0)) {
      toast.error('Please enter valid prices for all items');
      return;
    }
    submitMutation.mutate({
      rfq_id: rfqId, vendor_id: user.id,
      delivery_days: deliveryDays ? parseInt(deliveryDays) : undefined,
      notes: notes || undefined, items,
    });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const total = (rfq?.items || []).reduce((s, item) => s + (item.quantity * (parseFloat(prices[item.id]) || 0)), 0);

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>Back</Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Submit Quotation</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>RFQ: {rfq?.title} ({rfq?.rfq_number})</Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Price Items</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow>
                <TableCell>Item</TableCell><TableCell align="right">Qty</TableCell><TableCell>Unit</TableCell><TableCell align="right">Unit Price (₹)</TableCell><TableCell align="right">Total</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {(rfq?.items || []).map(item => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontWeight: 500 }}>{item.item_name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell align="right">
                      <TextField size="small" type="number" value={prices[item.id] || ''} placeholder="0.00"
                        onChange={(e) => setPrices({ ...prices, [item.id]: e.target.value })} sx={{ width: 120 }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>₹{(item.quantity * (parseFloat(prices[item.id]) || 0)).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow><TableCell colSpan={4} align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>Grand Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem', color: 'primary.light' }}>₹{total.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Delivery Days" type="number" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} /></Grid>
            <Grid item xs={12} sm={8}><TextField fullWidth label="Notes / Comments" multiline rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" startIcon={submitMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <Send />}
          onClick={handleSubmit} disabled={submitMutation.isPending}
          sx={{ background: 'linear-gradient(135deg, #8B1A1A, #5C0A0A)', px: 4 }}>Submit Quotation</Button>
      </Box>
    </Box>
  );
}
