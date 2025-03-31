import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

export default function AdminDashboard() {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Button variant="contained" color="primary" component={Link} to="/admin/equipment" sx={{ marginRight: 2 }}>
        Manage Equipment
      </Button>
      <Button variant="contained" color="secondary" component={Link} to="/admin/manage-bookings" sx={{ marginRight: 2 }}>
        Manage Bookings
      </Button>
      <Button variant="contained" color="default" component={Link} to="/admin/send-notices">
        Send Notices
      </Button>
      <Button variant="contained" color="success" component={Link} to="/admin/returns">
         Manage Returns
    </Button>
      {/* Add other admin functionalities here */}
    </Box>
  );
}