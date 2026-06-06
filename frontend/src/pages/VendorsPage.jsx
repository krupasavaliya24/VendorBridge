import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, IconButton, Grid, Card, CardContent, alpha, InputAdornment, Rating
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Search, Edit, Delete, Business } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vendorsApi from '../api/vendors';
import toast from 'react-hot-toast';

const STATUS_COLORS = { active: 'success', inactive: 'default', blacklisted: 'error', pending: 'warning' };
const CATEGORIES = ['IT Services', 'Manufacturing', 'Consulting', 'Logistics', 'Raw Materials', 'Office Supplies', 'Other'];

const emptyForm = { name: '', category: '', gst_number: '', email: '', phone: '', address: '', city: '', country: 'India', status: 'active', rating: 0 };

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', page + 1, pageSize, search, statusFilter],
    queryFn: () => vendorsApi.getAll({ page: page + 1, page_size: pageSize, search: search || undefined, status: statusFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (d) => vendorsApi.create(d),
    onSuccess: () => { toast.success('Vendor created!'); queryClient.invalidateQueries({ queryKey: ['vendors'] }); closeDialog(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to create vendor'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => vendorsApi.update(id, d),
    onSuccess: () => { toast.success('Vendor updated!'); queryClient.invalidateQueries({ queryKey: ['vendors'] }); closeDialog(); },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to update vendor'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vendorsApi.delete(id),
    onSuccess: () => { toast.success('Vendor deleted'); queryClient.invalidateQueries({ queryKey: ['vendors'] }); },
  });

  const openCreate = () => { setEditVendor(null); setForm(emptyForm); setErrors({}); setDialogOpen(true); };
  const openEdit = (vendor) => { setEditVendor(vendor); setForm({ name: vendor.name || '', category: vendor.category || '', gst_number: vendor.gst_number || '', email: vendor.email || '', phone: vendor.phone || '', address: vendor.address || '', city: vendor.city || '', country: vendor.country || 'India', status: vendor.status || 'active', rating: vendor.rating || 0 }); setErrors({}); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditVendor(null); setForm(emptyForm); };

  const handleSubmit = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const payload = { ...form, rating: form.rating || undefined };
    if (editVendor) updateMutation.mutate({ id: editVendor.id, ...payload });
    else createMutation.mutate(payload);
  };

  const columns = [
    { field: 'vendor_code', headerName: 'Code', width: 120, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light' }}>{p.value}</Typography> },
    { field: 'name', headerName: 'Vendor Name', flex: 1, minWidth: 180 },
    { field: 'category', headerName: 'Category', width: 140 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || 'default'} sx={{ fontWeight: 500, textTransform: 'capitalize', fontSize: '0.75rem' }} /> },
    { field: 'rating', headerName: 'Rating', width: 100, renderCell: (p) => <Typography variant="body2">{p.value ? `${p.value}/5` : '—'}</Typography> },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (p) => (
        <Box>
          <IconButton size="small" onClick={() => openEdit(p.row)} sx={{ color: 'text.secondary' }}><Edit fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => { if (window.confirm('Delete this vendor?')) deleteMutation.mutate(p.row.id); }} sx={{ color: 'error.main' }}><Delete fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Vendors</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage your vendor records and relationships</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ background: 'linear-gradient(135deg, #8B1A1A, #5C0A0A)', '&:hover': { boxShadow: '0 4px 16px rgba(139,26,26,0.4)' } }}>
          Add Vendor
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} size="small"
          sx={{ minWidth: 260 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
        />
        <TextField select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small"
          sx={{ minWidth: 150 }} label="Status">
          <MenuItem value="">All</MenuItem>
          {Object.keys(STATUS_COLORS).map(s => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
        </TextField>
      </Box>

      {/* DataGrid */}
      <Card>
        <DataGrid
          rows={data?.items || []} columns={columns} loading={isLoading}
          paginationMode="server" rowCount={data?.total || 0}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick autoHeight
          sx={{ border: 'none', '& .MuiDataGrid-row:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) } }}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Vendor Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} helperText={errors.name} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <MenuItem value="">None</MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="GST Number" value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={!!errors.email} helperText={errors.email} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} multiline rows={2} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.keys(STATUS_COLORS).map(s => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Rating</Typography>
              <Rating value={form.rating} onChange={(e, v) => setForm({ ...form, rating: v })} precision={0.5} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDialog} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}
            sx={{ background: 'linear-gradient(135deg, #8B1A1A, #5C0A0A)' }}>
            {editVendor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
