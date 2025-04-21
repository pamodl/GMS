import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { 
  TextField, Button, Box, Typography, Alert, IconButton, 
  InputAdornment, Paper, Container, Divider, CircularProgress,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

// Define Figtree font style to match your Header component
const figtreeFont = {
  fontFamily: 'Figtree, sans-serif'
};

export default function SignUp() {
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    regNumber: '',
    role: 'student', // Default role
  });
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const togglePasswordConfirmVisibility = () => {
    setPasswordConfirmVisible(!passwordConfirmVisible);
  };

  const validateField = (id, value) => {
    let errors = { ...fieldErrors };
    
    switch (id) {
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
     // case 'regNumber':
       // const regNumberPattern = /^[A-Za-z]{2}\/\d{4}\/\d{5}$/;
        //if (!regNumberPattern.test(value)) {
          //errors.regNumber = 'Format should be XX/YYYY/ZZZZZ';
        //} else {
          //delete errors.regNumber;
        //}
        //break;
      case 'passwordConfirm':
        if (value !== formData.password) {
          errors.passwordConfirm = 'Passwords do not match';
        } else {
          delete errors.passwordConfirm;
        }
        break;
      default:
        // No specific validation
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
    validateField(id, value);
  };

  const handleRoleChange = (e) => {
    setFormData({
      ...formData,
      role: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    Object.entries(formData).forEach(([id, value]) => {
      if (!validateField(id, value)) {
        isValid = false;
      }
    });
    
    if (!isValid) return;
    
    // Additional validation
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/Back/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Something went wrong');
      }

      const data = await res.json();
      if (data.success === false) {
        if (data.message.includes('E11000 duplicate key error collection')) {
          setError('User already exists with this email or registration number');
        } else {
          setError(data.message);
        }
        return;
      }
      
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.username && 
      formData.email && 
      formData.password && 
      formData.passwordConfirm && 
      formData.regNumber &&
      Object.keys(fieldErrors).length === 0
    );
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
              Create Account
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              align="center"
              sx={{ ...figtreeFont }}
            >
              Join GymTrac to start tracking your fitness journey
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
              label="Username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                sx: figtreeFont
              }}
              InputLabelProps={{ sx: figtreeFont }}
              required
            />
            
            <TextField
              label="Email"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
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
              label="Registration Number"
              id="regNumber"
              value={formData.regNumber}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
             // placeholder="XX/YYYY/ZZZZZ"
              //error={!!fieldErrors.regNumber}
              //helperText={fieldErrors.regNumber || "Format: XX/YYYY/ZZZZZ"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                sx: figtreeFont
              }}
              InputLabelProps={{ sx: figtreeFont }}
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label" sx={figtreeFont}>Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={formData.role}
                onChange={handleRoleChange}
                label="Role"
                startAdornment={
                  <InputAdornment position="start">
                    <SchoolOutlinedIcon color="action" />
                  </InputAdornment>
                }
                sx={figtreeFont}
              >
                <MenuItem value="student" sx={figtreeFont}>Student</MenuItem>
                <MenuItem value="academic" sx={figtreeFont}>Academic</MenuItem>
                <MenuItem value="non-academic" sx={figtreeFont}>Non-Academic</MenuItem>
              </Select>
            </FormControl>
            
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
            
            <TextField
              label="Confirm Password"
              id="passwordConfirm"
              type={passwordConfirmVisible ? 'text' : 'password'}
              value={formData.passwordConfirm}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              error={!!fieldErrors.passwordConfirm}
              helperText={fieldErrors.passwordConfirm}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={togglePasswordConfirmVisibility}
                      edge="end"
                      aria-label={passwordConfirmVisible ? 'hide password' : 'show password'}
                    >
                      {passwordConfirmVisible ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: figtreeFont
              }}
              InputLabelProps={{ sx: figtreeFont }}
              required
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              type="submit"
              disabled={loading || !isFormValid()}
              sx={{ 
                mt: 3, 
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
                'Sign Up'
              )}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />
          
          <Typography 
            variant="body1" 
            align="center"
            sx={{ ...figtreeFont }}
          >
            Already have an account?{' '}
            <Typography
              component={Link}
              to="/login"
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
              Sign In
            </Typography>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}