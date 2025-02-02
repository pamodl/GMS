import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, Box, Button } from '@mui/material';
import { logoutUserStart, logoutUserSuccess, logoutUserFailure } from '../redux/user/userSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

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
        <strong>Student Registration Number:</strong> {currentUser.studentRegNumber}
      </Typography>
      <Button variant="contained" color="primary" onClick={handleLogout} sx={{ marginTop: 2 }}>
        Log Out
      </Button>
    </Box>
  );
}