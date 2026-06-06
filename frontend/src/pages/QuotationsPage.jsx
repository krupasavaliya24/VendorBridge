import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Chip, alpha } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import quotationsApi from '../api/quotations';
import { format } from 'date-fns';

const STATUSES = ['', 'submitted', 'under_review', 'selected', 'rejected'];
const LABELS = ['All', 'Submitted', 'Under Review', 'Selected', 'Rejected'];
const COLORS = { submitted: 'info', under_review: 'warning', selected: 'success', rejected: 'error' };

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['quotations', page + 1, pageSize, STATUSES[tab]],
    queryFn: () => quotationsApi.getAll({ page: page + 1, page_size: pageSize, status: STATUSES[tab] || undefined }),
  });

  const columns = [
    { field: 'quotation_number', headerName: 'Quotation #', width: 150, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light' }}>{p.value}</Typography> },
    { field: 'rfq_id', headerName: 'RFQ', width: 140, renderCell: (p) => <Typography variant="body2" sx={{ color: 'text.secondary' }}>{p.value?.slice(0, 8)}...</Typography> },
    { field: 'total_amount', headerName: 'Amount', width: 130, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{p.value?.toLocaleString()}</Typography> },
    { field: 'delivery_days', headerName: 'Delivery', width: 100, renderCell: (p) => `${p.value || '—'} days` },
    { field: 'vendor_score', headerName: 'Score', width: 90, renderCell: (p) => p.value ? <Chip label={p.value.toFixed(1)} size="small" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#10b981', fontWeight: 600 }} /> : '—' },
    { field: 'status', headerName: 'Status', width: 130, renderCell: (p) => <Chip label={p.value?.replace('_', ' ')} size="small" color={COLORS[p.value] || 'default'} sx={{ fontWeight: 500, textTransform: 'capitalize', fontSize: '0.75rem' }} /> },
    { field: 'created_on', headerName: 'Created', width: 130, renderCell: (p) => format(new Date(p.value), 'dd MMM yyyy') },
  ];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Quotations</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>View and manage vendor quotations</Typography>
      </Box>

      <Tabs value={tab} onChange={(e, v) => { setTab(v); setPage(0); }} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        {LABELS.map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

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
