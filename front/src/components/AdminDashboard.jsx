import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, Typography, Button, Grid, Card, CardContent, 
  CardHeader, Divider, useTheme, alpha, Paper, Icon,
  Zoom, Grow, Slide
} from '@mui/material';
import { motion } from 'framer-motion'; // Add: npm install framer-motion
import QrCodeIcon from '@mui/icons-material/QrCode';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InventoryIcon from '@mui/icons-material/Inventory';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonIcon from '@mui/icons-material/Person';
import RestoreIcon from '@mui/icons-material/Restore';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Custom Card Component with hover effects
const DashboardCard = ({ title, icon, children }) => {
  const theme = useTheme();

  return (
    <motion.div variants={itemVariants}>
      <Card 
        elevation={2}
        sx={{
          height: '100%',
          borderRadius: 2,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)'
          },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardHeader
          avatar={
            <Box
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
          }
          title={
            <Typography variant="h6" fontWeight="600" sx={{ ml: -1 }}>
              {title}
            </Typography>
          }
          sx={{ pb: 0 }}
        />
        <Divider sx={{ mt: 1.5, mb: 0 }} />
        <CardContent sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          pt: 2
        }}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Button with motion effects
const ActionButton = ({ to, color, icon, children, delay = 0 }) => {
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02, 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      } 
    },
    tap: { scale: 0.98 }
  };

  return (
    <Grow in={true} style={{ transformOrigin: '0 0 0', transitionDelay: `${delay}ms` }}>
      <Box sx={{ mb: 1.5 }}>
        <motion.div
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <Button
            variant="contained"
            color={color}
            component={Link}
            to={to}
            fullWidth
            startIcon={icon}
            sx={{ 
              py: 1.2, 
              borderRadius: 2,
              boxShadow: 2,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
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
                transition: 'transform 0.4s ease',
              },
              '&:hover::after': {
                transform: 'translateX(0)',
              },
            }}
          >
            {children}
          </Button>
        </motion.div>
      </Box>
    </Grow>
  );
};

export default function AdminDashboard() {
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  // Simulate loading state for animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box 
      sx={{ 
        padding: { xs: 2, md: 4 },
        backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.background.default, 0.9)})`,
        minHeight: '100vh'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: '30%', 
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${alpha('#fff', 0.1)} 100%)`,
              transform: 'skewX(-15deg) translateX(50%)'
            }} 
          />
          <Typography 
            variant="h4" 
            fontWeight="700" 
            gutterBottom
            sx={{ 
              textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body1">
            Welcome to the Admin Control Panel. Manage your gym's operations from here.
          </Typography>
        </Paper>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <Grid container spacing={3}>
          {/* Equipment Management Section */}
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard 
              title="Equipment Management" 
              icon={<FitnessCenterIcon color="primary" fontSize="medium" />}
            >
              <ActionButton 
                to="/admin/equipment" 
                color="primary" 
                icon={<InventoryIcon />}
                delay={100}
              >
                Manage Equipment
              </ActionButton>
              <ActionButton 
                to="/admin/returns" 
                color="success" 
                icon={<RestoreIcon />}
                delay={200}
              >
                Manage Returns
              </ActionButton>
              <ActionButton 
                to="/admin/equipment-analytics" 
                color="info" 
                icon={<AssessmentIcon />}  // You'll need to import this icon
                delay={300}
              >
                Equipment Analytics
              </ActionButton>
            </DashboardCard>
          </Grid>

          {/* Booking Management Section */}
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard 
              title="Booking Management" 
              icon={<CalendarMonthIcon color="secondary" fontSize="medium" />}
            >
              <ActionButton 
                to="/admin/manage-bookings" 
                color="secondary" 
                icon={<EventAvailableIcon />}
                delay={150}
              >
                Manage Bookings
              </ActionButton>
              <ActionButton 
                to="/admin/borrowed-items" 
                color="info" 
                icon={<LocalShippingIcon />}
                delay={250}
              >
                View Borrowed Items
              </ActionButton>
              <ActionButton 
                to="/admin/current-borrowed-items" 
                color="warning" 
                icon={<AccessTimeIcon />}
                delay={350}
              >
                Currently Borrowed
              </ActionButton>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
          <DashboardCard 
            title="Trainer Management" 
            icon={<SportsMartialArtsIcon color="primary" fontSize="medium" />}
          >
            <ActionButton 
              to="/admin/trainers" 
              color="primary" 
              icon={<PeopleIcon />}
              delay={100}
            >
              Manage Trainers
            </ActionButton>
            <ActionButton 
              to="/admin/trainers/create" 
              color="success" 
              icon={<PersonIcon />}
              delay={200}
            >
              Add New Trainer
            </ActionButton>
          </DashboardCard>
        </Grid>

          {/* Notices Section */}
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard 
              title="Notifications" 
              icon={<CampaignIcon color="error" fontSize="medium" />}
            >
              <ActionButton 
                to="/admin/send-notices" 
                color="error" 
                icon={<CampaignIcon />}
                delay={200}
              >
                Send Notices
              </ActionButton>
            </DashboardCard>
          </Grid>

          {/* QR Code Management Section */}
          <Grid item xs={12} md={6} lg={3}>
            <DashboardCard 
              title="Attendance" 
              icon={<PersonIcon color="info" fontSize="medium" />}
            >
              <ActionButton 
                to="/admin/qr-code" 
                color="primary" 
                icon={<QrCodeIcon />}
                delay={250}
              >
                Generate Check-In QR
              </ActionButton>
            </DashboardCard>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}