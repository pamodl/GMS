import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar, 
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Container,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { logoutUserStart, logoutUserSuccess, logoutUserFailure } from '../redux/user/userSlice';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';

// Define Figtree font style to be used throughout the component
const figtreeFont = {
  fontFamily: 'Figtree, sans-serif'
};

export default function Header() {
  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const currentUser = useSelector((state) => state.user.currentUser);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isTrainer, setIsTrainer] = useState(false);
  
  useEffect(() => {
    const checkTrainerStatus = async () => {
      if (currentUser && currentUser._id) {
        try {
          const response = await axios.get(`/Back/trainers/check/${currentUser._id}`);
          setIsTrainer(response.data.isTrainer);
        } catch (error) {
          console.error('Error checking trainer status:', error);
          setIsTrainer(false);
        }
      }
    };
    
    checkTrainerStatus();
  }, [currentUser]);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    dispatch(logoutUserStart());
    try {
      dispatch(logoutUserSuccess());
    } catch (error) {
      dispatch(logoutUserFailure(error.message));
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={toggleMobileDrawer}
    >
      <Box sx={{ width: 250, pt: 2, ...figtreeFont }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" px={2} mb={1}>
          <Typography variant="h6" color="primary" sx={figtreeFont}>GymTrac</Typography>
          <IconButton onClick={toggleMobileDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {currentUser && (
          <>
            <Box p={2} display="flex" alignItems="center">
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {currentUser.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={figtreeFont}>{currentUser.username}</Typography>
                <Typography variant="body2" color="text.secondary" sx={figtreeFont}>
                  {isTrainer ? 'Trainer' : currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        <List>
          {currentUser?.role === 'admin' ? (
            <>
              <ListItem button component={Link} to="/admin" selected={isActive('/admin')}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Admin Dashboard" sx={figtreeFont} />
              </ListItem>
              <ListItem button component={Link} to="/admin/manage-equipment" selected={isActive('/admin/manage-equipment')}>
                <ListItemIcon><FitnessCenterIcon /></ListItemIcon>
                <ListItemText primary="Equipment" sx={figtreeFont} />
              </ListItem>
              <ListItem button component={Link} to="/admin/trainers" selected={isActive('/admin/trainers')}>
                <ListItemIcon><SportsMartialArtsIcon /></ListItemIcon>
                <ListItemText primary="Trainers" sx={figtreeFont} />
              </ListItem>
            </>
          ) : isTrainer ? (
            <>
              <ListItem button component={Link} to="/trainer/dashboard" selected={isActive('/trainer/dashboard')}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Trainer Dashboard" sx={figtreeFont} />
              </ListItem>
              <ListItem button component={Link} to="/trainer/schedule" selected={isActive('/trainer/schedule')}>
                <ListItemIcon><CalendarMonthIcon /></ListItemIcon>
                <ListItemText primary="My Schedule" sx={figtreeFont} />
              </ListItem>
              <ListItem button component={Link} to="/" selected={isActive('/')}>
                <ListItemIcon><FitnessCenterIcon /></ListItemIcon>
                <ListItemText primary="Equipment" sx={figtreeFont} />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button component={Link} to="/" selected={isActive('/')}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard" sx={figtreeFont} />
              </ListItem>
              <ListItem button component={Link} to="/trainers" selected={isActive('/trainers')}>
                <ListItemIcon><SportsMartialArtsIcon /></ListItemIcon>
                <ListItemText primary="Trainers" sx={figtreeFont} />
              </ListItem>
              {currentUser && (
                <ListItem button component={Link} to="/notices" selected={isActive('/notices')}>
                  <ListItemIcon>
                    <Badge color="error" variant="dot" invisible={false}>
                      <NotificationsIcon />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText primary="Notices" sx={figtreeFont} />
                </ListItem>
              )}
            </>
          )}
          
          {currentUser ? (
            <>
              <ListItem button component={Link} to="/profile" selected={isActive('/profile')}>
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary="Profile" sx={figtreeFont} />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Log Out" sx={figtreeFont} />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button component={Link} to="/login" selected={isActive('/login')}>
                <ListItemIcon><LoginIcon /></ListItemIcon>
                <ListItemText primary="Log In" sx={figtreeFont} />
              </ListItem>
              <ListItem button component={Link} to="/signup" selected={isActive('/signup')}>
                <ListItemIcon><PersonAddIcon /></ListItemIcon>
                <ListItemText primary="Sign Up" sx={figtreeFont} />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{
          backgroundColor: 'white',
          color: 'text.primary',
          ...figtreeFont
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleMobileDrawer}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h5"
              component={Link}
              to={currentUser && currentUser.role === 'admin' ? '/admin' : '/'}
              sx={{ 
                flexGrow: { xs: 1, md: 0 },
                textDecoration: 'none', 
                color: 'primary.main',
                fontWeight: 'bold',
                mr: { md: 4 },
                ...figtreeFont
              }}
            >
              GymTrac
            </Typography>

            {!isMobile && (
              <Box sx={{ display: 'flex', flexGrow: 1, gap: 1, ...figtreeFont }}>
                {currentUser?.role === 'admin' ? (
                  <>
                    <Button 
                      color="inherit"
                      component={Link}
                      to="/admin"
                      sx={{ 
                        borderRadius: 2,
                        px: 2,
                        ...figtreeFont,
                        ...(isActive('/admin') && {
                          backgroundColor: 'action.selected'
                        })
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      color="inherit"
                      component={Link}
                      to="/admin/manage-equipment"
                      sx={{ 
                        borderRadius: 2,
                        px: 2,
                        ...figtreeFont,
                        ...(isActive('/admin/manage-equipment') && {
                          backgroundColor: 'action.selected'
                        })
                      }}
                    >
                      Equipment
                    </Button>
                    <Button 
                      color="inherit"
                      component={Link}
                      to="/admin/trainers"
                      sx={{ 
                        borderRadius: 2,
                        px: 2,
                        ...figtreeFont,
                        ...(isActive('/admin/trainers') && {
                          backgroundColor: 'action.selected'
                        })
                      }}
                    >
                      Trainers
                    </Button>
                  </>
                ) : isTrainer ? (
                  <>
                    <Button 
                      color="inherit"
                      component={Link}
                      to="/trainer/dashboard"
                      sx={{ 
                        borderRadius: 2,
                        px: 2,
                        ...figtreeFont,
                        ...(isActive('/trainer/dashboard') && {
                          backgroundColor: 'action.selected'
                        })
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      color="inherit"
                      component={Link}
                      to="/trainer/schedule"
                      sx={{ 
                        borderRadius: 2,
                        px: 2,
                        ...figtreeFont,
                        ...(isActive('/trainer/schedule') && {
                          backgroundColor: 'action.selected'
                        })
                      }}
                    >
                      My Schedule
                    </Button>
                    <Button 
                      color="inherit"
                      component={Link}
                      to="/"
                      sx={{ 
                        borderRadius: 2,
                        px: 2,
                        ...figtreeFont,
                        ...(isActive('/') && {
                          backgroundColor: 'action.selected'
                        })
                      }}
                    >
                      Equipment
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      color="inherit"
                      component={Link}
                      to="/"
                      sx={{ 
                        borderRadius: 2,
                        px: 2,
                        ...figtreeFont,
                        ...(isActive('/') && {
                          backgroundColor: 'action.selected'
                        })
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      color="inherit"
                      component={Link}
                      to="/trainers"
                      sx={{ 
                        borderRadius: 2,
                        px: 2,
                        ...figtreeFont,
                        ...(isActive('/trainers') && {
                          backgroundColor: 'action.selected'
                        })
                      }}
                    >
                      Trainers
                    </Button>
                  </>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...figtreeFont }}>
              {currentUser ? (
                <>
                  {currentUser.role !== 'admin' && !isMobile && (
                    <Tooltip title="View Notices">
                      <IconButton 
                        color="inherit" 
                        component={Link} 
                        to="/notices"
                        sx={{
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        <Badge color="error" variant="dot" invisible={false}>
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  )}
                  {!isMobile && (
                    <>
                      <Button
                        color="inherit"
                        onClick={handleUserMenuOpen}
                        startIcon={
                          <Avatar
                            sx={{ width: 30, height: 30, bgcolor: 'primary.main' }}
                          >
                            {currentUser.username.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        endIcon={null}
                        sx={figtreeFont}
                      >
                        {currentUser.username}
                      </Button>
                      <Menu
                        anchorEl={userMenuAnchor}
                        open={Boolean(userMenuAnchor)}
                        onClose={handleUserMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                          elevation: 3,
                          sx: { mt: 1, width: 200, ...figtreeFont }
                        }}
                      >
                        <MenuItem 
                          component={Link} 
                          to="/profile" 
                          onClick={handleUserMenuClose}
                          sx={{ gap: 2, ...figtreeFont }}
                        >
                          <AccountCircleIcon fontSize="small" />
                          Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ gap: 2, ...figtreeFont }}>
                          <LogoutIcon fontSize="small" />
                          Log Out
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </>
              ) : (
                !isMobile && (
                  <>
                    <Button 
                      color="primary"
                      variant="outlined"
                      component={Link} 
                      to="/login"
                      startIcon={<LoginIcon />}
                      sx={{ borderRadius: 2, ...figtreeFont }}
                    >
                      Log In
                    </Button>
                    <Button 
                      color="primary"
                      variant="contained"
                      component={Link} 
                      to="/signup"
                      startIcon={<PersonAddIcon />}
                      sx={{ borderRadius: 2, ...figtreeFont }}
                    >
                      Sign Up
                    </Button>
                  </>
                )
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {renderMobileDrawer()}
    </>
  );
}