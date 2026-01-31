
import React from "react";
import './App.css';
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import OAuthSuccess from "./pages/OauthSuccess";
import Dashboard from "./user/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Room from "./user/Room";
import Demo from './pages/Analytics';
import Pricing from "./pages/Pricing";
// import RoomAccess from "./user/RoomAccess";
import ProtectedRoute from "./components/ProtectedRoute";

import { RTCProvider } from "./context/RTCContext";
function Layout() {
  const location = useLocation();

  const hideNavbarRoutes = ["/room"];

  const shouldHideNavbar = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <RTCProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<ProtectedRoute><Demo /></ProtectedRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/room/:roomId" element={<ProtectedRoute><Room /></ProtectedRoute>} />



        </Routes>
      </RTCProvider>
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
