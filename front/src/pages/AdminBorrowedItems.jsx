import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress, 
  Alert, 
  Button,
  Paper,
  Container,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import axios from 'axios';

export default function AdminBorrowedItems() {
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: null, severity: null });

  useEffect(() => {
    fetchBorrowedItems();
  }, []);
  
  const fetchBorrowedItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/Back/equipment/borrowed-items');
      setBorrowedItems(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch borrowed items');
      console.error('Error fetching borrowed items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (itemId, borrowId) => {
    try {
      setActionStatus({ message: null, severity: null });
      await axios.post('/Back/equipment/approve-return', { itemId, borrowId });
      
      // Update local state to reflect the change
      const updatedItems = borrowedItems.map(item => {
        if (item._id === itemId) {
          return {
            ...item,
            borrowedBy: item.borrowedBy.map(borrow => {
              if (borrow._id === borrowId) {
                return { ...borrow, isApproved: true };
              }
              return borrow;
            })
          };
        }
        return item;
      });
      
      setBorrowedItems(updatedItems);
      setActionStatus({ 
        message: 'Return approval successful!', 
        severity: 'success' 
      });
    } catch (err) {
      setActionStatus({ 
        message: err.response?.data?.message || 'Failed to approve return', 
        severity: 'error' 
      });
      console.error('Error approving return:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Admin - Borrowed Items
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all equipment currently borrowed by users
        </Typography>
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
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : borrowedItems.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <Typography variant="body1">No borrowed items found.</Typography>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <List disablePadding>
            {borrowedItems.map((item, itemIndex) => (
              <React.Fragment key={item._id || itemIndex}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: itemIndex === 0 ? '12px 12px 0 0' : 0
                  }}
                >
                  <Typography variant="h6">
                    {item.name} <span style={{ opacity: 0.8 }}>(Category: {item.category})</span>
                  </Typography>
                </Paper>
                
                {item.borrowedBy && item.borrowedBy.length > 0 ? (
                  <List disablePadding>
                    {item.borrowedBy.map((borrow, borrowIndex) => (
                      <React.Fragment key={borrow._id || `${item._id}-${borrowIndex}`}>
                        <ListItem 
                          sx={{ 
                            py: 2, 
                            px: 3,
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  Borrowed by: {borrow.username || 'Unknown User'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {borrow.email || 'No email provided'}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="body2" component="span">
                                    <strong>Quantity:</strong> {borrow.quantity || 1}
                                  </Typography>
                                  <br />
                                  <Typography variant="body2" component="span">
                                    <strong>Borrowed:</strong> {new Date(borrow.borrowedAt).toLocaleString()}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="body2" component="span">
                                    <strong>Status:</strong>{' '}
                                    <Chip 
                                      size="small"
                                      label={
                                        borrow.returnedAt 
                                          ? (borrow.isApproved ? 'Returned & Approved' : 'Return Pending Approval') 
                                          : 'Borrowed'
                                      }
                                      color={
                                        borrow.returnedAt 
                                          ? (borrow.isApproved ? 'success' : 'warning') 
                                          : 'info'
                                      }
                                      variant="outlined"
                                      sx={{ borderRadius: '4px' }}
                                    />
                                  </Typography>
                                  {borrow.returnedAt && (
                                    <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                      <strong>Returned:</strong> {new Date(borrow.returnedAt).toLocaleString()}
                                    </Typography>
                                  )}
                                </Grid>
                              </Grid>
                            }
                            sx={{ mb: { xs: 2, sm: 0 } }}
                          />
                          {borrow.returnedAt && !borrow.isApproved && (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleApproveReturn(item._id, borrow._id)}
                              sx={{ 
                                ml: { xs: 0, sm: 2 },
                                borderRadius: '8px',
                                boxShadow: 2,
                                '&:hover': { boxShadow: 3 }
                              }}
                            >
                              Approve Return
                            </Button>
                          )}
                        </ListItem>
                        {borrowIndex < item.borrowedBy.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">No active borrows for this item.</Typography>
                  </Box>
                )}
                
                {itemIndex < borrowedItems.length - 1 && <Divider sx={{ my: 2 }} />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}