import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

export default function AdminReturns() {
  const [pendingReturns, setPendingReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [approving, setApproving] = useState(null); // Track which return is being approved

  useEffect(() => {
    const fetchPendingReturns = async () => {
      try {
        const response = await axios.get('/Back/equipment/pending-returns'); // Fetch pending returns
        setPendingReturns(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPendingReturns();
  }, []);

  const handleApproveReturn = async (itemId, borrowId) => {
    console.log('Approving return:', { itemId, borrowId }); // Debugging log
  
    try {
      const response = await axios.post('/Back/equipment/approve-return', {
        itemId,
        borrowId,
      });
  
      console.log('Approve response:', response.data); // Debugging log
      setSuccess(response.data.message);
  
      // Remove the approved return from the pending list
      setPendingReturns((prev) =>
        prev.map((item) => ({
          ...item,
          borrowedBy: item.borrowedBy.filter((borrow) => borrow._id !== borrowId),
        })).filter((item) => item.borrowedBy.length > 0)
      );
    } catch (error) {
      console.error('Approve error:', error.response?.data?.message || 'Failed to approve return');
      setError(error.response?.data?.message || 'Failed to approve return');
    }
  };
  
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin - Pending Returns
      </Typography>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : pendingReturns.length === 0 ? (
        <Typography variant="body1">No pending returns.</Typography>
      ) : (
        <List>
          {pendingReturns.map((item) =>
            item.borrowedBy.map((borrow) => (
              <ListItem key={borrow._id}>
                <ListItemText
                  primary={item.name}
                  secondary={`Borrowed by User ID: ${borrow.userId} - Quantity: ${borrow.quantity} - Borrowed on: ${new Date(
                    borrow.borrowedAt
                  ).toLocaleString()} - Returned on: ${new Date(borrow.returnedAt).toLocaleString()}`}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleApproveReturn(item._id, borrow._id)} // Pass both itemId and borrowId
                  disabled={approving === borrow._id} // Disable the button if it's being approved
                  sx={{ marginLeft: 2 }}
                >
                  {approving === borrow._id ? 'Approving...' : 'Approve Return'}
                </Button>
              </ListItem>
            ))
          )}
        </List>
      )}
    </Box>
  );
}