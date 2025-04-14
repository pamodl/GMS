import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/user/userSlice';
import axios from 'axios';
import { 
  TextField, Button, Box, Typography, Alert, IconButton, 
  InputAdornment, Paper, Container, Divider, CircularProgress 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

// Define Figtree font style to match your Header component
const figtreeFont = {
  fontFamily: 'Figtree, sans-serif'
};

export default function Login() {
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const { loading, error } = useSelector((state) => state.user);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value
    }));
    
    // Clear email error when user types
    if (id === 'email') {
      setEmailError('');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    handleLogin();
  };

  const handleLogin = async () => {
    dispatch(loginStart());
    try {
      const response = await axios.post('/Back/auth/login', formData);
      if (response.data.user) {
        dispatch(loginSuccess(response.data.user));
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        throw new Error('User data is missing in the response');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ ...figtreeFont }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 120px)', // Account for header/footer
          py: 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            width: '100%',
            maxWidth: 450
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                ...figtreeFont
              }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              align="center"
              sx={{ ...figtreeFont }}
            >
              Please enter your credentials to access your account
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 1 }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              error={!!emailError}
              helperText={emailError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                sx: figtreeFont
              }}
              InputLabelProps={{ sx: figtreeFont }}
              required
            />
            
            <TextField
              label="Password"
              id="password"
              type={passwordVisible ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label={passwordVisible ? 'hide password' : 'show password'}
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: figtreeFont
              }}
              InputLabelProps={{ sx: figtreeFont }}
              required
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Typography 
                component={Link} 
                to="/forgot-password"
                variant="body2"
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  },
                  ...figtreeFont
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              type="submit"
              disabled={loading}
              sx={{ 
                mt: 1, 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                ...figtreeFont
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />
          
          <Typography 
            variant="body1" 
            align="center"
            sx={{ ...figtreeFont }}
          >
            Don't have an account?{' '}
            <Typography
              component={Link}
              to="/signup"
              variant="body1"
              sx={{ 
                color: 'primary.main',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                },
                ...figtreeFont
              }}
            >
              Sign Up
            </Typography>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}