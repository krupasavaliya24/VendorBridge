import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Tabs, Tab, Chip, alpha } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Visibility } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import rfqsApi from '../api/rfqs';
import { format } from 'date-fns';

const STATUSES = ['', 'draft', 'open', 'closed', 'cancelled'];
const STATUS_LABELS = ['All', 'Draft', 'Open', 'Closed', 'Cancelled'];
const STATUS_COLORS = { draft: 'default', open: 'info', closed: 'success', cancelled: 'error' };

export default function RFQsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const statusFilter = STATUSES[tab] || undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['rfqs', page + 1, pageSize, statusFilter],
    queryFn: () => rfqsApi.getAll({ page: page + 1, page_size: pageSize, status: statusFilter }),
  });

  const columns = [
    { field: 'rfq_number', headerName: 'RFQ Number', width: 150, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light' }}>{p.value}</Typography> },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || 'default'} sx={{ fontWeight: 500, textTransform: 'capitalize', fontSize: '0.75rem' }} /> },
    { field: 'deadline', headerName: 'Deadline', width: 150, renderCell: (p) => p.value ? format(new Date(p.value), 'dd MMM yyyy') : '—' },
    { field: 'created_on', headerName: 'Created', width: 150, renderCell: (p) => format(new Date(p.value), 'dd MMM yyyy') },
    {
      field: 'actions', headerName: 'Actions', width: 80, sortable: false,
      renderCell: (p) => (
        <Button size="small" startIcon={<Visibility />} onClick={() => navigate(`/rfqs/${p.row.id}`)}
          sx={{ color: 'text.secondary', fontSize: '0.75rem', minWidth: 0 }}>View</Button>
      ),
    },
  ];

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>RFQs</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage Request for Quotations</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/rfqs/new')}
          sx={{ background: 'linear-gradient(135deg, #8B1A1A, #5C0A0A)' }}>Create RFQ</Button>
      </Box>

      <Tabs value={tab} onChange={(e, v) => { setTab(v); setPage(0); }} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        {STATUS_LABELS.map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      <Box sx={{ bgcolor: (t) => alpha(t.palette.background.paper, 0.8), borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <DataGrid
          rows={data?.items || []} columns={columns} loading={isLoading}
          paginationMode="server" rowCount={data?.total || 0}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          pageSizeOptions={[10, 20, 50]} disableRowSelectionOnClick autoHeight
          onRowClick={(p) => navigate(`/rfqs/${p.row.id}`)}
          sx={{ border: 'none', cursor: 'pointer' }}
        />
      </Box>
    </Box>
  );
}
