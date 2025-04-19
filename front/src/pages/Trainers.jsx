import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardMedia, CardContent, 
  Box, Chip, Rating, Button, TextField, FormControl, 
  InputLabel, Select, MenuItem, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [specializations, setSpecializations] = useState(['all']);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Fetching trainers from API...');
      const response = await axios.get('/Back/trainers', {
        // Add timeout to prevent hanging requests
        timeout: 10000,
        // Add debugging headers if needed
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('API response received:', response.status);
      
      if (Array.isArray(response.data)) {
        console.log(`Retrieved ${response.data.length} trainers`);
        setTrainers(response.data);
        setFilteredTrainers(response.data);
        
        // Extract all unique specializations for the filter
        const allSpecializations = ['all'];
        response.data.forEach(trainer => {
          trainer.specialization?.forEach(spec => {
            if (spec && !allSpecializations.includes(spec)) {
              allSpecializations.push(spec);
            }
          });
        });
        setSpecializations(allSpecializations);
      } else {
        console.error('Invalid data format received:', response.data);
        setError('Received invalid data format from server. Expected an array of trainers.');
      }
    } catch (err) {
      console.error('Error fetching trainers:', err);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(`Server error (${err.response.status}): ${err.response.data?.message || 'Failed to load trainers'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response received from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request
        console.error('Request error:', err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter trainers based on search term and specialization
    const filtered = trainers.filter(trainer => {
      const matchesSearch = trainer.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trainer.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialization = selectedSpecialization === 'all' || 
                                  trainer.specialization?.includes(selectedSpecialization);
      
      return matchesSearch && matchesSpecialization;
    });
    
    setFilteredTrainers(filtered);
  }, [searchTerm, selectedSpecialization, trainers]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchTrainers}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Please try again later or contact support if the problem persists.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Our Professional Trainers
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Find the perfect trainer to help you achieve your fitness goals
      </Typography>

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Search trainers by name or bio"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Specialization</InputLabel>
            <Select
              value={selectedSpecialization}
              label="Specialization"
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              {specializations.map((spec) => (
                <MenuItem key={spec} value={spec}>
                  {spec === 'all' ? 'All Specializations' : spec}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {filteredTrainers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No trainers found matching your criteria</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredTrainers.map((trainer) => (
            <Grid item xs={12} sm={6} md={4} key={trainer._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
                elevation={2}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={trainer.profileImage || 'https://via.placeholder.com/300x200?text=Trainer'}
                  alt={trainer.userId?.username || 'Trainer'}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {trainer.userId?.username || 'Unnamed Trainer'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={trainer.rating || 0} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({trainer.reviewCount || 0} reviews)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    {trainer.specialization?.map((spec) => (
                      <Chip
                        key={spec}
                        label={spec}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    )) || 'No specializations listed'}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {trainer.bio?.length > 120 
                      ? `${trainer.bio.substring(0, 120)}...` 
                      : trainer.bio || 'No bio available'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Button 
                      component={Link} 
                      to={`/trainers/${trainer._id}`}
                      variant="contained"
                      size="small"
                    >
                      View Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}