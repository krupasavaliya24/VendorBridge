import React, { useState } from 'react';
import { Box, Typography, Chip, MenuItem, TextField, alpha, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Receipt } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import purchaseOrdersApi from '../api/purchaseOrders';
import invoicesApi from '../api/invoices';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUSES = ['draft', 'issued', 'acknowledged', 'in_progress', 'delivered', 'completed', 'cancelled'];
const STATUS_COLORS = { draft: 'default', issued: 'info', acknowledged: 'primary', in_progress: 'warning', delivered: 'success', completed: 'success', cancelled: 'error' };

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', page + 1, pageSize, statusFilter],
    queryFn: () => purchaseOrdersApi.getAll({ page: page + 1, page_size: pageSize, status: statusFilter || undefined }),
  });

  const invoiceMutation = useMutation({
    mutationFn: invoicesApi.generate,
    onSuccess: (invoice) => {
      toast.success('Invoice generated');
      navigate(`/invoices/${invoice.id}`);
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to generate invoice'),
  });

  const columns = [
    { field: 'po_number', headerName: 'PO Number', width: 150, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light' }}>{p.value}</Typography> },
    { field: 'subtotal', headerName: 'Subtotal', width: 120, renderCell: (p) => `₹${p.value?.toLocaleString()}` },
    { field: 'tax_rate', headerName: 'Tax %', width: 80, renderCell: (p) => `${p.value}%` },
    { field: 'tax_amount', headerName: 'Tax', width: 100, renderCell: (p) => `₹${p.value?.toLocaleString()}` },
    { field: 'grand_total', headerName: 'Grand Total', width: 140, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{p.value?.toLocaleString()}</Typography> },
    { field: 'status', headerName: 'Status', width: 140, renderCell: (p) => <Chip label={p.value?.replace('_', ' ')} size="small" color={STATUS_COLORS[p.value] || 'default'} sx={{ fontWeight: 500, textTransform: 'capitalize', fontSize: '0.72rem' }} /> },
    { field: 'issued_at', headerName: 'Issued', width: 130, renderCell: (p) => p.value ? format(new Date(p.value), 'dd MMM yyyy') : '—' },
    { field: 'created_on', headerName: 'Created', width: 130, renderCell: (p) => format(new Date(p.value), 'dd MMM yyyy') },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: (p) => (
        <IconButton size="small" title="Generate invoice" onClick={() => invoiceMutation.mutate(p.row.id)} sx={{ color: 'primary.main' }}>
          <Receipt fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Purchase Orders</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Track and manage purchase orders</Typography>
        </Box>
        <TextField select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small" label="Status" sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {STATUSES.map(s => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</MenuItem>)}
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
    </Box>
  );
}
