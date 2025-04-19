import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Breadcrumbs,
  Link,
  InputAdornment,
  ListItemText,
  Checkbox,
  OutlinedInput,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const SPECIALIZATIONS = [
  'Bodybuilding',
  'Weight Loss',
  'Strength Training',
  'CrossFit',
  'Cardio',
  'Yoga',
  'Pilates',
  'HIIT',
  'Nutrition',
  'Rehabilitation',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminCreateTrainer() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [trainerData, setTrainerData] = useState({
    userId: '',
    specialization: [],
    experience: 0,
    bio: '',
    certifications: [''],
    schedule: DAYS.map(day => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: day !== 'Sunday' // Default to available Mon-Sat
    })),
    profileImage: '',
  });

  useEffect(() => {
    // Fetch users who aren't already trainers
    const fetchAvailableUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/Back/auth/not-trainers');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchAvailableUsers();
  }, []);

  const handleSpecializationChange = (event) => {
    const {
      target: { value },
    } = event;
    setTrainerData({
      ...trainerData,
      specialization: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleCertificationChange = (index, value) => {
    const newCertifications = [...trainerData.certifications];
    newCertifications[index] = value;
    setTrainerData({ ...trainerData, certifications: newCertifications });
  };

  const addCertification = () => {
    setTrainerData({
      ...trainerData,
      certifications: [...trainerData.certifications, ''],
    });
  };

  const removeCertification = (index) => {
    const newCertifications = [...trainerData.certifications];
    newCertifications.splice(index, 1);
    setTrainerData({ ...trainerData, certifications: newCertifications });
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...trainerData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setTrainerData({ ...trainerData, schedule: newSchedule });
  };

  const handleCreateTrainer = async () => {
    try {
      // Validate form fields
      if (!trainerData.userId) {
        setError('Please select a user');
        return;
      }
      if (trainerData.specialization.length === 0) {
        setError('Please select at least one specialization');
        return;
      }
      if (trainerData.bio.trim() === '') {
        setError('Please provide a bio');
        return;
      }
   
      // Filter out empty certifications
      const filteredCertifications = trainerData.certifications.filter(cert => cert.trim() !== '');

      const response = await axios.post('/Back/trainers/create', {
        ...trainerData,
        certifications: filteredCertifications,
      });

      setSuccess('Trainer profile created successfully!');
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate('/admin/trainers');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trainer profile');
    }
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
            to="/admin/trainers"
          >
            Trainers Management
          </Link>
          <Typography color="text.primary">Add New Trainer</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Add New Trainer
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create a new trainer profile from an existing user
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 4 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {/* Add New Trainer Form */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 6,
          borderRadius: '12px',
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        <Grid container spacing={3}>
          {/* User Selection */}
   
            <Grid item xs={12}>
            <FormControl fullWidth>
                <InputLabel>Select User</InputLabel>
                <Select
                value={trainerData.userId}
                onChange={(e) => setTrainerData({ ...trainerData, userId: e.target.value })}
                label="Select User"
                >
                {loading ? (
                    <MenuItem disabled>Loading users...</MenuItem>
                ) : users.length > 0 ? (
                    users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                        {user.username} ({user.email}) - {user.role}
                    </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>No available users</MenuItem>
                )}
                </Select>
            </FormControl>
            
            {users.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                No eligible users found. Users must be registered with student, academic, or non-academic roles
                and not already assigned as trainers.
                </Alert>
            )}
            </Grid>

          {/* Specializations */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Specializations</InputLabel>
              <Select
                multiple
                value={trainerData.specialization}
                onChange={handleSpecializationChange}
                input={<OutlinedInput label="Specializations" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {SPECIALIZATIONS.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={trainerData.specialization.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Experience */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Experience (years)"
              type="number"
              value={trainerData.experience}
              onChange={(e) => setTrainerData({ ...trainerData, experience: Number(e.target.value) || 0 })}
              InputProps={{
                inputProps: { min: 0 },
              }}
              fullWidth
            />
          </Grid>

    

          {/* Bio */}
          <Grid item xs={12}>
            <TextField
              label="Bio"
              multiline
              rows={4}
              value={trainerData.bio}
              onChange={(e) => setTrainerData({ ...trainerData, bio: e.target.value })}
              fullWidth
            />
          </Grid>

          {/* Certifications */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Certifications
            </Typography>
            {trainerData.certifications.map((cert, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  label={`Certification ${index + 1}`}
                  value={cert}
                  onChange={(e) => handleCertificationChange(index, e.target.value)}
                  fullWidth
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeCertification(index)}
                  disabled={trainerData.certifications.length <= 1}
                >
                  Remove
                </Button>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addCertification}
            >
              Add Certification
            </Button>
          </Grid>

          {/* Profile Image */}
          <Grid item xs={12}>
            <TextField
              label="Profile Image URL"
              value={trainerData.profileImage}
              onChange={(e) => setTrainerData({ ...trainerData, profileImage: e.target.value })}
              fullWidth
              placeholder="https://example.com/trainer-image.jpg"
            />
          </Grid>

          {/* Schedule */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Weekly Schedule
            </Typography>
            <Grid container spacing={2}>
              {trainerData.schedule.map((day, index) => (
                <Grid item xs={12} sm={6} md={4} key={day.day}>
                  <Paper elevation={1} sx={{ p: 2, borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2">{day.day}</Typography>
                      <Checkbox
                        checked={day.isAvailable}
                        onChange={(e) => handleScheduleChange(index, 'isAvailable', e.target.checked)}
                        color="primary"
                      />
                    </Box>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={day.startTime}
                      onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                      fullWidth
                      disabled={!day.isAvailable}
                      sx={{ mb: 2 }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <TextField
                      label="End Time"
                      type="time"
                      value={day.endTime}
                      onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                      fullWidth
                      disabled={!day.isAvailable}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateTrainer}
              sx={{
                borderRadius: '8px',
                padding: '10px 24px',
                fontWeight: 'medium',
                boxShadow: 2,
              }}
              startIcon={<AddIcon />}
            >
              Create Trainer Profile
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/admin/trainers"
              sx={{
                ml: 2,
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