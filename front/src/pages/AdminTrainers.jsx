import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Button, CircularProgress, Alert, Paper, 
  Container, List, ListItem, ListItemText, Chip, Divider,
  Avatar, Dialog, DialogActions, DialogContent, DialogTitle
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [hasActiveSessions, setHasActiveSessions] = useState(false);
  const [activeSessionCount, setActiveSessionCount] = useState(0);

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

  const handleDeleteClick = async (trainer) => {
    setTrainerToDelete(trainer);
    
    try {
      // Check if the trainer has active sessions
      const sessionsResponse = await axios.get(`/Back/trainers/sessions/${trainer._id}`);
      const activeSessions = sessionsResponse.data.filter(
        session => session.status === 'scheduled' || session.status === 'pending'
      );
      
      setHasActiveSessions(activeSessions.length > 0);
      setActiveSessionCount(activeSessions.length);
    } catch (err) {
      console.error('Error checking sessions:', err);
    } finally {
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTrainerToDelete(null);
    setHasActiveSessions(false);
    setActiveSessionCount(0);
  };

  const handleDeleteConfirm = async () => {
    if (!trainerToDelete) return;

    try {
      setDeleteInProgress(true);
      
      if (hasActiveSessions) {
        // First cancel all active sessions
        await axios.post(`/Back/trainers/cancel-all-sessions/${trainerToDelete._id}`);
      }
      
      // Then delete the trainer
      await axios.delete(`/Back/trainers/${trainerToDelete._id}`);
      
      // Update trainer list
      setTrainers(trainers.filter(t => t._id !== trainerToDelete._id));
      setDeleteDialogOpen(false);
      setTrainerToDelete(null);
      
      const message = hasActiveSessions
        ? `Trainer ${trainerToDelete.userId?.username || 'Unknown'} has been deleted and ${activeSessionCount} active sessions were cancelled.`
        : `Trainer ${trainerToDelete.userId?.username || 'Unknown'} has been deleted successfully.`;
      
      setActionStatus({
        message,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting trainer:', err);
      setActionStatus({
        message: err.response?.data?.message || 'Failed to delete trainer. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleteInProgress(false);
      setHasActiveSessions(false);
      setActiveSessionCount(0);
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
                      </Box>
                    }
                    secondary={
                      <Box sx={{ color: 'text.secondary' }}>
                        <Typography variant="body2" component="span">
                          <strong>Specializations:</strong> {trainer.specialization?.join(', ') || 'None'}
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
                      onClick={() => handleDeleteClick(trainer)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        aria-labelledby="delete-trainer-dialog-title"
      >
        <DialogTitle id="delete-trainer-dialog-title">
          Confirm Delete Trainer
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to delete the trainer profile for{' '}
            <strong>{trainerToDelete?.userId?.username || 'Unknown'}</strong>?
            This action cannot be undone.
          </Typography>
          
          {hasActiveSessions && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> This trainer has {activeSessionCount} active or pending sessions. 
                Deleting this trainer will automatically cancel all these sessions and notify the affected clients.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteInProgress}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteInProgress}
          >
            {deleteInProgress ? 'Deleting...' : hasActiveSessions ? 'Delete and Cancel Sessions' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}