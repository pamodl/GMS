import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  Card, CardContent, Typography, Button, Box, Alert, 
  CircularProgress, Chip, Divider, Paper, Grid, Modal,
  Fade, Grow, Slide, Zoom
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion'; // Add: npm install framer-motion
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
// Import QR Scanner (install with: npm install html5-qrcode)
import { Html5QrcodeScanner } from 'html5-qrcode';

// Define common styles that use Figtree font
const fontStyle = {
  fontFamily: 'Figtree, sans-serif'
};

// Animation variants for framer-motion
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.03,
    boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    }
  },
  tap: { 
    scale: 0.97,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    }
  }
};

export default function CheckInOut() {
  const { currentUser } = useSelector((state) => state.user);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [lastCheckOut, setLastCheckOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [checkInData, setCheckInData] = useState([]);
  const [viewMode, setViewMode] = useState('line');
  const [sessionDuration, setSessionDuration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const location = useLocation();
  const [qrScanner, setQrScanner] = useState(null);
  const [animateChart, setAnimateChart] = useState(false);

  useEffect(() => {
    // Check if the URL contains a "scan" action parameter
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('action') === 'scan') {
      // Automatically open scanner if coming from QR code
      setScannerOpen(true);
    }

    const fetchActiveUsersCount = async () => {
      try {
        const response = await axios.get('/Back/checkinout/active-users-count');
        setActiveUsersCount(response.data.count);
      } catch (err) {
        console.error('Failed to fetch active users count:', err);
      }
    };

    const fetchCheckInStatus = async () => {
      if (currentUser && currentUser._id) {
        try {
          const response = await axios.get(`/Back/checkinout/status/${currentUser._id}`);
          setIsCheckedIn(response.data.isCheckedIn);
          setLastCheckIn(response.data.lastCheckIn || null);
          setLastCheckOut(response.data.lastCheckOut || null);
          
          // Calculate session duration if checked in
          if (response.data.isCheckedIn && response.data.lastCheckIn) {
            const checkInTime = new Date(response.data.lastCheckIn).getTime();
            const now = new Date().getTime();
            const duration = Math.floor((now - checkInTime) / (1000 * 60)); // in minutes
            setSessionDuration(duration);
            
            // Update duration every minute
            const intervalId = setInterval(() => {
              const now = new Date().getTime();
              const updatedDuration = Math.floor((now - checkInTime) / (1000 * 60));
              setSessionDuration(updatedDuration);
            }, 60000);
            
            return () => clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Failed to fetch check-in status:', err);
        }
      }
    };

    const fetchCheckInData = async () => {
      try {
        const response = await axios.get('/Back/checkinout/last-seven-days');
        
        // Process the data to ensure consistent date formats
        const processedData = response.data.map(item => {
          // If dateHour is not already a proper date object string, convert it
          if (item.dateHour && typeof item.dateHour === 'string') {
            // Try to parse and format the date consistently
            try {
              const dateParts = item.dateHour.split(' ');
              const dateObj = new Date(dateParts[0]);
              if (!isNaN(dateObj.getTime())) {
                const formattedDate = dateObj.toLocaleDateString();
                // Keep time portion if available
                const timePart = dateParts.length > 1 ? ` ${dateParts[1]}` : '';
                item.dateHour = `${formattedDate}${timePart}`;
              }
            } catch (e) {
              console.warn('Date parsing error:', e);
              // Keep original if parsing fails
            }
          }
          return item;
        });
        
        setCheckInData(processedData);
        // Trigger chart animation after data is loaded
        setTimeout(() => setAnimateChart(true), 300);
      } catch (err) {
        console.error('Failed to fetch check-in data:', err);
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchActiveUsersCount(),
          fetchCheckInStatus(),
          fetchCheckInData()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    const intervalId = setInterval(fetchActiveUsersCount, 60000); // Refresh active users every minute
    
    return () => clearInterval(intervalId);
  }, [currentUser, location.search]);

  // Initialize QR Scanner when modal opens
  useEffect(() => {
    if (scannerOpen) {
      // Give React a moment to render the container
      setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            "qr-reader", 
            { 
              fps: 10,
              qrbox: 250,
              aspectRatio: 1.0,
              disableFlip: false,
              formatsToSupport: ["QR_CODE"]
            }
          );

          scanner.render((decodedText) => {
            // Success callback
            handleQRCodeResult(decodedText);
            // Stop scanning once we get a result
            scanner.clear();
          }, (error) => {
            // Error callback is continuous and can be noisy - no need to show to user
            console.warn("QR scanning error:", error);
          });

          setQrScanner(scanner);
        } catch (err) {
          console.error("Error initializing QR scanner:", err);
          setError("Failed to initialize camera. Please ensure camera permissions are granted.");
        }
      }, 500);
    } else if (qrScanner) {
      // Clean up scanner when modal closes
      qrScanner.clear();
      setQrScanner(null);
    }

    return () => {
      if (qrScanner) {
        qrScanner.clear();
      }
    };
  }, [scannerOpen]);

  const handleQRCodeResult = (decodedText) => {
    // Close the scanner
    setScannerOpen(false);

    // Validate the scanned data
    try {
      const url = new URL(decodedText);
      if (url.pathname.includes('check-in-out') || url.pathname.includes('checkin')) {
        // QR code is valid, proceed with check-in or check-out
        if (isCheckedIn) {
          handleCheckOut();
        } else {
          handleCheckIn();
        }
      } else {
        setError('Invalid QR code. Please scan the official gym QR code.');
      }
    } catch (error) {
      console.error('QR parsing error:', error);
      setError('Invalid QR code format. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    if (!currentUser || !currentUser._id) {
      setError('User information not available');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post('/Back/checkinout/checkin', { userId: currentUser._id });
      setIsCheckedIn(true);
      setLastCheckIn(response.data.timestamp);
      setSessionDuration(0); // Reset session duration
      setSuccess('Check-in successful!');
      
      // Update active users count
      const countResponse = await axios.get('/Back/checkinout/active-users-count');
      setActiveUsersCount(countResponse.data.count);
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentUser || !currentUser._id) {
      setError('User information not available');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post('/Back/checkinout/checkout', { userId: currentUser._id });
      setIsCheckedIn(false);
      setLastCheckOut(response.data.timestamp);
      setSessionDuration(null);
      setSuccess('Check-out successful!');
      
      // Update active users count
      const countResponse = await axios.get('/Back/checkinout/active-users-count');
      setActiveUsersCount(countResponse.data.count);
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatGraphDate = (dateHourStr) => {
    if (!dateHourStr) return '';
    
    try {
      // Try to parse as a date if it's a full date string
      const date = new Date(dateHourStr);
      if (!isNaN(date.getTime())) {
        // Format as month/day
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return [`${month}/${day}`, `${hours}:${minutes < 10 ? '0' + minutes : minutes}`];
      }
    } catch (e) {
      // Fall back to splitting the string
    }
    
    // Split the string by space to separate date and time
    const parts = dateHourStr.split(' ');
    return parts;
  };

  const tooltipFormatter = (value, name) => {
    return [value, 'Active Users'];
  };

  const tooltipLabelFormatter = (label) => {
    try {
      // Try to parse as a date
      const date = new Date(label);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    } catch (e) {
      // Fall back to the original label
    }
    return label;
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    if (!payload || !payload.value) return null;
    
    const [date, time] = formatGraphDate(payload.value);
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="#666" 
          fontSize={12} 
          fontFamily="Figtree, sans-serif"
        >
          {date}
        </text>
        <text 
          x={0} 
          y={20} 
          dy={16} 
          textAnchor="middle" 
          fill="#666" 
          fontSize={12} 
          fontFamily="Figtree, sans-serif"
        >
          {time}
        </text>
      </g>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5',
        ...fontStyle
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: 3, 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      ...fontStyle 
    }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card elevation={3} sx={{ 
              height: '100%', 
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'box-shadow 0.3s ease',
              '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="div" sx={fontStyle}>
                    Attendance Status
                  </Typography>
                </Box>
                
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Alert severity="error" sx={{ mb: 2, ...fontStyle }}>{error}</Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Alert severity="success" sx={{ mb: 2, ...fontStyle }}>{success}</Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    mb: 2, 
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1.5,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' }
                  }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" sx={fontStyle}>Status:</Typography>
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        {isCheckedIn ? (
                          <Chip 
                            icon={<CheckCircleOutlineIcon />} 
                            label="Checked In" 
                            color="success" 
                            variant="filled"
                            sx={fontStyle}
                          />
                        ) : (
                          <Chip 
                            icon={<CancelOutlinedIcon />} 
                            label="Checked Out" 
                            color="default" 
                            variant="filled"
                            sx={fontStyle} 
                          />
                        )}
                      </motion.div>
                    </Box>
                  </Paper>
                </Zoom>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Slide direction="right" in={true} mountOnEnter unmountOnExit style={{ transitionDelay: '150ms' }}>
                      <Paper elevation={1} sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1.5,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' }
                      }}>
                        <Typography variant="body2" color="textSecondary" sx={fontStyle}>Last Check In</Typography>
                        <Typography variant="body1" sx={fontStyle}>{formatDate(lastCheckIn)}</Typography>
                      </Paper>
                    </Slide>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Slide direction="left" in={true} mountOnEnter unmountOnExit style={{ transitionDelay: '200ms' }}>
                      <Paper elevation={1} sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1.5,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' }
                      }}>
                        <Typography variant="body2" color="textSecondary" sx={fontStyle}>Last Check Out</Typography>
                        <Typography variant="body1" sx={fontStyle}>{formatDate(lastCheckOut)}</Typography>
                      </Paper>
                    </Slide>
                  </Grid>
                </Grid>
                
                <AnimatePresence>
                  {isCheckedIn && sessionDuration !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Paper elevation={1} sx={{ 
                        p: 2, 
                        mt: 2, 
                        backgroundColor: '#edf7ed',
                        borderRadius: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': { boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)', transform: 'translateY(-2px)' }
                      }}>
                        <Typography variant="body2" color="textSecondary" sx={fontStyle}>Current Session Duration</Typography>
                        <Typography variant="h6" color="primary" sx={fontStyle}>{formatDuration(sessionDuration)}</Typography>
                      </Paper>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Box display="flex" alignItems="center">
                      <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1" sx={fontStyle}>
                        Active Users: <strong>{activeUsersCount}</strong>
                      </Typography>
                    </Box>
                  </motion.div>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                {/* Single prominent QR code scan button */}
                <motion.div
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<QrCodeScannerIcon />}
                    onClick={() => setScannerOpen(true)}
                    sx={{ 
                      py: 1.5, 
                      fontSize: '1.1rem', 
                      boxShadow: 3,
                      borderRadius: '10px',
                      backgroundColor: isCheckedIn ? 'secondary.main' : 'primary.main',
                      '&:hover': {
                        backgroundColor: isCheckedIn ? 'secondary.dark' : 'primary.dark',
                      },
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.5s ease',
                      },
                      '&:hover::after': {
                        transform: 'translateX(0)',
                      },
                      ...fontStyle 
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      isCheckedIn ? 'Scan to Check Out' : 'Scan to Check In'
                    )}
                  </Button>
                </motion.div>
                
                <Fade in={true} style={{ transitionDelay: '400ms' }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center" 
                    sx={{ mt: 2, ...fontStyle }}
                  >
                    Scan the QR code at the gym entrance to {isCheckedIn ? 'check out' : 'check in'}
                  </Typography>
                </Fade>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card elevation={3} sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'box-shadow 0.3s ease',
              '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" component="div" sx={fontStyle}>
                    Gym Activity (Last 7 Days)
                  </Typography>
                  <Box>
                    <Button 
                      variant={viewMode === 'line' ? 'contained' : 'outlined'} 
                      size="small"
                      onClick={() => setViewMode('line')}
                      sx={{ 
                        mr: 1, 
                        ...fontStyle,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Line
                    </Button>
                    <Button 
                      variant={viewMode === 'bar' ? 'contained' : 'outlined'} 
                      size="small"
                      onClick={() => setViewMode('bar')}
                      sx={{ 
                        ...fontStyle,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Bar
                    </Button>
                  </Box>
                </Box>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animateChart ? 1 : 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <ResponsiveContainer width="100%" height={400} key={`chart-${checkInData.length}-${viewMode}`}>
                    {viewMode === 'line' ? (
                      <LineChart data={checkInData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="dateHour" tick={<CustomXAxisTick />} stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                            border: 'none',
                            ...fontStyle 
                          }} 
                          labelStyle={{ fontWeight: 'bold', ...fontStyle }}
                          formatter={tooltipFormatter}
                          labelFormatter={tooltipLabelFormatter}
                          animationDuration={300}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', ...fontStyle }} />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          name="Active Users" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          activeDot={{ r: 8, fill: '#8884d8', stroke: '#fff', strokeWidth: 2 }} 
                          isAnimationActive={true}
                          animationDuration={1500}
                          animationEasing="ease-in-out"
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={checkInData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="dateHour" tick={<CustomXAxisTick />} stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                            border: 'none',
                            ...fontStyle 
                          }} 
                          labelStyle={{ fontWeight: 'bold', ...fontStyle }}
                          formatter={tooltipFormatter}
                          labelFormatter={tooltipLabelFormatter}
                          animationDuration={300}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', ...fontStyle }} />
                        <Bar 
                          dataKey="count" 
                          name="Active Users" 
                          fill="#8884d8" 
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationDuration={1500}
                          animationEasing="ease-in-out"
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* QR Code Scanner Modal */}
      <Modal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        closeAfterTransition
        aria-labelledby="qr-scanner-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Fade in={scannerOpen} timeout={300}>
          <Paper sx={{ 
            p: 3, 
            maxWidth: '95%',
            width: 500,
            maxHeight: '90vh',
            overflow: 'auto',
            outline: 'none',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(5px)',
            background: 'rgba(255, 255, 255, 0.98)',
          }}>
            <Typography variant="h6" gutterBottom sx={{ ...fontStyle, fontWeight: 600 }}>
              Scan Gym QR Code
            </Typography>
            
            <Box sx={{ mb: 2, overflow: 'hidden', borderRadius: '12px' }}>
              <div id="qr-reader" style={{ width: '100%' }}></div>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 3, ...fontStyle }}
            >
              Point your camera at the QR code displayed at the gym entrance.
            </Typography>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button 
                fullWidth 
                variant="outlined"
                color="primary" 
                onClick={() => setScannerOpen(false)}
                sx={{
                  ...fontStyle,
                  borderRadius: '10px',
                  py: 1,
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </Button>
            </motion.div>
          </Paper>
        </Fade>
      </Modal>
    </Box>
  );
}