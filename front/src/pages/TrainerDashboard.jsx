import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Tabs, Tab, 
  List, ListItem, ListItemText, Chip, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Divider, Link, Breadcrumbs,
  Grid, Card, CardContent, Avatar, Rating, Badge
} from '@mui/material';
import { 
  Home as HomeIcon, 
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  PendingActions as PendingIcon
} from '@mui/icons-material';
import { format, parseISO, isToday, addDays, isBefore } from 'date-fns';

export default function TrainerDashboard() {
  const { currentUser } = useSelector(state => state.user);
  const [trainer, setTrainer] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  
  // New state variables for handling rejection
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [sessionToReject, setSessionToReject] = useState(null);
  
  const [stats, setStats] = useState({
    pendingSessions: 0,
    todaySessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    rating: 0
  });
  
  useEffect(() => {
    const fetchTrainerProfile = async () => {
      try {
        // First get the trainer ID for this user
        const trainerResponse = await axios.get(`/Back/trainers/user/${currentUser._id}`);
        setTrainer(trainerResponse.data);
        
        // Then fetch sessions
        const sessionsResponse = await axios.get(`/Back/trainers/sessions/${trainerResponse.data._id}`);
        const sessionsData = sessionsResponse.data;
        setSessions(sessionsData);
        
        // Calculate stats
        const today = new Date();
        
        const pendingSessions = sessionsData.filter(session => 
          session.status === 'pending'
        );
        
        const todaysSessions = sessionsData.filter(session => 
          isToday(parseISO(session.date)) && session.status === 'scheduled'
        );
        
        const upcomingSessions = sessionsData.filter(session => 
          !isToday(parseISO(session.date)) && 
          !isBefore(parseISO(session.date), today) && 
          session.status === 'scheduled'
        );
        
        const completedSessions = sessionsData.filter(session => 
          session.status === 'completed'
        );
        
        const cancelledSessions = sessionsData.filter(session => 
          session.status === 'cancelled'
        );
        
        setStats({
          pendingSessions: pendingSessions.length,
          todaySessions: todaysSessions.length,
          upcomingSessions: upcomingSessions.length,
          completedSessions: completedSessions.length,
          cancelledSessions: cancelledSessions.length,
          rating: trainerResponse.data.rating || 0
        });
        
      } catch (err) {
        setError('Failed to load trainer data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchTrainerProfile();
    }
  }, [currentUser]);
  
  // Filter sessions based on tab
  const filteredSessions = sessions.filter(session => {
    if (tabValue === 0) return isToday(parseISO(session.date)) && session.status === 'scheduled';
    if (tabValue === 1) return session.status === 'pending'; // New tab for pending sessions
    if (tabValue === 2) return !isToday(parseISO(session.date)) && session.status === 'scheduled';
    if (tabValue === 3) return session.status === 'completed';
    if (tabValue === 4) return session.status === 'cancelled';
    return true;
  });
  
  const handleUpdateStatus = async (sessionId, status) => {
    try {
      setError(null);
      const payload = { status };
      
      // If completing the session and there are notes, include them
      if (status === 'completed' && sessionNotes.trim()) {
        payload.notes = sessionNotes;
      }
      
      await axios.put(`/Back/trainers/session/${sessionId}/status`, payload);
      
      // Update the session in state
      setSessions(prev => prev.map(session => 
        session._id === sessionId ? { ...session, status, notes: sessionNotes || session.notes } : session
      ));
      
      // Update stats
      if (status === 'completed') {
        setStats(prev => ({
          ...prev,
          completedSessions: prev.completedSessions + 1,
          todaySessions: isToday(parseISO(selectedSession.date)) ? prev.todaySessions - 1 : prev.todaySessions,
          upcomingSessions: !isToday(parseISO(selectedSession.date)) ? prev.upcomingSessions - 1 : prev.upcomingSessions
        }));
      } else if (status === 'cancelled') {
        setStats(prev => ({
          ...prev,
          cancelledSessions: prev.cancelledSessions + 1,
          todaySessions: isToday(parseISO(selectedSession.date)) ? prev.todaySessions - 1 : prev.todaySessions,
          upcomingSessions: !isToday(parseISO(selectedSession.date)) ? prev.upcomingSessions - 1 : prev.upcomingSessions
        }));
      }
      
      setDialogOpen(false);
      setSessionNotes('');
    } catch (err) {
      console.error('Error updating session status:', err.response || err);
      setError('Failed to update session status: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // New function for approving pending sessions
  const handleApproveSession = async (sessionId) => {
    try {
      setError(null);
      await axios.put(`/Back/trainers/session/${sessionId}/approve`);
      
      // Update the session in state
      setSessions(prev => prev.map(session => {
        if (session._id === sessionId) {
          const updatedSession = { ...session, status: 'scheduled' };
          return updatedSession;
        }
        return session;
      }));
      
      // Update stats
      setStats(prev => {
        const session = sessions.find(s => s._id === sessionId);
        const isSessionToday = session ? isToday(parseISO(session.date)) : false;
        
        return {
          ...prev,
          pendingSessions: prev.pendingSessions - 1,
          todaySessions: isSessionToday ? prev.todaySessions + 1 : prev.todaySessions,
          upcomingSessions: !isSessionToday ? prev.upcomingSessions + 1 : prev.upcomingSessions
        };
      });
    } catch (err) {
      console.error('Error approving session:', err);
      setError('Failed to approve session: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Open the dialog for rejecting a session
  const handleOpenRejectDialog = (session) => {
    setSessionToReject(session);
    setRejectReason('');
    setRejectDialogOpen(true);
  };
  
  // Handle rejection of a pending session
  const handleRejectSession = async () => {
    if (!sessionToReject) return;
    
    try {
      setError(null);
      await axios.put(`/Back/trainers/session/${sessionToReject._id}/reject`, {
        reason: rejectReason
      });
      
      // Update the session in state
      setSessions(prev => prev.map(session => 
        session._id === sessionToReject._id ? 
        { ...session, status: 'cancelled', notes: rejectReason ? `Rejected: ${rejectReason}` : session.notes } : 
        session
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingSessions: prev.pendingSessions - 1,
        cancelledSessions: prev.cancelledSessions + 1
      }));
      
      setRejectDialogOpen(false);
    } catch (err) {
      console.error('Error rejecting session:', err);
      setError('Failed to reject session: ' + (err.response?.data?.message || err.message));
    }
  };
  
  const handleOpenCompleteDialog = (session) => {
    setSelectedSession(session);
    setSessionNotes(session.notes || '');
    setDialogOpen(true);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          component={RouterLink} 
          to="/"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography color="text.primary">Trainer Dashboard</Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Trainer Dashboard
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card raised sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={stats.pendingSessions} color="error" 
                sx={{ '& .MuiBadge-badge': { fontSize: 14, height: 24, minWidth: 24 } }}
              >
                <PendingIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              </Badge>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>Pending Requests</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card raised sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TodayIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{stats.todaySessions}</Typography>
              <Typography variant="subtitle1" color="text.secondary">Today's Sessions</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card raised sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccessTimeIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{stats.upcomingSessions}</Typography>
              <Typography variant="subtitle1" color="text.secondary">Upcoming</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card raised sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{stats.completedSessions}</Typography>
              <Typography variant="subtitle1" color="text.secondary">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card raised sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CancelIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{stats.cancelledSessions}</Typography>
              <Typography variant="subtitle1" color="text.secondary">Cancelled</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card raised sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, mb: 1, color: '#ff9800' }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  {stats.rating.toFixed(1)}
                </Typography>
                <Rating value={stats.rating} readOnly precision={0.5} size="small" sx={{ ml: 0.5 }} />
              </Box>
              <Typography variant="subtitle1" color="text.secondary">Rating</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Session Tabs */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 3 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Today's Sessions" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Pending Requests
                {stats.pendingSessions > 0 && 
                  <Chip 
                    label={stats.pendingSessions} 
                    color="error" 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                }
              </Box>
            } 
          />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
        
        {filteredSessions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {tabValue === 1 ? 'No pending session requests' : 'No sessions found'}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredSessions.map((session) => (
              <React.Fragment key={session._id}>
                <ListItem 
                  sx={{ 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    backgroundColor: session.status === 'pending' ? 'rgba(255, 152, 0, 0.08)' : 
                                     isToday(parseISO(session.date)) ? 'rgba(33, 150, 243, 0.08)' : 
                                     'transparent',
                    borderRadius: 2,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {session.user?.username || 'Client'} 
                        </Typography>
                        <Chip 
                          size="small" 
                          label={session.sessionType} 
                          color="primary" 
                          variant="outlined" 
                        />
                        {session.status === 'pending' && 
                          <Chip 
                            size="small" 
                            label="Pending Approval" 
                            color="warning" 
                          />
                        }
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {format(parseISO(session.date), 'MMMM d, yyyy')} • {session.startTime} - {session.endTime}
                        </Typography>
                        {session.notes && (
                          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            Notes: {session.notes}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                    {session.status === 'pending' && (
                      <>
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="success"
                          onClick={() => handleApproveSession(session._id)}
                          sx={{ mr: 1 }}
                          startIcon={<CheckCircleIcon />}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenRejectDialog(session)}
                          startIcon={<CancelIcon />}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {session.status === 'scheduled' && (
                      <>
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="success"
                          onClick={() => handleOpenCompleteDialog(session)}
                          sx={{ mr: 1 }}
                          startIcon={<CheckCircleIcon />}
                        >
                          Complete
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setSelectedSession(session);
                            handleUpdateStatus(session._id, 'cancelled');
                          }}
                          startIcon={<CancelIcon />}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Complete Session Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Session</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Please add any notes about this session before marking it as completed.
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            Client: {selectedSession?.user?.username}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            {selectedSession && format(parseISO(selectedSession.date), 'MMMM d, yyyy')}
            {' • '}{selectedSession?.startTime} - {selectedSession?.endTime}
          </Typography>
          
          <TextField
            label="Session Notes"
            multiline
            rows={4}
            fullWidth
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Add notes about the client's progress, exercises completed, etc."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleUpdateStatus(selectedSession?._id, 'completed')} 
            color="primary"
            variant="contained"
          >
            Complete Session
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Session Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Session Request</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Please provide a reason for rejecting this session request (optional).
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            Client: {sessionToReject?.user?.username}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            {sessionToReject && format(parseISO(sessionToReject.date), 'MMMM d, yyyy')}
            {' • '}{sessionToReject?.startTime} - {sessionToReject?.endTime}
          </Typography>
          
          <TextField
            label="Rejection Reason"
            multiline
            rows={3}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why you're rejecting this request (e.g., scheduling conflict, unavailable)"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRejectSession} 
            color="error"
            variant="contained"
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}