import React, { useState, useEffect } from 'react';
import { Typography, Box, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

export default function AdminBorrowedItems() {
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBorrowedItems = async () => {
      try {
        const response = await axios.get('/Back/equipment/borrowed-items'); // Fetch borrowed items
        setBorrowedItems(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBorrowedItems();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin - Borrowed Items
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : borrowedItems.length === 0 ? (
        <Typography variant="body1">No borrowed items found.</Typography>
      ) : (
        <List>
          {borrowedItems.map((item) => (
            <Box key={item.itemId} sx={{ marginBottom: 4 }}>
              <Typography variant="h6">{item.itemName} (Category: {item.category})</Typography>
              <List>
                {item.borrowedBy.map((borrow) => (
                  <ListItem key={borrow.userId}>
                    <ListItemText
                      primary={`Borrowed by: ${borrow.username} (${borrow.email})`}
                      secondary={`Quantity: ${borrow.quantity} | Borrowed At: ${new Date(
                        borrow.borrowedAt
                      ).toLocaleString()} | Returned At: ${
                        borrow.returnedAt ? new Date(borrow.returnedAt).toLocaleString() : 'Not yet returned'
                      } | Approved: ${borrow.isApproved ? 'Yes' : 'No'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
}