import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/home";
import About from "./pages/About/about";
import Login from "./pages/Login/login"; 
import Dashboard from "./pages/Dashboard/dashboard"; 
import Progress from "./pages/Progress/progress";
import BicepCurls from "./pages/Exercises/BicepCurls";
import Squats from "./pages/Exercises/Squats";
import Neck from "./pages/Exercises/Neck";
import Report from "./pages/Report/report";
import ReportTest from "./pages/ReportTest";
import Register from "./pages/Login/register";
import ProtectedRoute from "./pages/Login/ProtectedRoute";
import UserProfile from "./pages/Dashboard/userprofile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/BicepCurls" element={<BicepCurls />} />
        <Route path="/Squats" element={<Squats />} />
        <Route path="/Neck" element={<Neck />} />
        <Route path="/report" element={<Report />} />
        <Route path="/report-test" element={<ReportTest />} />

        {/* Protected routes wrapper */}
        {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/userprofile" element={<UserProfile/>}></Route>
        {/* </Route> */}
      </Routes>
    </Router>
  );
}

export default App;
