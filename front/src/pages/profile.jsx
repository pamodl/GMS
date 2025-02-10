import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, Box, Button, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { logoutUserStart, logoutUserSuccess, logoutUserFailure } from '../redux/user/userSlice';
import axios from 'axios';

export default function Profile() {
  const dispatch = useDispatch();
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

  const handleLogout = async () => {
    dispatch(logoutUserStart());
    try {
      // Perform any necessary logout logic here, such as API calls
      // For example:
      // await api.logout();
      dispatch(logoutUserSuccess());
    } catch (error) {
      dispatch(logoutUserFailure(error.message));
    }
  };

  if (!currentUser) {
    return <Typography variant="h6">No user is logged in.</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
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
      <Button variant="contained" color="primary" onClick={handleLogout} sx={{ marginTop: 2 }}>
        Log Out
      </Button>
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
            {borrowedItems.map((item) => (
              <ListItem key={item._id}>
                <ListItemText
                  primary={item.name}
                  secondary={`Borrowed on: ${new Date(item.borrowedBy[0].borrowedAt).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}