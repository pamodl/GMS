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
  const [success, setSuccess] = useState(null);

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

  const handleReturn = async (itemId, borrowId) => {
    console.log('Returning item:', { itemId, borrowId, userId: currentUser._id }); // Debugging log

    try {
      const response = await axios.post('/Back/equipment/return', {
        itemId,
        borrowId, // Pass the borrowId to the backend
        userId: currentUser._id,
      });

      console.log('Return response:', response.data); // Debugging log
      setSuccess(response.data.message);

      // Update the borrowedItems state
      const updatedBorrowedItems = borrowedItems.map((item) => {
        if (item._id === itemId) {
          item.borrowedBy = item.borrowedBy.map((borrow) => {
            if (borrow._id === borrowId) {
              return { ...borrow, returnedAt: new Date(), isApproved: false }; // Mark as pending approval
            }
            return borrow;
          });
        }
        return item;
      });

      setBorrowedItems(updatedBorrowedItems);
    } catch (error) {
      console.error('Return error:', error.response?.data?.message || 'Failed to return equipment');
      setError(error.response?.data?.message || 'Failed to return equipment');
    }
  };

  const handleLogout = async () => {
    dispatch(logoutUserStart());
    try {
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
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {loading ? (
          <CircularProgress />
        ) : borrowedItems.length === 0 ? (
          <Typography variant="body1">No borrowed items.</Typography>
        ) : (
          <List>
            {borrowedItems.map((item) =>
              item.borrowedBy.map((borrow) => (
                <ListItem key={borrow._id}>
                  <ListItemText
                    primary={item.name}
                    secondary={`Borrowed on: ${new Date(borrow.borrowedAt).toLocaleString()} - Quantity: ${borrow.quantity} ${
                      borrow.returnedAt
                        ? borrow.isApproved
                          ? ` - Returned on: ${new Date(borrow.returnedAt).toLocaleString()} (Approved)`
                          : ` - Returned on: ${new Date(borrow.returnedAt).toLocaleString()} (Pending Approval)`
                        : ''
                    }`}
                  />
                  {!borrow.returnedAt && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleReturn(item._id, borrow._id)} // Pass both itemId and borrowId
                      sx={{ marginLeft: 2 }}
                    >
                      Return
                    </Button>
                  )}
                </ListItem>
              ))
            )}
          </List>
        )}
      </Box>
    </Box>
  );
}