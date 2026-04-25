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
import DoctorPortal from "./pages/DoctorPortal/DoctorPortal";
import PostureCheckPage from "./pages/Exercises/instructions.jsx";
import LegExtension from "./pages/Exercises/LegExtention.jsx";
import NeckExercisePostureCheckPage from "./pages/Exercises/posture/NeckExercisePostureCheckPage";
import LegExtensionPostureCheckPage from "./pages/Exercises/posture/LegExtensionPostureCheckPage";
import SquatPostureCheckPage from "./pages/Exercises/posture/SquatPostureCheckPage.jsx";
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
        <Route path="/doctor-portal" element={<DoctorPortal />} />
        <Route path="/posture" element={<SquatPostureCheckPage/>} />
       <Route path="/LegExtention" element={<LegExtension />} />

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
