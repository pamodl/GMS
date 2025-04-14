import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode'; // Import QR code icon

export default function AdminDashboard() {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" gutterBottom>
        Welcome to the Admin Dashboard. Use the options below to manage the system.
      </Typography>

      <Grid container spacing={3}>
        {/* Equipment Management Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equipment Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/admin/equipment"
                sx={{ marginBottom: 1 }}
                fullWidth
              >
                Manage Equipment
              </Button>
              <Button
                variant="contained"
                color="success"
                component={Link}
                to="/admin/returns"
                sx={{ marginBottom: 1 }}
                fullWidth
              >
                Manage Returns
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Management Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking Management
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/admin/manage-bookings"
                sx={{ marginBottom: 1 }}
                fullWidth
              >
                Manage Bookings
              </Button>
              <Button
                variant="contained"
                color="info"
                component={Link}
                to="/admin/borrowed-items"
                sx={{ marginBottom: 1 }}
                fullWidth
              >
                View Borrowed Items
              </Button>
              <Button
                variant="contained"
                color="warning"
                component={Link}
                to="/admin/current-borrowed-items"
                sx={{ marginBottom: 1 }}
                fullWidth
              >
                View Currently Borrowed Items
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Notices Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notices
              </Typography>
              <Button
                variant="contained"
                color="default"
                component={Link}
                to="/admin/send-notices"
                sx={{ marginBottom: 1 }}
                fullWidth
              >
                Send Notices
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* QR Code Management Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/admin/qr-code"
                startIcon={<QrCodeIcon />}
                sx={{ marginBottom: 1 }}
                fullWidth
              >
                Generate Check-In QR Code
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}