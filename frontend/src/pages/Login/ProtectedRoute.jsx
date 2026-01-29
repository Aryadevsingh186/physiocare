// src/pages/Login/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token"); // check JWT token presence
  const location = useLocation();

  if (!token) {
    // if no token, redirect to login and save current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // if logged in, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
