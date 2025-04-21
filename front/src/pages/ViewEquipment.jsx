import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  TextField, 
  Select, 
  MenuItem, 
  CircularProgress, 
  Alert,
  Container,
  Paper,
  Chip
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function ViewEquipment() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [equipment, setEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expanded categories list
  const categories = [
    'all', 
    'Sports Ball', 
    'Weights', 
    'Exercise Mat', 
    'Racket Sports',
    'Cardio Equipment',
    'Strength Training',
    'Yoga Accessories',
    'Boxing Gear',
    'Swimming Equipment',
    'Team Sports',
    'Fitness Accessories',
    'Recovery Tools',
    'Resistance Bands',
    'Dance Equipment',
    'Training Accessories',
    'Outdoor Sports'
  ];

  useEffect(() => {
    fetchEquipment();
  }, []);
  
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/Back/equipment/all');
      if (Array.isArray(response.data)) {
        setEquipment(response.data);
      } else {
        setEquipment([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching equipment:", err);
      setError(err.response?.data?.message || err.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '12px' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Available Equipment
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchEquipment}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <TextField
          label="Search equipment"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ mb: 2 }}
        />
        
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          fullWidth
          displayEmpty
          sx={{ mb: 3 }}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </MenuItem>
          ))}
        </Select>
        
        {filteredEquipment.length === 0 ? (
          <Alert severity="info">No equipment matching your search criteria found.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {filteredEquipment.map((item) => (
              <Card 
                key={item._id} 
                elevation={2} 
                sx={{ 
                  width: 300, 
                  borderRadius: '12px',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {item.category || 'Uncategorized'}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mt: 2 
                  }}>
                    <Typography variant="body1" fontWeight="medium">
                      {item.available}/{item.quantity} available
                    </Typography>
                    
                    <Chip 
                      label={item.available > 0 ? "In Stock" : "Out of Stock"}
                      color={item.available > 0 ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}