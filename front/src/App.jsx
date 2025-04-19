import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CheckInOut from './pages/CheckIn';
import ManageEquipment from './pages/ManageEquipment';
import ViewEquipment from './pages/ViewEquipment';
import Header from './components/Header';
import Profile from './pages/profile';
import AdminDashboard from './components/AdminDashboard';
import AdminEquipment from './pages/AdminEquipment';
import BookEquipment from './pages/BookEquipment';
import ManageBookings from './pages/ManageBookings';
import UserDashboard from './pages/UserDashboard';
import SendNotices from './pages/SendNotices'; // Import Send Notices page
import Notices from './pages/Notices'; // Import Notices page
import AdminReturns from './pages/AdminReturns'; // Import Admin Returns page
import AdminBorrowedItems from './pages/AdminBorrowedItems'; // Import the new page
import AdminCurrentBorrowedItems from './pages/AdminCurrentBorrowedItems'; // Import the new page
import AdminCreateEquipment from './pages/AdminCreateEquipment'; // Import the new component
import AdminQRCode from './pages/AdminQRCode';
import AdminEditEquipment from './pages/AdminEditEquipment';
import AdminEquipmentAnalytics from './pages/AdminEquipmentAnalytics';
import AdminTrainersList from './pages/AdminTrainers';
import AdminCreateTrainer from './pages/AdminCreateTrainer';
import Trainers from './pages/Trainers';
import TrainerProfile from './pages/TrainerProfile';
import TrainerDashboard from './pages/TrainerDashboard';
import TrainerSchedule from './pages/TrainerSchedule'; 

const PrivateRoute = ({ element, roles, ...rest }) => {
  const currentUser = useSelector((state) => state.user.currentUser);
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }
  return element;
};

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/check-in-out" element={<CheckInOut />} />
        <Route path="/view-equipment" element={<ViewEquipment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/book-equipment" element={<BookEquipment />} />
        <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} roles={['admin']} />} />
        <Route path="/admin/equipment" element={<PrivateRoute element={<AdminEquipment />} roles={['admin']} />} />
        <Route path="/admin/manage-equipment" element={<PrivateRoute element={<ManageEquipment />} roles={['admin']} />} />
        <Route path="/admin/manage-bookings" element={<PrivateRoute element={<ManageBookings />} roles={['admin']} />} />
        <Route path="/admin/send-notices" element={<PrivateRoute element={<SendNotices />} roles={['admin']} />} />
        <Route path="/notices" element={<PrivateRoute element={<Notices />} />} />
        <Route path="/admin/returns" element={<PrivateRoute element={<AdminReturns />} roles={['admin']} />} /> 
        <Route path="/admin/current-borrowed-items" element={<PrivateRoute element={<AdminCurrentBorrowedItems />} roles={['admin']} />}/>
        <Route path="/admin/borrowed-items" element={<PrivateRoute element={<AdminBorrowedItems />} roles={['admin']} />} />
        <Route path="/admin/equipment/create" element={<PrivateRoute element={<AdminCreateEquipment />} roles={['admin']} />} /> 
        <Route path="/admin/qr-code" element={<PrivateRoute element={<AdminQRCode />} roles={['admin']} />} />
        <Route path="/admin/edit-equipment/:id" element={<PrivateRoute element={<AdminEditEquipment />} roles={['admin']} />} />
        <Route path="/admin/equipment-analytics" element={<PrivateRoute element={<AdminEquipmentAnalytics />} roles={['admin']} />} />
        <Route path="/admin/trainers" element={<PrivateRoute element={<AdminTrainersList />} roles={['admin']} />} />
        <Route path="/admin/trainers/create" element={<PrivateRoute element={<AdminCreateTrainer />} roles={['admin']} />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/trainers/:id" element={<TrainerProfile />} />
        <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
        <Route path="/trainer/schedule" element={<TrainerSchedule />} />

      </Routes>
    </BrowserRouter>
  );
}