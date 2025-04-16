import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Container,
  Chip,
  Divider,
  Grid,
  Tooltip,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material';
import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';

export default function AdminBorrowedItems() {
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: null, severity: null });
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchRegNo, setSearchRegNo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');

  // For filter dropdowns
  const [categories, setCategories] = useState([]);
  const [equipmentNames, setEquipmentNames] = useState([]);

  useEffect(() => {
    fetchBorrowedItems();
  }, []);

  useEffect(() => {
    // Extract unique categories and equipment names for filters
    const cats = Array.from(new Set(borrowedItems.map(item => item.category).filter(Boolean)));
    setCategories(cats);

    const eqNames = Array.from(new Set(borrowedItems.map(item => item.itemName).filter(Boolean)));
    setEquipmentNames(eqNames);

    // Filtering logic
    let items = borrowedItems;

    if (categoryFilter) {
      items = items.filter(item => item.category === categoryFilter);
    }
    if (equipmentFilter) {
      items = items.filter(item => item.itemName === equipmentFilter);
    }
    if (searchRegNo.trim()) {
      items = items
        .map(item => ({
          ...item,
          borrowedBy: item.borrowedBy.filter(borrow =>
            (borrow.registrationNumber || '').toLowerCase().includes(searchRegNo.trim().toLowerCase())
          )
        }))
        .filter(item => item.borrowedBy.length > 0);
    }
    setFilteredItems(items);
  }, [borrowedItems, categoryFilter, equipmentFilter, searchRegNo]);

  const fetchBorrowedItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/Back/equipment/borrowed-items');
      setBorrowedItems(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch borrowed items');
      console.error('Error fetching borrowed items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBorrowedItems();
    setRefreshing(false);
  };

  const handleApproveReturn = async (itemId, borrowId) => {
    try {
      setActionStatus({ message: null, severity: null });
      await axios.post('/Back/equipment/approve-return', { itemId, borrowId });

      // Update local state to reflect the change
      const updatedItems = borrowedItems.map(item => {
        if (item._id === itemId) {
          return {
            ...item,
            borrowedBy: item.borrowedBy.map(borrow => {
              if (borrow._id === borrowId) {
                return { ...borrow, isApproved: true };
              }
              return borrow;
            })
          };
        }
        return item;
      });

      setBorrowedItems(updatedItems);
      setActionStatus({
        message: 'Return approval successful!',
        severity: 'success'
      });
    } catch (err) {
      setActionStatus({
        message: err.response?.data?.message || 'Failed to approve return',
        severity: 'error'
      });
      console.error('Error approving return:', err);
    }
  };

  // Helper function to calculate days overdue
  const getDaysOverdue = (borrowDate) => {
    const currentDate = new Date();
    const borrowDateTime = new Date(borrowDate);
    const diffTime = currentDate - borrowDateTime;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7 ? diffDays - 7 : 0; // Assuming 7-day borrow period
  };

  // Helper function to determine status color and label
  const getBorrowStatus = (borrow) => {
    if (borrow.returnedAt) {
      if (borrow.isApproved) {
        return {
          color: 'success',
          label: 'Returned & Approved'
        };
      } else {
        return {
          color: 'warning',
          label: 'Return Pending Approval'
        };
      }
    } else {
      // Still borrowed
      const daysOverdue = getDaysOverdue(borrow.borrowedAt);
      if (daysOverdue > 0) {
        return {
          color: 'error',
          label: `Overdue (${daysOverdue} days)`
        };
      } else {
        return {
          color: 'info',
          label: 'Borrowed'
        };
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <div>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Equipment Borrowing History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage all equipment borrow records. Use filters to search by registration number, category, or equipment name.
            </Typography>
          </div>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing || loading}
              color="primary"
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.15)',
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box display="flex" flexWrap="wrap" gap={2} mt={3}>
          <TextField
            label="Search by Registration No."
            variant="outlined"
            size="small"
            value={searchRegNo}
            onChange={e => setSearchRegNo(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />
          <TextField
            select
            label="Filter by Category"
            variant="outlined"
            size="small"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Filter by Equipment"
            variant="outlined"
            size="small"
            value={equipmentFilter}
            onChange={e => setEquipmentFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            {equipmentNames.map(name => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {actionStatus.message && (
        <Alert
          severity={actionStatus.severity}
          sx={{ mb: 3 }}
          onClose={() => setActionStatus({ message: null, severity: null })}
        >
          {actionStatus.message}
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredItems.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <Typography variant="body1">No borrowed items found.</Typography>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <List disablePadding>
            {filteredItems.map((item, itemIndex) => (
              <React.Fragment key={item._id || itemIndex}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: itemIndex === 0 ? '12px 12px 0 0' : 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <InventoryIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    {item.itemName || "Unnamed Equipment"}
                  </Typography>
                  <Chip
                    label={item.category || "Uncategorized"}
                    color="secondary"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Paper>

                {item.borrowedBy && item.borrowedBy.length > 0 ? (
                  <List disablePadding>
                    {item.borrowedBy.map((borrow, borrowIndex) => {
                      const status = getBorrowStatus(borrow);

                      return (
                        <React.Fragment key={borrow._id || `${item._id}-${borrowIndex}`}>
                          <ListItem
                            sx={{
                              py: 2,
                              px: 3,
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              bgcolor: status.color === 'error' ? 'rgba(239, 83, 80, 0.05)' : 'transparent'
                            }}
                          >
                            <ListItemText
                                primary={
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                                    <Typography variant="subtitle1" fontWeight="medium" sx={{ mr: 2 }}>
                                      {borrow.registrationNumber || 'No Reg No'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                      ({borrow.email || 'No email'})
                                    </Typography>
                                    {/* Optionally, show username as a chip */}
                                    {borrow.username && (
                                      <Chip
                                        label={`User: ${borrow.username}`}
                                        size="small"
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Box>
                                }
                              secondary={
                                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="body2" component="div" sx={{ mb: 0.5 }}>
                                      <strong>Quantity:</strong> {borrow.quantity || 1}
                                    </Typography>
                                    <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                                      <span><strong>Borrowed:</strong> {new Date(borrow.borrowedAt).toLocaleString()}</span>
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="body2" component="span">
                                      <strong>Status:</strong>{' '}
                                      <Chip
                                        size="small"
                                        label={status.label}
                                        color={status.color}
                                        variant="outlined"
                                        sx={{
                                          borderRadius: '4px',
                                          fontWeight: status.color === 'error' ? 'bold' : 'normal'
                                        }}
                                      />
                                    </Typography>
                                    {borrow.returnedAt && (
                                      <Typography variant="body2" component="div" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                        <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                                        <span><strong>Returned:</strong> {new Date(borrow.returnedAt).toLocaleString()}</span>
                                      </Typography>
                                    )}
                                  </Grid>
                                </Grid>
                              }
                              sx={{ mb: { xs: 2, sm: 0 } }}
                            />
                            {borrow.returnedAt && !borrow.isApproved && (
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleApproveReturn(item._id, borrow._id)}
                                sx={{
                                  ml: { xs: 0, sm: 2 },
                                  borderRadius: '8px',
                                  boxShadow: 2,
                                  '&:hover': { boxShadow: 3 }
                                }}
                              >
                                Approve Return
                              </Button>
                            )}
                          </ListItem>
                          {borrowIndex < item.borrowedBy.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">No borrow records for this equipment.</Typography>
                  </Box>
                )}

                {itemIndex < filteredItems.length - 1 && <Divider sx={{ my: 2 }} />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}