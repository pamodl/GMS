import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function Notices() {
  const currentUser = useSelector((state) => state.user.currentUser); // Get the logged-in user
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      if (!currentUser || !currentUser._id) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/Back/notices/${currentUser._id}`); // Fetch notices for the user
        setNotices(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNotices();
  }, [currentUser]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notices
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : notices.length === 0 ? (
        <Typography variant="body1">No notices found.</Typography>
      ) : (
        <List>
          {notices.map((notice) => (
            <ListItem key={notice._id}>
              <ListItemText
                primary={notice.title}
                secondary={`${notice.message} - ${new Date(notice.createdAt).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}