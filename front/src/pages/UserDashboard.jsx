import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress, 
  Alert, 
  Divider, 
  Button, 
  Container,
  Paper,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logoutUserStart, logoutUserSuccess, logoutUserFailure } from '../redux/user/userSlice';
import axios from 'axios';

export default function UserDashboard() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [bookings, setBookings] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingBorrowedItems, setLoadingBorrowedItems] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);
  const [borrowedItemsError, setBorrowedItemsError] = useState(null);
  const [returnError, setReturnError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !currentUser._id) {
      setLoadingBookings(false);
      setLoadingBorrowedItems(false);
      return;
    }

    // Fetch bookings with error handling and ensure equipment details are populated
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`/Back/bookings/user/${currentUser._id}`);
        
        // Process bookings to ensure they have required data
        const processedBookings = response.data.map(booking => {
          // If booking has equipmentId but no equipment object, try to create a minimal version
          if (booking.equipmentId && !booking.equipment) {
            return {
              ...booking,
              equipment: {
                name: booking.equipmentName || "Equipment #" + booking.equipmentId,
                category: booking.category || "Unknown Category"
              }
            };
          }
          return booking;
        });
        
        setBookings(processedBookings);
        setBookingsError(null);
      } catch (err) {
        console.error("Bookings fetch error:", err);
        setBookingsError(err.response?.data?.message || "Failed to fetch booking history");
      } finally {
        setLoadingBookings(false);
      }
    };

    // Fetch borrowed items with error handling
    const fetchBorrowedItems = async () => {
      try {
        const response = await axios.get(`/Back/auth/${currentUser._id}/borrowed-items`);
        setBorrowedItems(response.data);
        setBorrowedItemsError(null);
      } catch (err) {
        console.error("Borrowed items fetch error:", err);
        setBorrowedItemsError(err.response?.data?.message || "Failed to fetch borrowed items");
      } finally {
        setLoadingBorrowedItems(false);
      }
    };

    // Execute both API calls
    fetchBookings();
    fetchBorrowedItems();
  }, [currentUser]);

  const handleReturn = async (itemId, borrowId) => {
    try {
      setReturnError(null); // Clear any previous errors
      setSuccess(null); // Clear any previous success messages
      
      const response = await axios.post('/Back/equipment/return', {
        itemId,
        borrowId,
        userId: currentUser._id,
      });

      setSuccess(response.data.message || "Equipment return request submitted");

      // Update the borrowedItems state
      const updatedBorrowedItems = borrowedItems.map((item) => {
        if (item._id === itemId) {
          return {
            ...item,
            borrowedBy: item.borrowedBy.map((borrow) => {
              if (borrow._id === borrowId) {
                return { ...borrow, returnedAt: new Date(), isApproved: false };
              }
              return borrow;
            }),
          };
        }
        return item;
      });

      setBorrowedItems(updatedBorrowedItems);
    } catch (err) {
      console.error("Return error:", err);
      setReturnError(err.response?.data?.message || "Failed to process return request");
    }
  };

  const handleLogout = async () => {
    dispatch(logoutUserStart());
    try {
      dispatch(logoutUserSuccess());
      navigate('/login');
    } catch (error) {
      dispatch(logoutUserFailure(error.message));
    }
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">No user is logged in</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  const getStatusChipProps = (status) => {
    if (!status) return { color: 'default', label: 'Unknown' };
    
    switch(status.toLowerCase()) {
      case 'approved':
        return { color: 'success', label: 'Approved' };
      case 'rejected':
        return { color: 'error', label: 'Rejected' };
      case 'pending':
        return { color: 'warning', label: 'Pending' };
      default:
        return { color: 'default', label: status };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (err) {
      console.error("Date formatting error:", err);
      return dateStr;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          User Dashboard
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Username:</strong> {currentUser.username}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {currentUser.email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Registration Number:</strong> {currentUser.regNumber}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleLogout}
          sx={{ borderRadius: '8px' }}
        >
          Log Out
        </Button>
      </Paper>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {returnError && <Alert severity="error" sx={{ mb: 3 }}>{returnError}</Alert>}

      {/* Booking History Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
        <Typography variant="h6" gutterBottom fontWeight="medium">
          Booking History
        </Typography>
        
        {bookingsError && <Alert severity="error" sx={{ mb: 2 }}>{bookingsError}</Alert>}
        
        {loadingBookings ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : bookings.length === 0 ? (
          <Typography variant="body1" color="text.secondary">No bookings found.</Typography>
        ) : (
          <List sx={{ bgcolor: 'background.paper', borderRadius: '8px' }}>
            {bookings.map((booking, index) => {
              const statusChip = getStatusChipProps(booking.status);
              
              // Extract equipment data safely
              const equipmentName = booking.equipment?.name || booking.equipmentName || 'Unknown Equipment';
              const equipmentCategory = booking.equipment?.category || booking.category || 'N/A';
              
              return (
                <React.Fragment key={booking._id || index}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {equipmentName}
                          </Typography>
                          <Chip 
                            size="small"
                            label={statusChip.label}
                            color={statusChip.color}
                            sx={{ borderRadius: '8px' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ color: 'text.secondary' }}>
                          <Typography variant="body2" component="span">
                            <strong>Category:</strong> {equipmentCategory}
                          </Typography>
                          <br />
                          <Typography variant="body2" component="span">
                            <strong>Quantity:</strong> {booking.quantity || 0}
                          </Typography>
                          <br />
                          <Typography variant="body2" component="span">
                            <strong>Requested:</strong> {formatDate(booking.requestedAt)}
                          </Typography>
                          {booking.status === 'approved' && booking.approvedAt && (
                            <>
                              <br />
                              <Typography variant="body2" component="span">
                                <strong>Approved:</strong> {formatDate(booking.approvedAt)}
                              </Typography>
                            </>
                          )}
                          {booking.status === 'rejected' && booking.rejectedAt && (
                            <>
                              <br />
                              <Typography variant="body2" component="span">
                                <strong>Rejected:</strong> {formatDate(booking.rejectedAt)}
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < bookings.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Borrowed Items Section */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: '12px' }}>
        <Typography variant="h6" gutterBottom fontWeight="medium">
          Borrowed Items
        </Typography>
        
        {borrowedItemsError && <Alert severity="error" sx={{ mb: 2 }}>{borrowedItemsError}</Alert>}
        
        {loadingBorrowedItems ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : borrowedItems.length === 0 ? (
          <Typography variant="body1" color="text.secondary">No borrowed items.</Typography>
        ) : (
          <List sx={{ bgcolor: 'background.paper', borderRadius: '8px' }}>
            {borrowedItems.filter(item => item && item.borrowedBy && item.borrowedBy.length > 0).map((item) => {
              return item.borrowedBy.map((borrow, borrowIndex) => (
                <React.Fragment key={borrow._id || `${item._id}-${borrowIndex}`}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {item.name || 'Unknown Item'}
                          </Typography>
                          <Chip 
                            size="small"
                            label={borrow.returnedAt ? (borrow.isApproved ? 'Returned' : 'Return Pending') : 'Borrowed'}
                            color={borrow.returnedAt ? (borrow.isApproved ? 'success' : 'warning') : 'info'}
                            variant="outlined"
                            sx={{ borderRadius: '8px' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ color: 'text.secondary' }}>
                          <Typography variant="body2" component="span">
                            <strong>Borrowed:</strong> {formatDate(borrow.borrowedAt)}
                          </Typography>
                          <br />
                          <Typography variant="body2" component="span">
                            <strong>Quantity:</strong> {borrow.quantity || 1}
                          </Typography>
                          {borrow.returnedAt && (
                            <>
                              <br />
                              <Typography variant="body2" component="span">
                                <strong>Returned:</strong> {formatDate(borrow.returnedAt)}
                                {!borrow.isApproved && " (Pending Approval)"}
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                    {!borrow.returnedAt && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleReturn(item._id, borrow._id)}
                        sx={{ ml: 2, borderRadius: '8px', alignSelf: 'center' }}
                      >
                        Return
                      </Button>
                    )}
                  </ListItem>
                  {borrowIndex < item.borrowedBy.length - 1 && <Divider />}
                </React.Fragment>
              ));
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
}