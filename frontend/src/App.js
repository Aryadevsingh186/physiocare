import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/home";
import About from "./pages/About/about";
import Login from "./pages/Login/login"; 
import Dashboard from "./pages/Dashboard/dashboard"; 
import Progress from "./pages/Progress/progress";
import BicepCurls from "./pages/Exercises/BicepCurls";
import Squats from "./pages/Exercises/Squats";
import Report from "./pages/Report/report";
import ReportTest from "./pages/ReportTest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/BicepCurls" element={<BicepCurls />} />
        <Route path="/Squats" element={<Squats />} />
        <Route path="/report" element={<Report />} />
        <Route path="/report-test" element={<ReportTest />} />
      </Routes>
    </Router>
  );
}

export default App;
