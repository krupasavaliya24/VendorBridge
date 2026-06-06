import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab, TextField, Button,
  CircularProgress, Divider, alpha
} from '@mui/material';
import { Save, Business, Email as EmailIcon, Notifications } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import settingsApi from '../api/settings';
import toast from 'react-hot-toast';

const TABS = [
  { label: 'General', icon: <Business />, category: 'general' },
  { label: 'SMTP / Email', icon: <EmailIcon />, category: 'smtp' },
  { label: 'Notifications', icon: <Notifications />, category: 'notifications' },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [edits, setEdits] = useState({});

  const category = TABS[tab].category;

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', category],
    queryFn: () => settingsApi.getAll(category),
  });

  const saveMutation = useMutation({
    mutationFn: (items) => settingsApi.bulkUpdate(items),
    onSuccess: () => {
      toast.success('Settings saved!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setEdits({});
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to save'),
  });

  const settingsList = Array.isArray(settings) ? settings : (settings?.items || []);

  const handleSave = () => {
    const items = Object.entries(edits).map(([key, value]) => ({ key, value }));
    if (items.length === 0) { toast('No changes to save'); return; }
    saveMutation.mutate(items);
  };

  const getValue = (key) => edits[key] !== undefined ? edits[key] : settingsList.find(s => s.key === key)?.value || '';

  return (
    <Box className="animate-fade-in">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Settings</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Configure system settings (Admin only)</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar Tabs */}
        <Grid item xs={12} md={3}>
          <Card>
            <Tabs orientation="vertical" value={tab} onChange={(e, v) => { setTab(v); setEdits({}); }}
              sx={{
                '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', py: 1.5, px: 2.5, minHeight: 48 },
                '& .Mui-selected': { bgcolor: (t) => alpha(t.palette.primary.main, 0.1) },
              }}>
              {TABS.map((t, i) => (
                <Tab key={i} label={t.label} icon={t.icon} iconPosition="start"
                  sx={{ justifyContent: 'flex-start', gap: 1.5 }} />
              ))}
            </Tabs>
          </Card>
        </Grid>

        {/* Settings Form */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{TABS[tab].label} Settings</Typography>
                <Button variant="contained" color="primary" startIcon={saveMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <Save />}
                  onClick={handleSave} disabled={Object.keys(edits).length === 0 || saveMutation.isPending}>
                  Save Changes
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
              ) : settingsList.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No settings found for this category. Settings are configured from the backend.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {settingsList.map(setting => (
                    <Box key={setting.key}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, textTransform: 'capitalize' }}>
                        {setting.key.replace(/_/g, ' ')}
                      </Typography>
                      {setting.description && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                          {setting.description}
                        </Typography>
                      )}
                      <TextField
                        fullWidth size="small"
                        value={getValue(setting.key)}
                        onChange={(e) => setEdits({ ...edits, [setting.key]: e.target.value })}
                        multiline={setting.value && setting.value.length > 100}
                        rows={setting.value && setting.value.length > 100 ? 3 : 1}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
