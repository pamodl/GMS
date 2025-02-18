import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';

export default function SendNotices() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/Back/notices/create', { title, message });
      setSuccess('Notice sent successfully');
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Send Notices
      </Typography>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          margin="normal"
          required
          multiline
          rows={4}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Send Notice
        </Button>
      </form>
    </Box>
  );
}