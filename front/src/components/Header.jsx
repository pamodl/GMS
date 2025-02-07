import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { logoutUserStart, logoutUserSuccess, logoutUserFailure } from '../redux/user/userSlice';

export default function Header() {
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

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          GymTrac
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/manage-equipment">
            Equipment
          </Button>
          {currentUser ? (
            <>
              <Typography
                variant="body1"
                component={Link}
                to="/profile"
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                {currentUser.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Log In
              </Button>
              <Button color="inherit" component={Link} to="/signup">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}