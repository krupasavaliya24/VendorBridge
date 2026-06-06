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
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const validateField = (field, value) => {
    let error = '';
    if (field === 'full_name') {
      if (!value.trim()) error = 'Full name is required';
    }
    if (field === 'email') {
      if (!value) error = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email address';
    }
    if (field === 'phone') {
      if (value && !/^\d{10}$/.test(value.replace(/[-() ]/g, ''))) {
        error = 'Phone number must be exactly 10 digits';
      }
    }
    if (field === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }
    if (field === 'role') {
      if (!value) error = 'Role is required';
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

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        toast.success('Profile picture selected!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fields = ['full_name', 'email', 'phone', 'password', 'role'];
    const newErrors = {};
    let hasError = false;

    fields.forEach(f => {
      const err = validateField(f, form[f]);
      if (err) {
        newErrors[f] = err;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
      return;
    }

    setLoading(true);
    try {
      await signup({ full_name: form.full_name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed. Please try again.');
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
        width: '100%', maxWidth: 520, position: 'relative', overflow: 'visible',
        bgcolor: 'background.paper',
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
        borderRadius: 4, boxShadow: (t) => t.shadows[4],
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4 }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Avatar
            onClick={handleAvatarClick}
            src={avatarPreview || undefined}
            sx={{
              width: 72, height: 72,
              cursor: 'pointer',
              background: avatarPreview ? 'transparent' : (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
              boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.35)}`,
              border: (t) => `4px solid ${t.palette.background.paper}`,
              position: 'relative',
              '&:hover::after': {
                content: '"Upload"',
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.45)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '50%',
              }
            }}>
            {!avatarPreview && <PersonAddOutlined sx={{ fontSize: 32 }} />}
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
                <TextField fullWidth label="Full Name *" value={form.full_name}
                  onChange={handleChange('full_name')}
                  onBlur={() => handleBlur('full_name')}
                  error={!!errors.full_name} helperText={errors.full_name}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email Address *" type="email" value={form.email}
                  onChange={handleChange('email')}
                  onBlur={() => handleBlur('email')}
                  error={!!errors.email} helperText={errors.email}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone (Optional)" value={form.phone}
                  onChange={handleChange('phone')}
                  onBlur={() => handleBlur('phone')}
                  error={!!errors.phone} helperText={errors.phone}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Password *" type={showPassword ? 'text' : 'password'}
                  value={form.password}
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Role *" value={form.role}
                  onChange={handleChange('role')}
                  onBlur={() => handleBlur('role')}
                  error={!!errors.role} helperText={errors.role}>
                  {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{
                py: 1.4, fontSize: '0.95rem', fontWeight: 600, borderRadius: 3, mt: 1,
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
