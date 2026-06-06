import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link,
  InputAdornment, IconButton, Avatar, MenuItem, CircularProgress, Grid, alpha
} from '@mui/material';
import { PersonAddOutlined, Visibility, VisibilityOff, Email, Person, Phone, Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'procurement_manager', label: 'Procurement Manager' },
  { value: 'approver', label: 'Approver' },
  { value: 'admin', label: 'Admin' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'vendor' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (!form.role) errs.role = 'Role is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({ full_name: form.full_name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#0a0e17', px: 2, py: 4,
      background: 'radial-gradient(ellipse at 50% 0%, rgba(139,26,26,0.15) 0%, transparent 60%), #0a0e17',
    }}>
      <Card sx={{
        width: '100%', maxWidth: 520, position: 'relative', overflow: 'visible',
        bgcolor: alpha('#0f1520', 0.9), backdropFilter: 'blur(20px)',
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
        borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4 }}>
          <Avatar sx={{
            width: 72, height: 72,
            background: 'linear-gradient(135deg, #8B1A1A 0%, #5C0A0A 100%)',
            boxShadow: '0 8px 24px rgba(139,26,26,0.4)', border: '4px solid #0f1520',
          }}>
            <PersonAddOutlined sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <CardContent sx={{ px: { xs: 3, sm: 4 }, pb: 4, pt: 3 }}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 0.5 }}>Create Account</Typography>
          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mb: 3.5 }}>
            Join VendorBridge Procurement Platform
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" value={form.full_name} onChange={handleChange('full_name')}
                  error={!!errors.full_name} helperText={errors.full_name}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email Address" type="email" value={form.email} onChange={handleChange('email')}
                  error={!!errors.email} helperText={errors.email}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone (Optional)" value={form.phone} onChange={handleChange('phone')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange('password')}
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Role" value={form.role} onChange={handleChange('role')}
                  error={!!errors.role} helperText={errors.role}>
                  {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{
                py: 1.4, fontSize: '0.95rem', fontWeight: 600, borderRadius: 3, mt: 1,
                background: 'linear-gradient(135deg, #8B1A1A 0%, #5C0A0A 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #9B2D2D 0%, #8B1A1A 100%)', boxShadow: '0 6px 20px rgba(139,26,26,0.5)' },
              }}>
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ color: 'primary.light', fontWeight: 600 }}>Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
