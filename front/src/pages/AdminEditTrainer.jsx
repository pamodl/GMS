import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Grid, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, OutlinedInput, 
  Box, Chip, Checkbox, ListItemText, CircularProgress, Alert,
  FormHelperText
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const SPECIALIZATIONS = [
  'Weight Training', 
  'Cardio', 
  'Yoga', 
  'Pilates', 
  'CrossFit', 
  'Nutrition', 
  'Rehabilitation',
  'Sports Conditioning'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminEditTrainer() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trainerData, setTrainerData] = useState({
    userId: '',
    specialization: [],
    experience: 0,
    bio: '',
    certifications: [''],
    profileImage: '',
    schedule: DAYS.map(day => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: day !== 'Sunday' // Default available Mon-Sat
    }))
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/Back/trainers/${id}`);
        
        if (response.data) {
          // Make sure all required fields are present
          const formattedData = {
            ...trainerData,
            ...response.data,
            // Ensure schedule has all days
            schedule: DAYS.map(day => {
              const existingDay = response.data.schedule?.find(d => d.day === day);
              return existingDay || {
                day,
                startTime: '09:00',
                endTime: '17:00',
                isAvailable: day !== 'Sunday'
              };
            }),
            // Ensure certifications is an array
            certifications: Array.isArray(response.data.certifications) && response.data.certifications.length 
              ? response.data.certifications 
              : ['']
          };
          
          setTrainerData(formattedData);
        } else {
          setError('Failed to load trainer data');
        }
      } catch (err) {
        console.error('Error fetching trainer:', err);
        setError('Failed to load trainer data. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrainer();
  }, [id]);
  
  const handleSpecializationChange = (event) => {
    const { value } = event.target;
    setTrainerData({ ...trainerData, specialization: value });
  };
  
  const handleCertificationChange = (index, value) => {
    const newCertifications = [...trainerData.certifications];
    newCertifications[index] = value;
    setTrainerData({ ...trainerData, certifications: newCertifications });
  };
  
  const addCertification = () => {
    setTrainerData({
      ...trainerData,
      certifications: [...trainerData.certifications, '']
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
  
  const handleUpdateTrainer = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Filter out empty certifications
      const cleanedData = {
        ...trainerData,
        certifications: trainerData.certifications.filter(cert => cert.trim() !== '')
      };
      
      const response = await axios.put(`/Back/trainers/${id}`, cleanedData);
      
      setSuccess('Trainer profile updated successfully!');
      setTimeout(() => {
        navigate('/admin/trainers');
      }, 1500);
    } catch (err) {
      console.error('Error updating trainer:', err);
      setError('Failed to update trainer. ' + (err.response?.data?.message || err.message));
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
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: '12px' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Edit Trainer Profile
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Trainer ID"
              value={id}
              disabled
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Username"
              value={trainerData.userId?.username || ''}
              disabled
              fullWidth
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="specialization-label">Specializations</InputLabel>
              <Select
                labelId="specialization-label"
                multiple
                value={trainerData.specialization || []}
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
                    <Checkbox checked={(trainerData.specialization || []).indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Experience (years)"
              type="number"
              value={trainerData.experience || 0}
              onChange={(e) => setTrainerData({ ...trainerData, experience: Number(e.target.value) || 0 })}
              InputProps={{
                inputProps: { min: 0 },
              }}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Profile Image URL"
              value={trainerData.profileImage || ''}
              onChange={(e) => setTrainerData({ ...trainerData, profileImage: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Bio"
              multiline
              rows={4}
              value={trainerData.bio || ''}
              onChange={(e) => setTrainerData({ ...trainerData, bio: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Certifications
            </Typography>
            {(trainerData.certifications || ['']).map((cert, index) => (
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
                  disabled={(trainerData.certifications || []).length <= 1}
                >
                  Remove
                </Button>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={addCertification}
              sx={{ mb: 3 }}
            >
              Add Certification
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Weekly Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Set the trainer's availability for each day of the week.
            </Typography>
            <Grid container spacing={2}>
              {trainerData.schedule.map((day, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={day.day}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">{day.day}</Typography>
                      <FormControl>
                        <FormHelperText>Available</FormHelperText>
                        <Checkbox
                          checked={day.isAvailable}
                          onChange={(e) => handleScheduleChange(index, 'isAvailable', e.target.checked)}
                          color="primary"
                        />
                      </FormControl>
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

          <Grid item xs={12} sx={{ mt: 3, display: 'flex' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateTrainer}
              disabled={saving}
              sx={{ minWidth: '150px' }}
            >
              {saving ? 'Saving...' : 'Update Trainer'}
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/admin/trainers"
              sx={{ ml: 2 }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}