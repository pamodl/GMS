import React from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import CheckInOut from './pages/CheckIn'
import ManageEquipment from './pages/ManageEquipment'
import ViewEquipment from './pages/ViewEquipment'
import Header from './components/Header'
import Profile from './pages/profile'
export default function App() {
  return (
    <BrowserRouter>
      <Header/>
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/manage-equipment" element={<ManageEquipment />} />
        <Route path="/check-in-out" element={<CheckInOut />} />
        <Route path="/view-equipment" element={<ViewEquipment />} />
        <Route path="profile" element={<Profile />} />

      </Routes>
    
  </BrowserRouter>
  )
}
