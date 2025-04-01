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

  const handleApproveReturn = async (itemId, userId) => {
    console.log('Approving return:', { itemId, userId }); // Debugging log
    setApproving(`${itemId}-${userId}`); // Set the approving state to disable the button

    try {
      const response = await axios.post('/Back/equipment/approve-return', {
        itemId,
        userId,
      });

      console.log('Approve response:', response.data); // Debugging log
      setSuccess(response.data.message);

      // Remove the approved return from the pending list
      setPendingReturns((prev) =>
        prev.filter((group) => !(group.itemId === itemId && group.userId === userId))
      );
    } catch (error) {
      console.error('Approve error:', error.response?.data?.message || 'Failed to approve return');
      setError(error.response?.data?.message || 'Failed to approve return');
    } finally {
      setApproving(null); // Reset the approving state
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
          {pendingReturns.map((group) => (
            <ListItem key={`${group.itemId}-${group.userId}`}>
              <ListItemText
                primary={group.itemName}
                secondary={`Borrowed by User ID: ${group.userId} - Total Quantity: ${group.totalQuantity}`}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleApproveReturn(group.itemId, group.userId)} // Pass itemId and userId
                disabled={approving === `${group.itemId}-${group.userId}`} // Disable the button if it's being approved
                sx={{ marginLeft: 2 }}
              >
                {approving === `${group.itemId}-${group.userId}` ? 'Approving...' : 'Approve Return'}
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}