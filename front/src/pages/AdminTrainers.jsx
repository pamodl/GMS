import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Button, CircularProgress, Alert, Paper, 
  Container, List, ListItem, ListItemText, Chip, Divider,
  Avatar, Rating
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function AdminTrainersList() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: null, severity: null });

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/Back/trainers');
      
      if (Array.isArray(response.data)) {
        setTrainers(response.data);
      } else {
        setTrainers([]);
        setError('Received invalid data format from server');
      }
    } catch (err) {
      console.error('Error fetching trainers:', err.response || err);
      setError(err.response?.data?.message || 'Failed to fetch trainers. Please try again.');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">Trainers Management</Typography>
          <Box>
            <Button 
              variant="outlined" 
              onClick={fetchTrainers} 
              sx={{ mr: 2, borderRadius: '8px' }}
            >
              Refresh
            </Button>
            <Button 
              component={Link} 
              to="/admin/trainers/create"
              variant="contained" 
              sx={{ borderRadius: '8px' }}
              startIcon={<PersonAddIcon />}
            >
              Add New Trainer
            </Button>
          </Box>
        </Box>
      </Paper>

      {actionStatus.message && (
        <Alert 
          severity={actionStatus.severity} 
          sx={{ mb: 3 }}
          onClose={() => setActionStatus({ message: null, severity: null })}
        >
          {actionStatus.message}
        </Alert>
      )}
      
      {error && (
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
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : trainers.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <Typography variant="body1" color="text.secondary">No trainers found.</Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/admin/trainers/create"
            sx={{ mt: 2, borderRadius: '8px' }}
            startIcon={<PersonAddIcon />}
          >
            Add Your First Trainer
          </Button>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <List disablePadding>
            {trainers.map((trainer, index) => (
              <React.Fragment key={trainer._id}>
                <ListItem 
                  sx={{ 
                    py: 3, 
                    px: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                  }}
                >
                  <Avatar 
                    src={trainer.profileImage} 
                    alt={trainer.userId?.username} 
                    sx={{ width: 60, height: 60, mr: 2, mb: { xs: 2, sm: 0 } }}
                  />
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h6" fontWeight="medium" sx={{ mr: 2 }}>
                          {trainer.userId?.username || 'Unknown User'}
                        </Typography>
                        <Rating value={trainer.rating} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({trainer.reviewCount} reviews)
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ color: 'text.secondary' }}>
                        <Typography variant="body2" component="span">
                          <strong>Specializations:</strong> {trainer.specialization.join(', ')}
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ ml: 3 }}>
                          <strong>Rate:</strong> ${trainer.hourlyRate}/hour
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ ml: 3 }}>
                          <strong>Experience:</strong> {trainer.experience} years
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: { xs: 2, sm: 0 } }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      component={Link}
                      to={`/admin/trainers/edit/${trainer._id}`}
                      sx={{ borderRadius: '8px' }}
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        // Handle delete functionality
                      }}
                      sx={{ borderRadius: '8px' }}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
                {index < trainers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}