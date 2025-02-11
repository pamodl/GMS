import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/user/userSlice';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert, IconButton, InputAdornment } from '@mui/material';

export default function Login() {
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const { loading, error } = useSelector((state) => state.user);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
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
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Email"
        id="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Password"
        id="password"
        type={passwordVisible ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={togglePasswordVisibility}>
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        sx={{ marginTop: 2 }}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <Typography variant="body2" sx={{ marginTop: 2 }}>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </Typography>
    </Box>
  );
}