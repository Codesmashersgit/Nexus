
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext);

    // Check if token exists in localStorage as an extra precaution or if the context hasn't loaded yet
    const token = localStorage.getItem("authToken");

    if (!isLoggedIn && !token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
