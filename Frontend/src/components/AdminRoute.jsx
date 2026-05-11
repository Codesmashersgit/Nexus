
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const AdminRoute = ({ children }) => {
    const { isLoggedIn, user } = useContext(AuthContext);
    const location = useLocation();

    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (!isLoggedIn && !token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (role !== 'admin' && user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;
