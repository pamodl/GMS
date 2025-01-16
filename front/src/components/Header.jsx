import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import logo1 from '../assets/logo1.png';
const Header = () => {
    return (
        <AppBar position="static">
            <Toolbar>
            
                <Typography 
                    variant="h6" 
                    component={Link} 
                    to="/" 
                    sx={{ 
                        flexGrow: 1, 
                        textDecoration: 'none', 
                        color: 'inherit' 
                    }}
                >
                    <img 
                        src={logo1} 
                        alt="GMS Logo" 
                        style={{ 
                            height: '40px', 
                            marginRight: '10px' 
                        }} 
                    />
                    GymTrac
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/manage-equipment"
                    >
                        Equipment
                    </Button>
                    <Button 
                        color="inherit"
                        component={Link} 
                        to="/login"
                    >
                        Log In
                    </Button>
                    <Button 
                        color="inherit"
                        component={Link} 
                        to="/signup"
                    >
                        Sign Up
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;