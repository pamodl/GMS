import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Grid, 
  Alert, CircularProgress, Breadcrumbs, Link,
  Card, CardContent, TextField, Button, Chip,
  ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TrainerSchedule() {
  const { currentUser } = useSelector(state => state.user);
  const [trainer, setTrainer] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTrainerProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        // Get trainer profile for the current user
        const trainerResponse = await axios.get(`/Back/trainers/user/${currentUser._id}`);
        setTrainer(trainerResponse.data);
        
        // Initialize schedule from trainer data or with defaults
        if (trainerResponse.data.schedule && trainerResponse.data.schedule.length > 0) {
          setSchedule(trainerResponse.data.schedule);
        } else {
          // Create default schedule if none exists
          setSchedule(
            DAYS.map(day => ({
              day,
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: day !== 'Sunday' // Default available Mon-Sat
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching trainer data:', err);
        setError('Failed to load trainer schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerProfile();
  }, [currentUser]);

  const handleAvailabilityChange = (day, isAvailable) => {
    setSchedule(prevSchedule => 
      prevSchedule.map(item => 
        item.day === day ? { ...item, isAvailable } : item
      )
    );
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule(prevSchedule => 
      prevSchedule.map(item => 
        item.day === day ? { ...item, [field]: value } : item
      )
    );
  };
  
  const saveSchedule = async () => {
    if (!trainer) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Debug: Log what we're sending
      console.log('Sending schedule update:', { schedule });
      
      // Use the correct endpoint
      const response = await axios.put(`/Back/trainers/${trainer._id}/schedule`, { schedule });
      
      console.log('Schedule update response:', response.data);
      
      setSuccess('Schedule updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving schedule:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Server response:', err.response.status, err.response.data);
        setError(`Failed to update schedule: ${err.response.data?.message || `Server error (${err.response.status})`}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('Failed to update schedule: No server response. Check your connection.');
      } else {
        console.error('Request error:', err.message);
        setError(`Failed to update schedule: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!trainer) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Your trainer profile could not be found. Please contact an administrator.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          component={RouterLink} 
          to="/"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Link
          underline="hover"
          color="inherit"
          component={RouterLink}
          to="/trainer/dashboard"
        >
          Trainer Dashboard
        </Link>
        <Typography color="text.primary">Schedule Management</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Manage Your Schedule
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={saveSchedule}
          disabled={saving}
          startIcon={<SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save Schedule'}
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          Set your availability for client sessions. Clients will only be able to book sessions during the times you mark as available.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {schedule.map((day) => (
          <Grid item xs={12} sm={6} md={4} key={day.day}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{day.day}</Typography>
                  <ToggleButtonGroup
                    value={day.isAvailable ? 'available' : 'unavailable'}
                    exclusive
                    onChange={(e, newValue) => {
                      if (newValue !== null) {
                        handleAvailabilityChange(day.day, newValue === 'available');
                      }
                    }}
                    size="small"
                  >
                    <ToggleButton value="available" color="primary">
                      Available
                    </ToggleButton>
                    <ToggleButton value="unavailable" color="error">
                      Unavailable
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Start Time
                  </Typography>
                  <TextField
                    type="time"
                    value={day.startTime}
                    onChange={(e) => handleTimeChange(day.day, 'startTime', e.target.value)}
                    fullWidth
                    disabled={!day.isAvailable}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    size="small"
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    End Time
                  </Typography>
                  <TextField
                    type="time"
                    value={day.endTime}
                    onChange={(e) => handleTimeChange(day.day, 'endTime', e.target.value)}
                    fullWidth
                    disabled={!day.isAvailable}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}