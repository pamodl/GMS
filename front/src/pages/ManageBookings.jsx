import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Box, List, ListItem, ListItemText, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

export default function ManageBookings() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('/Back/bookings');
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, status) => {
    setLoading(true);
    try {
      await axios.put('/Back/bookings/update-status', { bookingId, status });
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId ? { ...booking, status } : booking
        )
      );
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Bookings
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {bookings.map((booking) => (
            <ListItem key={booking._id}>
              <ListItemText
                primary={`${booking.equipment.name} - ${booking.user.username}`}
                secondary={`Requested on: ${new Date(booking.requestedAt).toLocaleString()} - Quantity: ${booking.quantity} - Status: ${booking.status}`}
              />
              {booking.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdateStatus(booking._id, 'approved')}
                    sx={{ marginRight: 2 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                  >
                    Reject
                  </Button>
                </>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}