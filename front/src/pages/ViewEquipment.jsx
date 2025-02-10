import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Button, Box, TextField, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import { useSelector } from 'react-redux';

export default function ViewEquipment() {
  const { currentUser } = useSelector((state) => state.user);
  const [equipment, setEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);

  const categories = ['all', 'Sports Ball', 'Weights', 'Exercise Mat', 'Racket Sports'];

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get('/Back/equipment/all');
        if (Array.isArray(response.data)) {
          setEquipment(response.data);
        } else {
          setEquipment([]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const handleBorrow = async (itemId) => {
    if (!currentUser || !currentUser._id) {
      setError('User not logged in');
      return;
    }

    try {
      const response = await axios.post('/Back/equipment/borrow', { itemId, userId: currentUser._id });
      setBorrowedItems([...borrowedItems, response.data.equipment]);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        View Equipment
      </Typography>
      <TextField
        label="Search equipment"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        fullWidth
        margin="normal"
      >
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </Select>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
        {filteredEquipment.map((item) => (
          <Card key={item.id || item._id} sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="body2">
                {item.available}/{item.quantity} available ({item.category})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleBorrow(item.id || item._id)}
                disabled={item.available === 0 || borrowedItems.includes(item.id || item._id)}
                sx={{ marginTop: 2 }}
              >
                Borrow
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}