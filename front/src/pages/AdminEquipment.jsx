import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Alert, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function AdminEquipmentList() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: null, severity: null });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Make sure the API endpoint is correct
      const response = await axios.get('/Back/equipment/all');
      
      console.log('Equipment data received:', response.data); // Debug log
      
      if (Array.isArray(response.data)) {
        setEquipment(response.data);
      } else {
        // Handle case where response isn't an array
        console.error('Unexpected response format:', response.data);
        setEquipment([]);
        setError('Received invalid data format from server');
      }
    } catch (err) {
      console.error('Error fetching equipment:', err.response || err);
      setError(err.response?.data?.message || 'Failed to fetch equipment. Please try again.');
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (equipment) => {
    setEquipmentToDelete(equipment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEquipmentToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!equipmentToDelete) return;

    // Check if equipment has borrowed items
    if (equipmentToDelete.borrowedBy && equipmentToDelete.borrowedBy.length > 0) {
      setActionStatus({
        message: 'Cannot delete equipment that has active borrowed items. Please wait for all items to be returned.',
        severity: 'error'
      });
      setDeleteDialogOpen(false);
      setEquipmentToDelete(null);
      return;
    }

    try {
      setDeleteDialogOpen(false);
      setLoading(true);
      
      await axios.delete(`/Back/equipment/${equipmentToDelete._id}`);
      
      setEquipment(equipment.filter((item) => item._id !== equipmentToDelete._id));
      setActionStatus({
        message: `${equipmentToDelete.name} has been successfully deleted.`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Delete error:', err.response || err);
      setActionStatus({
        message: err.response?.data?.message || 'Failed to delete equipment',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setEquipmentToDelete(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">Equipment Management</Typography>
          <Box>
            <Button 
              variant="outlined" 
              onClick={fetchEquipment} 
              sx={{ mr: 2, borderRadius: '8px' }}
            >
              Refresh
            </Button>
            <Button 
              component={Link} 
              to="/admin/equipment/create"
              variant="contained" 
              sx={{ borderRadius: '8px' }}
            >
              Add New Equipment
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
            <Button color="inherit" size="small" onClick={fetchEquipment}>
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
      ) : equipment.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <Typography variant="body1" color="text.secondary">No equipment found.</Typography>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <List disablePadding>
            {equipment.map((item, index) => (
              <React.Fragment key={item._id}>
                <ListItem 
                  sx={{ 
                    py: 3, 
                    px: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" fontWeight="medium" sx={{ mr: 2 }}>
                          {item.name}
                        </Typography>
                        <Chip 
                          label={item.category} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {item.borrowedBy && item.borrowedBy.length > 0 && (
                          <Chip 
                            label={`${item.borrowedBy.length} borrowed`}
                            size="small"
                            color="warning"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ color: 'text.secondary' }}>
                        <Typography variant="body2" component="span">
                          <strong>Total Quantity:</strong> {item.quantity}
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ ml: 3 }}>
                          <strong>Available:</strong> {item.available}
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
                      to={`/admin/edit-equipment/${item._id}`}
                      sx={{ borderRadius: '8px' }}
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteClick(item)}
                      sx={{ borderRadius: '8px' }}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
                {index < equipment.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {equipmentToDelete?.name}?
            
            {equipmentToDelete?.borrowedBy && equipmentToDelete.borrowedBy.length > 0 && (
              <Box sx={{ mt: 2, color: 'error.main', fontWeight: 'bold' }}>
                Warning: This equipment has {equipmentToDelete.borrowedBy.length} borrowed items.
                Deleting it will cause data inconsistencies.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}