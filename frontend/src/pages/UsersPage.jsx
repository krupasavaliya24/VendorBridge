import React, { useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, CircularProgress, alpha
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, People } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usersApi from '../api/users';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'procurement_manager', label: 'Procurement Manager' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'approver', label: 'Approver' },
];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [dialog, setDialog] = useState({ open: false, user: null });
  const [form, setForm] = useState({ full_name: '', role: 'vendor', is_active: true });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialog({ open: false, user: null });
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to update user'),
  });

  const openEdit = (row) => {
    setDialog({ open: true, user: row });
    setForm({ full_name: row.full_name, role: row.role, is_active: row.is_active });
  };

  const handleSave = () => {
    updateMutation.mutate({ id: dialog.user.id, data: form });
  };

  const columns = [
    { field: 'full_name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 220 },
    {
      field: 'role', headerName: 'Role', width: 190,
      renderCell: (p) => <Chip label={p.value?.replace('_', ' ')} size="small" sx={{ textTransform: 'capitalize', fontWeight: 600 }} />,
    },
    {
      field: 'is_active', headerName: 'Status', width: 130,
      renderCell: (p) => <Chip label={p.value ? 'Active' : 'Inactive'} size="small" color={p.value ? 'success' : 'default'} />,
    },
    { field: 'created_on', headerName: 'Created', width: 140, renderCell: (p) => format(new Date(p.value), 'dd MMM yyyy') },
    {
      field: 'actions', headerName: 'Actions', width: 110, sortable: false,
      renderCell: (p) => (
        <Button size="small" startIcon={<Edit />} onClick={() => openEdit(p.row)}>Edit</Button>
      ),
    },
  ];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Users</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage role-based access and active users</Typography>
      </Box>

      <Box sx={{ bgcolor: (t) => alpha(t.palette.background.paper, 0.8), borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <DataGrid
          rows={users || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
          disableRowSelectionOnClick
          autoHeight
          sx={{ border: 'none' }}
        />
      </Box>

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <People /> Edit User
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField fullWidth label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <TextField select fullWidth label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map(role => <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>)}
          </TextField>
          <TextField select fullWidth label="Status" value={form.is_active ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })}>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive" disabled={dialog.user?.id === currentUser?.id}>Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialog({ open: false, user: null })} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending || !form.full_name.trim()}>
            {updateMutation.isPending ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
