import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, MenuItem, Chip, CircularProgress, Pagination, alpha
} from '@mui/material';
import { Timeline as TimelineIcon, FilterList } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import activityLogsApi from '../api/activityLogs';
import { format } from 'date-fns';

const ENTITY_TYPES = ['', 'vendor', 'rfq', 'quotation', 'approval', 'purchase_order', 'invoice'];
const ENTITY_COLORS = { vendor: '#1e40af', rfq: '#3b82f6', quotation: '#f59e0b', approval: '#10b981', purchase_order: '#a855f7', invoice: '#ec4899' };

export default function ActivityPage() {
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', page, entityType],
    queryFn: () => activityLogsApi.getAll({ page, size: 20, entity_type: entityType || undefined }),
  });

  const logs = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Activity & Logs</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Track all procurement activities and changes</Typography>
        </Box>
        <TextField select value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          size="small" label="Filter by Type" sx={{ minWidth: 180 }}>
          <MenuItem value="">All Activities</MenuItem>
          {ENTITY_TYPES.filter(Boolean).map(t => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t.replace('_', ' ')}</MenuItem>)}
        </TextField>
      </Box>

      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {logs.map((log, i) => (
          <Card key={log.id} sx={{
            transition: 'all 0.2s', '&:hover': { transform: 'translateX(4px)' },
            borderLeft: `4px solid ${ENTITY_COLORS[log.entity_type] || '#64748b'}`,
          }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip label={log.entity_type?.replace('_', ' ')} size="small"
                      sx={{ bgcolor: alpha(ENTITY_COLORS[log.entity_type] || '#64748b', 0.15), color: ENTITY_COLORS[log.entity_type] || '#94a3b8', fontWeight: 600, textTransform: 'capitalize', fontSize: '0.7rem' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.action}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Entity: {log.entity_id?.slice(0, 12)}... {log.performed_by && `• By: ${log.performed_by.slice(0, 8)}...`}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {format(new Date(log.created_on), 'dd MMM yyyy HH:mm')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {!isLoading && logs.length === 0 && (
        <Card><CardContent sx={{ textAlign: 'center', py: 6 }}>
          <TimelineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">No activity logs found</Typography>
        </CardContent></Card>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)}
            sx={{ '& .MuiPaginationItem-root': { color: 'text.secondary' }, '& .Mui-selected': { bgcolor: (t) => alpha(t.palette.primary.main, 0.2) } }} />
        </Box>
      )}
    </Box>
  );
}
