import React, { useState,useEffect } from 'react'
import Login from './Components/Login'
import Register from './Components/Register'
import Dashboard from './Components/Dashboard'
import Home from './Components/Home'
import { BrowserRouter, Routes, Route, Link, Navigate  } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { verifyToken } from './services/api.js'; 
// import { useNavigate } from 'react-router-dom'

import "./App.css"
import VerifyMail from './Components/VerifyMail.jsx'

const App = () => {
const [user,setUser]=useState(null)


  return (
    <GoogleOAuthProvider clientId='659129986863-t5of1n9di4b9navu5ctp6n8gntblo1db.apps.googleusercontent.com'>
   <BrowserRouter>
   <nav className='navbar'>
    <Link to="/">Home</Link>  <Link to="/login">Login</Link>  <Link to="/signup">Signup</Link>
   </nav>
   
   <Routes>
    <Route path="/" element={<Home />}/>
    <Route path="/login" element={<Login />}/>
    <Route path="/signup" element={<Register setUser={setUser} />} />
   <Route path="/dashboard" element={<Dashboard />} />
   <Route path="/verifyMail" element={<VerifyMail />} />
   
   </Routes>
   </BrowserRouter>
   </GoogleOAuthProvider>
  )
}

export default App




