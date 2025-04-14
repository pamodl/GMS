import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  TextField,
  Button,
  Container,
  Grid,
  Paper,
  Alert,
  FormHelperText,
  FormControl,
  InputAdornment,
  Breadcrumbs,
  Link,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

export default function AdminCreateEquipment() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState({
    name: '',
    category: '',
    quantity: 0,
    available: 0, // Added available field to match backend requirements
  });
  const [nameError, setNameError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [categories] = useState(['Sports Ball', 'Weights', 'Exercise Mat', 'Racket Sports']);

  const validateForm = () => {
    let isValid = true;
    
    if (!equipment.name.trim()) {
      setNameError('Equipment name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (equipment.quantity <= 0) {
      setQuantityError('Quantity must be greater than 0');
      isValid = false;
    } else {
      setQuantityError('');
    }
    
    return isValid;
  };

  const handleCreateEquipment = async () => {
    if (!validateForm()) return;
    
    try {
      // Set available equal to quantity for newly created equipment
      const equipmentToSubmit = {
        ...equipment,
        available: equipment.quantity
      };
      
      await axios.post('/Back/equipment/create', equipmentToSubmit);
      setSuccess('Equipment created successfully!');
      setEquipment({ name: '', category: '', quantity: 0, available: 0 });
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate('/admin/equipment');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Update quantity and available together when quantity changes
  const handleQuantityChange = (value) => {
    const quantity = parseInt(value, 10) || 0;
    setEquipment({
      ...equipment,
      quantity,
      available: quantity // When creating new equipment, available should equal quantity
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Title and Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            component={RouterLink}
            to="/admin" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            component={RouterLink}
            to="/admin/equipment"
          >
            Equipment Management
          </Link>
          <Typography color="text.primary">Add New Equipment</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Add New Equipment
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create new equipment for your gym inventory
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 4 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {/* Add New Equipment Form */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 6,
          borderRadius: '12px',
          maxWidth: 800,
          mx: 'auto',
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Equipment Name"
              value={equipment.name}
              onChange={(e) => setEquipment({ ...equipment, name: e.target.value })}
              fullWidth
              margin="normal"
              error={!!nameError}
              helperText={nameError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AddIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <Autocomplete
                options={categories}
                value={equipment.category}
                onChange={(event, newValue) => {
                  setEquipment({ ...equipment, category: newValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                )}
              />
              <FormHelperText>Select or type a category</FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Quantity"
              type="number"
              value={equipment.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              fullWidth
              margin="normal"
              error={!!quantityError}
              helperText={quantityError || "Enter the total quantity available"}
              inputProps={{ min: 1 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateEquipment}
              sx={{
                borderRadius: '8px',
                padding: '10px 24px',
                fontWeight: 'medium',
                boxShadow: 2,
                '&:hover': { boxShadow: 4 }
              }}
              startIcon={<AddIcon />}
            >
              Create Equipment
            </Button>
            
            <Button
              variant="outlined"
              component={RouterLink}
              to="/admin/equipment"
              sx={{
                borderRadius: '8px',
                padding: '10px 24px',
              }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}