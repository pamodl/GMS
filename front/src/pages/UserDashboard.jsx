import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Box, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

export default function UserDashboard() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBorrowedItems = async () => {
      if (!currentUser || !currentUser._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/Back/auth/${currentUser._id}/borrowed-items`);
        setBorrowedItems(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBorrowedItems();
  }, [currentUser]);

  if (!currentUser) {
    return <Typography variant="h6">No user is logged in.</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Dashboard
      </Typography>
      <Typography variant="body1">
        <strong>Username:</strong> {currentUser.username}
      </Typography>
      <Typography variant="body1">
        <strong>Email:</strong> {currentUser.email}
      </Typography>
      <Typography variant="body1">
        <strong>Registration Number:</strong> {currentUser.regNumber}
      </Typography>
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6" gutterBottom>
          Borrowed Items
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : borrowedItems.length === 0 ? (
          <Typography variant="body1">No borrowed items.</Typography>
        ) : (
          <List>
            {borrowedItems.map((item) =>
              item.borrowedBy.map((borrow) => (
                <ListItem key={borrow._id}>
                  <ListItemText
                    primary={item.name}
                    secondary={`Borrowed on: ${new Date(borrow.borrowedAt).toLocaleString()}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        )}
      </Box>
    </Box>
  );
}