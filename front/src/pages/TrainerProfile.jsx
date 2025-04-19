import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Container, Typography, Box, Paper, Grid, Avatar, Chip, 
  Rating, Button, Divider, List, ListItem, ListItemText,
  Alert, CircularProgress, Breadcrumbs, Link, Skeleton,
  Card, CardContent, CardActions, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Snackbar
} from '@mui/material';
import { 
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  CalendarMonth as CalendarMonthIcon,
  Event as EventIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';

// Helper functions to replace date-fns
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date) => {
  if (!date) return '';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const SESSION_TYPES = ['fitness', 'weight training', 'yoga', 'consultation', 'group class'];

export default function TrainerProfile() {
  const { id } = useParams();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  // Booking form state
  const [sessionDate, setSessionDate] = useState(addDays(new Date(), 1));
  const [sessionType, setSessionType] = useState('fitness');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  
  useEffect(() => {
    const fetchTrainerProfile = async () => {
      try {
        console.log(`Fetching trainer with ID: ${id}`);
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/Back/trainers/${id}`);
        console.log('Trainer data received:', response.data);
        setTrainer(response.data);
      } catch (err) {
        console.error('Error fetching trainer:', err);
        setError('Failed to load trainer information.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrainerProfile();
    }
  }, [id]);

  // Update available times when date or trainer changes
  useEffect(() => {
    if (sessionDate && trainer && trainer.schedule) {
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][sessionDate.getDay()];
      const daySchedule = trainer.schedule.find(day => day.day === dayOfWeek);
      
      if (daySchedule && daySchedule.isAvailable) {
        // Create available time slots (hourly intervals)
        const startHour = parseInt(daySchedule.startTime.split(':')[0]);
        const endHour = parseInt(daySchedule.endTime.split(':')[0]);
        const startMinute = parseInt(daySchedule.startTime.split(':')[1]);
        const endMinute = parseInt(daySchedule.endTime.split(':')[1]);
        
        const times = [];
        for (let hour = startHour; hour < endHour; hour++) {
          // Skip last hour if it would go beyond end time
          const formattedHour = hour.toString().padStart(2, '0');
          const formattedMinute = startMinute.toString().padStart(2, '0');
          times.push(`${formattedHour}:${formattedMinute}`);
        }
        
        setAvailableTimes(times);
        // Reset selected times
        setStartTime('');
        setEndTime('');
      } else {
        setAvailableTimes([]);
      }
    }
  }, [sessionDate, trainer]);

  const handleBookSession = async () => {
    if (!currentUser) {
      setBookingError('You must be logged in to book a session');
      return;
    }
    
    if (!sessionDate || !startTime || !endTime || !sessionType) {
      setBookingError('Please complete all required fields');
      return;
    }
    
    setBookingInProgress(true);
    setBookingError(null);
    
    try {
      const response = await axios.post('/Back/trainers/session/book', {
        trainerId: trainer._id,
        userId: currentUser._id,
        date: sessionDate.toISOString(),
        startTime,
        endTime,
        sessionType,
        notes
      });
      
      setBookingSuccess('Session booked successfully! You will receive a notification with details.');
      setBookingDialogOpen(false);
      // Reset form
      setSessionDate(addDays(new Date(), 1));
      setSessionType('fitness');
      setStartTime('');
      setEndTime('');
      setNotes('');
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book session. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };
  
  const handleCloseAlert = () => {
    setBookingSuccess(null);
    setBookingError(null);
  };
  
  // Helper to check if a date is bookable (not in the past)
  const isDateBookable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to beginning of day
    return date >= today;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !trainer) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Trainer not found"}
        </Alert>
        <Button 
          component={RouterLink}
          to="/trainers"
          variant="contained"
        >
          Back to Trainers
        </Button>
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
          to="/trainers"
        >
          Trainers
        </Link>
        <Typography color="text.primary">{trainer.userId?.username || 'Trainer Profile'}</Typography>
      </Breadcrumbs>
      
      {/* Trainer Profile */}
      <Grid container spacing={4}>
        {/* Left Column - Trainer Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={trainer.profileImage || '/default-trainer.jpg'}
                alt={trainer.userId?.username}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <Typography variant="h5" fontWeight="bold">
                {trainer.userId?.username || 'Trainer'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Rating value={trainer.rating || 0} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({trainer.rating?.toFixed(1) || '0.0'})
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Specializations
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {trainer.specialization?.map((spec, index) => (
                <Chip key={index} label={spec} size="small" />
              ))}
            </Box>
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Experience
            </Typography>
            <Typography paragraph>
              {trainer.experience} years
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Session Type
            </Typography>
            <Typography paragraph>
              Free Educational Training
            </Typography>
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Certifications
            </Typography>
            <List dense disablePadding>
              {trainer.certifications?.map((cert, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemText 
                    primary={cert}
                    primaryTypographyProps={{ 
                      sx: { display: 'flex', alignItems: 'center' } 
                    }}
                    sx={{ my: 0.5 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Right Column - Bio, Schedule, Booking */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              About Me
            </Typography>
            <Typography paragraph>
              {trainer.bio || 'No bio provided.'}
            </Typography>
          </Paper>
          
          <Box sx={{ mb: 4, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Free Educational Program
            </Typography>
            <Typography variant="body2">
              This is part of Sri Lanka's free education initiative to promote health and fitness 
              among our community. All training sessions are provided at no cost to enrolled students 
              and faculty members.
            </Typography>
          </Box>
          
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Weekly Schedule
            </Typography>
            
            <Grid container spacing={2}>
              {trainer.schedule?.map((day, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card variant={day.isAvailable ? 'outlined' : 'filled'}>
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {day.day}
                      </Typography>
                      {day.isAvailable ? (
                        <Typography variant="body2">
                          {day.startTime} - {day.endTime}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not Available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              startIcon={<CalendarMonthIcon />}
              onClick={() => setBookingDialogOpen(true)}
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              disabled={!currentUser}
            >
              Book Free Session
            </Button>
          </Box>
          {!currentUser && (
            <Typography variant="body2" color="error" textAlign="center" sx={{ mt: 1 }}>
              You must be logged in to book a session
            </Typography>
          )}
        </Grid>
      </Grid>
      
      {/* Session Booking Dialog */}
      <Dialog 
        open={bookingDialogOpen} 
        onClose={() => !bookingInProgress && setBookingDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Book a Free Training Session</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Session Date"
                  type="date"
                  value={sessionDate ? sessionDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setSessionDate(newDate);
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0], // Disable past dates
                  }}
                  fullWidth
                  required
                  error={!sessionDate}
                  helperText={!sessionDate ? "Date is required" : ""}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Start Time</InputLabel>
                  <Select
                    value={startTime}
                    onChange={(e) => {
                      const selectedTime = e.target.value;
                      setStartTime(selectedTime);
                      
                      // Auto-set end time 1 hour later
                      const [hours, minutes] = selectedTime.split(':').map(Number);
                      let endHour = hours + 1;
                      
                      // Handle day wrap
                      if (endHour >= 24) {
                        endHour = 0;
                      }
                      
                      setEndTime(`${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
                    }}
                    label="Start Time"
                    disabled={availableTimes.length === 0}
                  >
                    {availableTimes.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  disabled={!startTime || availableTimes.length === 0}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Session Type</InputLabel>
                  <Select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    label="Session Type"
                  >
                    {SESSION_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Additional Notes"
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or information for the trainer"
                  fullWidth
                />
              </Grid>
            </Grid>
            
            {availableTimes.length === 0 && sessionDate && (
              <Alert severity="info" sx={{ mt: 2 }}>
                The trainer is not available on the selected date. Please choose a different day.
              </Alert>
            )}
            
            {bookingError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {bookingError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)} disabled={bookingInProgress}>
            Cancel
          </Button>
          <Button 
            onClick={handleBookSession} 
            variant="contained" 
            disabled={bookingInProgress || !startTime || !endTime || !sessionType || !sessionDate || availableTimes.length === 0}
            startIcon={bookingInProgress ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {bookingInProgress ? 'Booking...' : 'Book Free Session'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={!!bookingSuccess} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {bookingSuccess}
        </Alert>
      </Snackbar>
    </Container>
  );
}