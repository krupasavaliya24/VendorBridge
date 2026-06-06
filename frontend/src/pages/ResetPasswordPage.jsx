import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Avatar, Alert, alpha, InputAdornment } from '@mui/material';
import { LockResetOutlined, Lock } from '@mui/icons-material';
import authApi from '../api/auth';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!token) {
      setError('Reset token is missing.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.resetPassword({ token, password: form.password });
      setMessage(result.message || 'Password reset successfully.');
      window.setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'background.default', px: 2,
      background: (t) => `radial-gradient(ellipse at 50% 0%, ${alpha(t.palette.primary.main, 0.12)} 0%, transparent 70%), ${t.palette.background.default}`,
    }}>
      <Card sx={{ width: '100%', maxWidth: 440, overflow: 'visible', borderRadius: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4 }}>
          <Avatar sx={{ width: 72, height: 72, background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`, border: (t) => `4px solid ${t.palette.background.paper}` }}>
            <LockResetOutlined sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <CardContent sx={{ px: { xs: 3, sm: 4 }, pb: 4, pt: 3 }}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 0.5 }}>Create New Password</Typography>
          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mb: 3 }}>
            Enter a new password for your VendorBridge account
          </Typography>
          {message && <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth label="New Password" type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
            />
            <TextField
              fullWidth label="Confirm Password" type="password" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
            />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.4, borderRadius: 3 }}>
              {loading ? 'Updating...' : 'Reset Password'}
            </Button>
          </Box>
          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            <Link component={RouterLink} to="/login" sx={{ color: 'primary.light', fontWeight: 600 }}>Back to Login</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
