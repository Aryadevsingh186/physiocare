import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/home";
import About from "./pages/About/about";
import Login from "./pages/Login/login"; 
import Dashboard from "./pages/Dashboard/dashboard"; 
import Progress from "./pages/Progress/progress";
import NeckRotation from "./pages/Exercises/neckrotation";  // exact path to your component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/neck-rotation" element={<NeckRotation />} />
      </Routes>
    </Router>
  );
}

export default App;
