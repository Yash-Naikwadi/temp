import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login"; 
import UserDashboard from "./UserDashboard";
import DoctorDashboard from "./DoctorDashboard"; // ✅ Import the new doctor dashboard

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" />} /> 

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />

        {/* User Dashboard */}
        <Route path="/user" element={<UserDashboard />} />

        {/* ✅ Doctor Dashboard */}
        <Route path="/doctor" element={<DoctorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
