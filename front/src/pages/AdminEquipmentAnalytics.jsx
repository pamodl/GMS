import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Container, CircularProgress, Alert,
  Grid, Card, CardContent, Divider, FormControl, InputLabel,
  Select, MenuItem, TextField, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

export default function AdminEquipmentAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [equipmentUsage, setEquipmentUsage] = useState([]);
  const [categoryUsage, setCategoryUsage] = useState([]);
  const [timeframeData, setTimeframeData] = useState([]);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year'
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day')); // 30 days ago
  const [endDate, setEndDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('quantity'); // 'quantity' or 'count'
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#6B88FF'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe, startDate, endDate]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch equipment usage analytics data
      const response = await axios.get('/Back/equipment/analytics', {
        params: {
          timeframe,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      // Process equipment usage data
      const { equipmentUsage, categoryUsage, timeframeData } = response.data;
      setEquipmentUsage(equipmentUsage);
      setCategoryUsage(categoryUsage);
      setTimeframeData(timeframeData);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Equipment Usage Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Analyze equipment usage patterns, identify popular items, and optimize your inventory.
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={timeframe}
                label="Time Period"
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {timeframe === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </LocalizationProvider>
          )}
          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>View Mode</Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  setViewMode(newValue);
                }
              }}
              aria-label="view mode"
              size="small"
              fullWidth
            >
              <ToggleButton value="quantity" aria-label="quantity borrowed">
                Quantity
              </ToggleButton>
              <ToggleButton value="count" aria-label="borrow count">
                Borrow Events
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', backgroundColor: '#f3f8ff' }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Borrowed
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {equipmentUsage.reduce((sum, item) => sum + item.quantityBorrowed, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    items during this period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', backgroundColor: '#f3fff8' }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Borrowing Events
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {equipmentUsage.reduce((sum, item) => sum + item.borrowCount, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    total borrow transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', backgroundColor: '#fff8f3' }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Avg Items Per Borrow
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {(equipmentUsage.reduce((sum, item) => sum + item.quantityBorrowed, 0) /
                      Math.max(1, equipmentUsage.reduce((sum, item) => sum + item.borrowCount, 0))).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    items per borrowing event
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', backgroundColor: '#f8f3ff' }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Most Borrowed Item
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" noWrap>
                    {equipmentUsage[0]?.name || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {equipmentUsage[0] ? `${equipmentUsage[0].quantityBorrowed} items in ${equipmentUsage[0].borrowCount} borrows` : "No data"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Most Borrowed Equipment Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Most Borrowed Equipment</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {equipmentUsage.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={equipmentUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey={viewMode === 'quantity' ? "quantityBorrowed" : "borrowCount"} 
                          fill="#8884d8" 
                          name={viewMode === 'quantity' ? "Quantity Borrowed" : "Borrow Events"} 
                        />
                        {viewMode === 'quantity' && 
                          <Bar dataKey="borrowCount" fill="#82ca9d" name="Borrow Events" />
                        }
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No equipment usage data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Category Usage Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Usage by Category</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {categoryUsage.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryUsage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey={viewMode === 'quantity' ? "value" : "count"}
                        >
                          {categoryUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            `${value} ${viewMode === 'quantity' ? 'items' : 'borrows'}`,
                            props.payload.name
                          ]} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No category usage data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Usage Over Time Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Usage Over Time</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {timeframeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={timeframeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey={viewMode === 'quantity' ? "quantityBorrowed" : "borrowCount"} 
                          fill="#82ca9d" 
                          name={viewMode === 'quantity' ? "Quantity Borrowed" : "Equipment Borrowed"} 
                        />
                        <Bar 
                          dataKey={viewMode === 'quantity' ? "quantityReturned" : "returnCount"} 
                          fill="#8884d8" 
                          name={viewMode === 'quantity' ? "Quantity Returned" : "Equipment Returned"} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No time-based usage data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}