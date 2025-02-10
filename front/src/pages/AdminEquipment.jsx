import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';

export default function AdminEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get('/Back/equipment/all-with-borrowed-info');
        setEquipment(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Equipment Management
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
        {equipment.map((item) => (
          <Card key={item._id} sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="body2">
                {item.available}/{item.quantity} available ({item.category})
              </Typography>
              <Typography variant="body2" sx={{ marginTop: 2 }}>
                Borrowed By:
              </Typography>
              <List>
                {item.borrowedBy.map((borrow) => (
                  <ListItem key={borrow._id}>
                    <ListItemText
                      primary={borrow.userId.username}
                      secondary={`Borrowed on: ${new Date(borrow.borrowedAt).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}