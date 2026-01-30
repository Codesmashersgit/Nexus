
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext);

    // Check if token exists in localStorage as an extra precaution or if the context hasn't loaded yet
    const token = localStorage.getItem("authToken");

    // Guest Auth Logic
    const guestName = localStorage.getItem("guestName");
    const guestRoom = localStorage.getItem("guestRoom");
    const currentPath = window.location.pathname;
    const isRoomPath = currentPath.startsWith("/room/");
    const pathRoomId = isRoomPath ? currentPath.split("/").pop() : null;

    const isGuestAuthorized = guestName && guestRoom && pathRoomId === guestRoom;

    if (!isLoggedIn && !token && !isGuestAuthorized) {
        if (isRoomPath && pathRoomId) {
            return <Navigate to={`/room-access/${pathRoomId}`} replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
