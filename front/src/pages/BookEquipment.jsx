import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  Typography, Box, Button, CircularProgress, Alert, MenuItem, Select, 
  FormControl, InputLabel, TextField, Paper, Container, Grid, Divider,
  Snackbar, IconButton, Card, CardContent, CardMedia, Skeleton,
  useMediaQuery, useTheme, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import axios from 'axios';

// Define Figtree font style to match your Header component
const figtreeFont = {
  fontFamily: 'Figtree, sans-serif'
};

export default function BookEquipment() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedEquipmentDetails, setSelectedEquipmentDetails] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const detailsRef = useRef(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get('/Back/equipment/all');
        setEquipmentList(response.data.filter(item => item.available > 0));
        setLoading(false);
      } catch (err) {
        setError('Failed to load equipment. Please try again later.');
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  useEffect(() => {
    if (selectedEquipment) {
      const details = equipmentList.find(item => item._id === selectedEquipment);
      setSelectedEquipmentDetails(details);
      // Reset quantity if greater than available
      if (details && quantity > details.available) {
        setQuantity(details.available);
      }
      
      // Scroll to details section on mobile
      if (isMobile && detailsRef.current) {
        setTimeout(() => {
          detailsRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      setSelectedEquipmentDetails(null);
    }
  }, [selectedEquipment, equipmentList, isMobile]);

  const handleBooking = async () => {
    if (!selectedEquipment || quantity < 1) return;
    
    setLoading(true);
    try {
      await axios.post('/Back/bookings/create', {
        userId: currentUser._id,
        equipmentId: selectedEquipment,
        quantity,
      });
      setSuccess('Equipment booked successfully!');
      setSelectedEquipment('');
      setQuantity(1);
      
      // Refresh equipment list after booking
      const response = await axios.get('/Back/equipment/all');
      setEquipmentList(response.data.filter(item => item.available > 0));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  const handleIncreaseQuantity = () => {
    if (selectedEquipmentDetails && quantity < selectedEquipmentDetails.available) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  return (
    <Container maxWidth="md" sx={{ ...figtreeFont, py: { xs: 2, sm: 4 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <FitnessCenterIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: 'primary.main', mr: 1.5 }} />
          <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 600, ...figtreeFont }}>
            Book Equipment
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            severity="error" 
            onClose={handleCloseAlert}
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            severity="success" 
            onClose={handleCloseAlert}
            sx={{ width: '100%' }}
          >
            {success}
          </Alert>
        </Snackbar>

        {loading && !success && !error ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2, ...figtreeFont }}>
              Loading equipment...
            </Typography>
          </Box>
        ) : equipmentList.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No equipment available for booking at the moment.
          </Alert>
        ) : (
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="equipment-label" sx={figtreeFont}>Select Equipment</InputLabel>
                <Select
                  labelId="equipment-label"
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  label="Select Equipment"
                  sx={figtreeFont}
                  MenuProps={{ 
                    PaperProps: { 
                      style: { 
                        maxHeight: 300,
                        ...figtreeFont 
                      } 
                    } 
                  }}
                >
                  {equipmentList.map((equipment) => (
                    <MenuItem key={equipment._id} value={equipment._id} sx={figtreeFont}>
                      {equipment.name} ({equipment.available} available)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedEquipmentDetails && (
                <Card sx={{ mt: 3, borderRadius: 2, overflow: 'hidden' }}>
                  {selectedEquipmentDetails.imageUrl ? (
                    <CardMedia
                      component="img"
                      height={isMobile ? "120" : "160"}
                      image={selectedEquipmentDetails.imageUrl}
                      alt={selectedEquipmentDetails.name}
                    />
                  ) : (
                    <Box sx={{ 
                      height: isMobile ? 120 : 160, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      bgcolor: 'grey.200' 
                    }}>
                      <FitnessCenterIcon sx={{ fontSize: isMobile ? 60 : 80, color: 'grey.400' }} />
                    </Box>
                  )}
                  <CardContent>
                    <Typography gutterBottom variant="h6" sx={figtreeFont}>
                      {selectedEquipmentDetails.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={figtreeFont}>
                      {selectedEquipmentDetails.description || 'No description available.'}
                    </Typography>
                    <Box sx={{ 
                      mt: 2, 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center', 
                      gap: 1,
                      justifyContent: 'space-between' 
                    }}>
                      <Typography variant="body2" sx={figtreeFont}>
                        Available: <strong>{selectedEquipmentDetails.available}</strong>
                      </Typography>
                      <Typography variant="body2" sx={figtreeFont}>
                        Category: <strong>{selectedEquipmentDetails.category || 'General'}</strong>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
            
            <Grid item xs={12} md={6} ref={detailsRef}>
              <Typography variant="h6" gutterBottom sx={{ mt: { xs: 2, md: 0 }, ...figtreeFont }}>
                Booking Details
              </Typography>
              
              <Stack 
                direction={isMobile ? "column" : "row"} 
                spacing={2} 
                sx={{ mt: 2, mb: 4 }}
                alignItems={isMobile ? "stretch" : "center"}
              >
                <Typography sx={{ ...figtreeFont }}>Quantity:</Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: isMobile ? 'center' : 'flex-start'
                }}>
                  <IconButton 
                    onClick={handleDecreaseQuantity} 
                    disabled={quantity <= 1 || !selectedEquipment}
                    color="primary"
                    size="small"
                  >
                    <IndeterminateCheckBoxIcon />
                  </IconButton>
                  
                  <TextField
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && selectedEquipmentDetails && val <= selectedEquipmentDetails.available) {
                        setQuantity(val);
                      }
                    }}
                    InputProps={{
                      inputProps: { 
                        min: 1, 
                        max: selectedEquipmentDetails?.available || 1,
                        style: { textAlign: 'center', width: '40px' }
                      },
                      sx: figtreeFont
                    }}
                    variant="outlined"
                    size="small"
                  />
                  
                  <IconButton 
                    onClick={handleIncreaseQuantity} 
                    disabled={!selectedEquipment || !selectedEquipmentDetails || quantity >= selectedEquipmentDetails.available}
                    color="primary"
                    size="small"
                  >
                    <AddBoxIcon />
                  </IconButton>
                  
                  {selectedEquipmentDetails && (
                    <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary', ...figtreeFont }}>
                      (Max: {selectedEquipmentDetails.available})
                    </Typography>
                  )}
                </Box>
              </Stack>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleBooking}
                fullWidth
                size="large"
                disabled={!selectedEquipment || quantity < 1 || loading}
                sx={{ 
                  mt: 2, 
                  py: isMobile ? 1.2 : 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  ...figtreeFont
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Book Equipment'}
              </Button>
              
              <Typography variant="body2" sx={{ 
                mt: 2, 
                color: 'text.secondary', 
                textAlign: 'center', 
                px: isMobile ? 2 : 0,
                ...figtreeFont 
              }}>
                You'll be responsible for any equipment you book.
              </Typography>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
}