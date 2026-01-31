
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext);
    const location = useLocation();

    // Check if token exists in localStorage as an extra precaution or if the context hasn't loaded yet
    const token = localStorage.getItem("authToken");

    if (!isLoggedIn && !token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
