import React, { useState, useEffect } from 'react';
import { Typography, Box, List, ListItem, ListItemText, CircularProgress, Alert, Button } from '@mui/material';
import axios from 'axios';

export default function AdminCurrentBorrowedItems() {
  const [currentBorrowedItems, setCurrentBorrowedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCurrentBorrowedItems = async () => {
      try {
        const response = await axios.get('/Back/equipment/current-borrowed-items'); // Fetch currently borrowed items
        setCurrentBorrowedItems(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCurrentBorrowedItems();
  }, []);

  const handleSendNotice = async (userId, itemId) => {
    try {
      const response = await axios.post('/Back/equipment/send-return-notice', { userId, itemId });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notice');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin - Currently Borrowed Items
      </Typography>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : currentBorrowedItems.length === 0 ? (
        <Typography variant="body1">No currently borrowed items found.</Typography>
      ) : (
        <List>
          {currentBorrowedItems.map((item) => (
            <Box key={item.itemId} sx={{ marginBottom: 4 }}>
              <Typography variant="h6">{item.itemName} (Category: {item.category})</Typography>
              <List>
                {item.borrowedBy.map((borrow) => {
                  const borrowedDurationMs = Date.now() - new Date(borrow.borrowedAt).getTime();
                  const borrowedDays = Math.floor(borrowedDurationMs / (1000 * 60 * 60 * 24));
                  const borrowedHours = Math.floor((borrowedDurationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const borrowedMinutes = Math.floor((borrowedDurationMs % (1000 * 60 * 60)) / (1000 * 60));

                  return (
                    <ListItem key={borrow.userId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <ListItemText
                        primary={`Borrowed by: ${borrow.username} (${borrow.email})`}
                        secondary={`Quantity: ${borrow.quantity} | Borrowed At: ${new Date(
                          borrow.borrowedAt
                        ).toLocaleString()} | Borrowed For: ${borrowedDays} days, ${borrowedHours} hours, and ${borrowedMinutes} minutes`}
                      />
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleSendNotice(borrow.userId, item.itemId)}
                      >
                        Send Notice
                      </Button>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
}