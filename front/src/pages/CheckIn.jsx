import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut } from '../redux/checkin/checkinActions';
import { Card, CardContent, Typography, Button, Box, Alert } from '@mui/material';

export default function CheckInOut() {
  const { currentUser } = useSelector((state) => state.user);
  const { isCheckedIn, lastCheckIn, lastCheckOut, loading, error } = useSelector((state) => state.checkin);
  const dispatch = useDispatch();

  const handleCheckIn = () => {
    if (currentUser && currentUser._id) {
      dispatch(checkIn(currentUser._id));
    } else {
      console.error('currentUser ID is not available');
    }
  };

  const handleCheckOut = () => {
    if (currentUser && currentUser._id) {
      dispatch(checkOut(currentUser._id));
    } else {
      console.error('currentUser ID is not available');
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