import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Alert, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: null, severity: null });
  
  // Delete user states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  
  // Edit user states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editInProgress, setEditInProgress] = useState(false);
  
  // Password states
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState('');
  
  // User filters
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/Back/auth/all');
      
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
        setError('Received invalid data format from server');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
  
    try {
      setDeleteInProgress(true);
      setDeleteDialogOpen(false);
      
      // Don't allow deleting the last admin
      if (userToDelete.role === 'admin') {
        const admins = users.filter(user => user.role === 'admin');
        if (admins.length <= 1) {
          setActionStatus({
            message: 'Cannot delete the last administrator account',
            severity: 'error'
          });
          setDeleteInProgress(false);
          setUserToDelete(null);
          return;
        }
      }
      
      await axios.delete(`/Back/auth/${userToDelete._id}`);
      
      setUsers(users.filter((user) => user._id !== userToDelete._id));
      setActionStatus({
        message: `User ${userToDelete.username} has been successfully deleted.`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Delete error:', err);
      setActionStatus({
        message: err.response?.data?.message || 'Failed to delete user',
        severity: 'error'
      });
    } finally {
      setDeleteInProgress(false);
      setUserToDelete(null);
    }
  };

  const handleEditClick = (user) => {
    setUserToEdit({...user});
    setEditDialogOpen(true);
    // Reset password states when opening edit dialog
    setChangePassword(false);
    setPassword('');
    setShowPassword(false);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setUserToEdit(null);
    setChangePassword(false);
    setPassword('');
  };

  const handleEditConfirm = async () => {
    if (!userToEdit) return;
  
    try {
      setEditInProgress(true);
      
      // Don't allow changing the role of the last admin
      if (userToEdit.originalRole === 'admin' && userToEdit.role !== 'admin') {
        const admins = users.filter(user => user.role === 'admin');
        if (admins.length <= 1) {
          setActionStatus({
            message: 'Cannot change role of the last administrator',
            severity: 'error'
          });
          setEditInProgress(false);
          return;
        }
      }
      
      // Create request payload
      const userData = {
        username: userToEdit.username,
        email: userToEdit.email,
        regNumber: userToEdit.regNumber,
        role: userToEdit.role
      };
      
      // Add password to payload if changing password
      if (changePassword && password) {
        userData.password = password;
      }
      
      const response = await axios.put(`/Back/auth/${userToEdit._id}`, userData);
      
      // Update user list with edited user
      setUsers(users.map(user => 
        user._id === userToEdit._id ? response.data : user
      ));
      
      setEditDialogOpen(false);
      setActionStatus({
        message: `User ${userToEdit.username} has been successfully updated.${changePassword ? ' Password was changed.' : ''}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Edit error:', err);
      let errorMessage = 'Failed to update user';
      
      // Handle specific error messages
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found';
      } else if (err.response?.status === 400) {
        if (err.response.data?.message.includes('Username')) {
          errorMessage = 'Username already taken';
        } else if (err.response.data?.message.includes('Email')) {
          errorMessage = 'Email already taken';
        }
      }
      
      setActionStatus({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setEditInProgress(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserToEdit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  // Filter users based on role
  const filteredUsers = roleFilter 
    ? users.filter(user => user.role === roleFilter)
    : users;

  // Function to get chip color based on role
  const getRoleChipProps = (role) => {
    switch(role) {
      case 'admin':
        return { label: 'Admin', color: 'error' };
      case 'student':
        return { label: 'Student', color: 'primary' };
      case 'academic':
        return { label: 'Academic Staff', color: 'success' };
      case 'non-academic':
        return { label: 'Non-Academic', color: 'warning' };
      default:
        return { label: role, color: 'default' };
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">User Management</Typography>
          <Box>
            <Button 
              variant="outlined" 
              onClick={fetchUsers} 
              sx={{ borderRadius: '8px' }}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        {/* Filters */}
        <Box sx={{ display: 'flex', mt: 2, mb: 1 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              label="Filter by Role"
              onChange={(e) => setRoleFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="academic">Academic Staff</MenuItem>
              <MenuItem value="non-academic">Non-Academic Staff</MenuItem>
            </Select>
          </FormControl>
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
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchUsers}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <Typography variant="body1" color="text.secondary">No users found.</Typography>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <List disablePadding>
            {filteredUsers.map((user, index) => {
              const roleChip = getRoleChipProps(user.role);
              
              return (
                <React.Fragment key={user._id}>
                  <ListItem 
                    sx={{ 
                      py: 2, 
                      px: 3,
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {user.username}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={roleChip.label}
                            color={roleChip.color}
                            sx={{ ml: 1, borderRadius: '8px' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ color: 'text.secondary' }}>
                          <Typography variant="body2" component="span">
                            <strong>Email:</strong> {user.email}
                          </Typography>
                          <Typography variant="body2" component="span" sx={{ ml: 3 }}>
                            <strong>Reg Number:</strong> {user.regNumber}
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: { xs: 2, sm: 0 } }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        onClick={() => handleEditClick({...user, originalRole: user.role})}
                        sx={{ borderRadius: '8px' }}
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteClick(user)}
                        sx={{ borderRadius: '8px' }}
                        disabled={user._id === userToDelete?._id && deleteInProgress}
                      >
                        {user._id === userToDelete?._id && deleteInProgress ? 'Deleting...' : 'Delete'}
                      </Button>
                    </Box>
                  </ListItem>
                  {index < filteredUsers.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        aria-labelledby="delete-user-dialog-title"
      >
        <DialogTitle id="delete-user-dialog-title">
          Confirm Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>{userToDelete?.username}</strong> with role <strong>{userToDelete?.role}</strong>?
            This action cannot be undone.
            
            {userToDelete?.role === 'admin' && (
              <Box component="span" sx={{ display: 'block', color: 'warning.main', mt: 1 }}>
                Warning: Deleting an admin user may affect system administration.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditCancel}
        aria-labelledby="edit-user-dialog-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="edit-user-dialog-title">
          Edit User: {userToEdit?.username}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              name="username"
              label="Username"
              value={userToEdit?.username || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={userToEdit?.email || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="regNumber"
              label="Registration Number"
              value={userToEdit?.regNumber || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={userToEdit?.role || ''}
                label="Role"
                onChange={handleInputChange}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="academic">Academic Staff</MenuItem>
                <MenuItem value="non-academic">Non-Academic Staff</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>

            {/* Password Change Option */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  name="changePassword"
                  color="primary"
                />
              }
              label="Change Password"
              sx={{ mt: 2 }}
            />
            
            {changePassword && (
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handlePasswordToggle}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditConfirm} 
            color="primary" 
            variant="contained"
            disabled={editInProgress || (changePassword && !password)}
          >
            {editInProgress ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}