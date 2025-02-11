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
        <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} roles={['admin']} />} />
        <Route path="/admin/equipment" element={<PrivateRoute element={<AdminEquipment />} roles={['admin']} />} />
        <Route path="/admin/manage-equipment" element={<PrivateRoute element={<ManageEquipment />} roles={['admin']} />} />
      </Routes>
    </BrowserRouter>
  );
}