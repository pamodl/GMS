import React from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ManageEquipment from './pages/ManageEquipment'
import Header from './components/Header'
export default function App() {
  return (
    <BrowserRouter>
      <Header/>
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/manage-equipment" element={<ManageEquipment />} />
      </Routes>
    
  </BrowserRouter>
  )
}
