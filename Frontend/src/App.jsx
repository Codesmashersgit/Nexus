
import React from "react";
// import { useState } from "react";
import './App.css';
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./user/Dashboard"; 
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Room from "./user/Room";
import Demo from './pages/Analytics';
import Pricing from "./pages/Pricing";

function Layout() {
  const location = useLocation();

  const hideNavbarRoutes = ["/room"];

  // Check if current path includes any of those (support dynamic room ids)
  const shouldHideNavbar = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!shouldHideNavbar && <Navbar/>}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/analytics" element={<Demo/>}/>
        <Route path="/pricing" element={<Pricing/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-Password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
