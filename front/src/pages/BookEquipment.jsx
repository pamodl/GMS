import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Box, Button, CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel, TextField } from '@mui/material';
import axios from 'axios';

export default function BookEquipment() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get('/Back/equipment/all');
        setEquipmentList(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const handleBooking = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/Back/bookings/create', {
        userId: currentUser._id,
        equipmentId: selectedEquipment,
        quantity,
      });
      setSuccess('Booking request sent successfully');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Book Equipment
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <FormControl fullWidth margin="normal">
          <InputLabel id="equipment-label">Select Equipment</InputLabel>
          <Select
            labelId="equipment-label"
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
          >
            {equipmentList.map((equipment) => (
              <MenuItem key={equipment._id} value={equipment._id}>
                {equipment.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleBooking}
            sx={{ marginTop: 2 }}
            disabled={!selectedEquipment || quantity < 1}
          >
            Book Equipment
          </Button>
        </FormControl>
      )}
    </Box>
  );
}