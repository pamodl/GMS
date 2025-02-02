import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, Typography, Button, Box, Alert } from '@mui/material';
import axios from 'axios';

export default function CheckInOut() {
  const { currentUser } = useSelector((state) => state.user);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [lastCheckOut, setLastCheckOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  useEffect(() => {
    const fetchActiveUsersCount = async () => {
      try {
        const response = await axios.get('/Back/checkinout/active-users-count');
        setActiveUsersCount(response.data.count);
      } catch (err) {
        console.error('Failed to fetch active users count:', err);
      }
    };

    const fetchCheckInStatus = async () => {
      if (currentUser && currentUser._id) {
        try {
          const response = await axios.get(`/Back/checkinout/status/${currentUser._id}`);
          setIsCheckedIn(response.data.isCheckedIn);
          setLastCheckIn(response.data.lastCheckIn || null);
          setLastCheckOut(response.data.lastCheckOut || null);
        } catch (err) {
          console.error('Failed to fetch check-in status:', err);
        }
      }
    };

    fetchActiveUsersCount();
    fetchCheckInStatus();
  }, [currentUser]);

  const handleCheckIn = async () => {
    if (!currentUser || !currentUser._id) {
      console.error('currentUser ID is not available');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/Back/checkinout/checkin', { userId: currentUser._id });
      setIsCheckedIn(true);
      setLastCheckIn(response.data.timestamp);
      setError(null);
      // Fetch the updated active users count and check-in status
      fetchActiveUsersCount();
      fetchCheckInStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentUser || !currentUser._id) {
      console.error('currentUser ID is not available');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/Back/checkinout/checkout', { userId: currentUser._id });
      setIsCheckedIn(false);
      setLastCheckOut(response.data.timestamp);
      setError(null);
      // Fetch the updated active users count and check-in status
      fetchActiveUsersCount();
      fetchCheckInStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Card sx={{ maxWidth: 400, width: '100%', padding: 2 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Check In/Out
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body1" component="div" gutterBottom>
            Checked In: {isCheckedIn ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            Last Check In: {formatDate(lastCheckIn)}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            Last Check Out: {formatDate(lastCheckOut)}
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            Active Users: {activeUsersCount}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleCheckIn} disabled={loading || isCheckedIn}>
              Check In
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCheckOut} disabled={loading || !isCheckedIn}>
              Check Out
            </Button>
          </Box>
          {loading && <Typography variant="body2" color="textSecondary" sx={{ marginTop: 2 }}>Processing...</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
}