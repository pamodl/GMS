import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get('/Back/notices');
        setNotices(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notices
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
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