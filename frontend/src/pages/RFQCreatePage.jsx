import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Stepper, Step, StepLabel, Card, CardContent,
  Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Chip, CircularProgress, alpha
} from '@mui/material';
import { Add, Delete, ArrowBack, ArrowForward, Send } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import rfqsApi from '../api/rfqs';
import vendorsApi from '../api/vendors';
import toast from 'react-hot-toast';

const STEPS = ['Basic Info', 'Line Items', 'Assign Vendors', 'Review'];
const emptyItem = { item_name: '', quantity: 1, unit: 'units', specifications: '', estimated_cost: '' };

export default function RFQCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [errors, setErrors] = useState({});

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors-for-rfq'],
    queryFn: () => vendorsApi.getAll({ page: 1, page_size: 100, status: 'active' }),
  });

  const createMutation = useMutation({
    mutationFn: rfqsApi.create,
    onSuccess: () => { toast.success('RFQ created successfully!'); navigate('/rfqs'); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to create RFQ'),
  });

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.title.trim()) errs.title = 'Title is required';
    } else if (step === 1) {
      if (items.length === 0) errs.items = 'Add at least one item';
      items.forEach((item, i) => {
        if (!item.item_name.trim()) errs[`item_${i}_name`] = 'Required';
        if (!item.quantity || item.quantity <= 0) errs[`item_${i}_qty`] = 'Required';
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    const payload = {
      title: form.title, description: form.description,
      deadline: form.deadline || undefined,
      items: items.map(i => ({ item_name: i.item_name, quantity: parseFloat(i.quantity), unit: i.unit, specifications: i.specifications, estimated_cost: i.estimated_cost ? parseFloat(i.estimated_cost) : undefined })),
      vendor_ids: selectedVendors,
    };
    createMutation.mutate(payload);
  };

  const toggleVendor = (id) => setSelectedVendors(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => { const n = [...items]; n[i] = { ...n[i], [field]: value }; setItems(n); };

  const vendors = vendorsData?.items || [];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/rfqs')} sx={{ color: 'text.secondary' }}>Back</Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Create RFQ</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Fill in the details to create a new Request for Quotation</Typography>
        </Box>
      </Box>

      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {STEPS.map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
      </Stepper>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Step 1: Basic Info */}
          {step === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}><TextField fullWidth label="RFQ Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={!!errors.title} helperText={errors.title} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Deadline" type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>
          )}

          {/* Step 2: Items */}
          {step === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Line Items</Typography>
                <Button startIcon={<Add />} onClick={addItem} variant="outlined" size="small">Add Item</Button>
              </Box>
              {errors.items && <Typography color="error" variant="body2" sx={{ mb: 1 }}>{errors.items}</Typography>}
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Item Name *</TableCell><TableCell>Qty *</TableCell><TableCell>Unit</TableCell><TableCell>Specifications</TableCell><TableCell>Est. Cost</TableCell><TableCell width={50}></TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell><TextField fullWidth size="small" value={item.item_name} onChange={(e) => updateItem(i, 'item_name', e.target.value)} error={!!errors[`item_${i}_name`]} /></TableCell>
                        <TableCell sx={{ width: 100 }}><TextField size="small" type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} error={!!errors[`item_${i}_qty`]} sx={{ width: 80 }} /></TableCell>
                        <TableCell sx={{ width: 100 }}><TextField size="small" value={item.unit} onChange={(e) => updateItem(i, 'unit', e.target.value)} sx={{ width: 90 }} /></TableCell>
                        <TableCell><TextField fullWidth size="small" value={item.specifications} onChange={(e) => updateItem(i, 'specifications', e.target.value)} /></TableCell>
                        <TableCell sx={{ width: 120 }}><TextField size="small" type="number" value={item.estimated_cost} onChange={(e) => updateItem(i, 'estimated_cost', e.target.value)} sx={{ width: 100 }} /></TableCell>
                        <TableCell><IconButton size="small" onClick={() => removeItem(i)} sx={{ color: 'error.main' }}><Delete fontSize="small" /></IconButton></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Step 3: Vendors */}
          {step === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Select Vendors ({selectedVendors.length} selected)</Typography>
              {vendors.map(v => (
                <Box key={v.id} onClick={() => toggleVendor(v.id)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 1, borderRadius: 2, cursor: 'pointer', border: (t) => `1px solid ${selectedVendors.includes(v.id) ? t.palette.primary.main : t.palette.divider}`, bgcolor: selectedVendors.includes(v.id) ? (t) => alpha(t.palette.primary.main, 0.08) : 'transparent', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                  <Checkbox checked={selectedVendors.includes(v.id)} sx={{ '&.Mui-checked': { color: 'primary.main' } }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{v.category} • {v.email}</Typography>
                  </Box>
                  {v.rating > 0 && <Chip label={`★ ${v.rating}`} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b' }} />}
                </Box>
              ))}
              {vendors.length === 0 && <Typography color="text.secondary">No active vendors found. Add vendors first.</Typography>}
            </Box>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Review & Submit</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><Typography variant="overline" sx={{ color: 'text.secondary' }}>Title</Typography><Typography sx={{ fontWeight: 500 }}>{form.title}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="overline" sx={{ color: 'text.secondary' }}>Deadline</Typography><Typography sx={{ fontWeight: 500 }}>{form.deadline || 'Not set'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="overline" sx={{ color: 'text.secondary' }}>Description</Typography><Typography sx={{ fontWeight: 500 }}>{form.description || 'None'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="overline" sx={{ color: 'text.secondary' }}>Items ({items.length})</Typography>
                  {items.map((it, i) => <Chip key={i} label={`${it.item_name} × ${it.quantity}`} size="small" sx={{ mr: 1, mt: 0.5 }} />)}
                </Grid>
                <Grid item xs={12}><Typography variant="overline" sx={{ color: 'text.secondary' }}>Vendors ({selectedVendors.length})</Typography>
                  {vendors.filter(v => selectedVendors.includes(v.id)).map(v => <Chip key={v.id} label={v.name} size="small" sx={{ mr: 1, mt: 0.5 }} />)}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={step === 0} onClick={handleBack} startIcon={<ArrowBack />}>Back</Button>
            {step < 3 ? (
              <Button variant="contained" color="primary" onClick={handleNext} endIcon={<ArrowForward />}>Next</Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={createMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <Send />} disabled={createMutation.isPending}>Submit RFQ</Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
