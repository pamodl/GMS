import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, CircularProgress, Alert, Box } from '@mui/material';
import axios from 'axios';

export default function AdminEditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/Back/equipment/all`);
        const found = res.data.find(eq => eq._id === id);
        if (!found) throw new Error('Equipment not found');
        setEquipment(found);
      } catch (err) {
        setError(err.message || 'Failed to fetch equipment');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  const handleChange = (e) => {
    setEquipment({ ...equipment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/Back/equipment/update/${id}`, {
        name: equipment.name,
        category: equipment.category,
        quantity: equipment.quantity,
        available: equipment.available,
      });
      navigate('/admin/equipment');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update equipment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!equipment) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '12px' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>Edit Equipment</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={equipment.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Category"
            name="category"
            value={equipment.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Total Quantity"
            name="quantity"
            type="number"
            value={equipment.quantity}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Available"
            name="available"
            type="number"
            value={equipment.available}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/equipment')}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}