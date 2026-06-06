import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link,
  InputAdornment, IconButton, Avatar, Alert, CircularProgress, alpha
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff, Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const validateField = (field, value) => {
    let error = '';
    if (field === 'email') {
      if (!value) error = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email address';
    }
    if (field === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    if (touched[field]) {
      const error = validateField(field, val);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateField('email', form.email);
    const passwordErr = validateField('password', form.password);

    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      setTouched({ email: true, password: true });
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'background.default', px: 2, py: 4,
      background: (t) => `radial-gradient(ellipse at 50% 0%, ${alpha(t.palette.primary.main, 0.12)} 0%, transparent 70%), ${t.palette.background.default}`,
    }}>
      <Card sx={{
        width: '100%', maxWidth: 440, position: 'relative', overflow: 'visible',
        bgcolor: 'background.paper',
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
        borderRadius: 4, boxShadow: (t) => t.shadows[4],
      }}>
        {/* Circular Avatar */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4 }}>
          <Avatar sx={{
            width: 72, height: 72,
            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
            boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.35)}`,
            border: (t) => `4px solid ${t.palette.background.paper}`,
          }}>
            <LockOutlined sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <CardContent sx={{ px: { xs: 3, sm: 4 }, pb: 4, pt: 3 }}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 0.5 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mb: 4 }}>
            Procurement & Vendor Management ERP
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth label="Email Address" type="email" value={form.email}
              onChange={handleChange('email')}
              onBlur={() => handleBlur('email')}
              error={!!errors.email} helperText={errors.email}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
            />
            <TextField
              fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={form.password}
              onChange={handleChange('password')}
              onBlur={() => handleBlur('password')}
              error={!!errors.password} helperText={errors.password}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: 'text.secondary' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link component={RouterLink} to="/forgot-password" sx={{ fontSize: '0.82rem', color: 'primary.light', '&:hover': { color: 'primary.main' } }}>
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ py: 1.4, fontSize: '0.95rem', fontWeight: 600, borderRadius: 3 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/signup" sx={{ color: 'primary.light', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
