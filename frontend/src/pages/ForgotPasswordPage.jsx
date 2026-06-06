import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Avatar, Alert, alpha } from '@mui/material';
import { LockResetOutlined, Email } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
    setSent(true);
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'background.default', px: 2,
      background: (t) => `radial-gradient(ellipse at 50% 0%, ${alpha(t.palette.primary.main, 0.12)} 0%, transparent 70%), ${t.palette.background.default}`,
    }}>
      <Card sx={{
        width: '100%', maxWidth: 440, overflow: 'visible',
        bgcolor: 'background.paper',
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`, borderRadius: 4,
        boxShadow: (t) => t.shadows[4],
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4 }}>
          <Avatar sx={{ width: 72, height: 72, background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`, boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.35)}`, border: (t) => `4px solid ${t.palette.background.paper}` }}>
            <LockResetOutlined sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <CardContent sx={{ px: { xs: 3, sm: 4 }, pb: 4, pt: 3 }}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 0.5 }}>Reset Password</Typography>
          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mb: 3 }}>
            Enter your email to receive a reset link
          </Typography>
          {sent ? (
            <Alert severity="success" sx={{ borderRadius: 3 }}>
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField fullWidth label="Email Address" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                error={!!error} helperText={error}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              />
              <Button type="submit" fullWidth variant="contained" size="large"
                sx={{ py: 1.4, borderRadius: 3 }}>
                Send Reset Link
              </Button>
            </Box>
          )}
          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            <Link component={RouterLink} to="/login" sx={{ color: 'primary.light', fontWeight: 600 }}>← Back to Login</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
