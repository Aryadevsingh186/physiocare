import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("M");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, age, gender, phone }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Registration successful");
      navigate("/login");
    } else {
      alert("Registration failed: " + data.message);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#F7F8FA",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          padding: "36px 32px",
          width: "100%",
          maxWidth: "410px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            background: "#0D0D16",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            width: "fit-content",
            fontWeight: "500",
            marginBottom: "16px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        {/* Heading */}
        <h2
          style={{
            textAlign: "center",
            fontWeight: "600",
            marginBottom: "22px",
            fontSize: "1.9rem",
          }}
        >
          Create Account
        </h2>

        {/* Input Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your full name"
            style={inputStyle}
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="patient@example.com"
            style={inputStyle}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            style={inputStyle}
          />

          <label>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={inputStyle}
          >
            <option value="user">Patient</option>
            <option value="doctor">Doctor/Physio</option>
          </select>

          <label>Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            style={inputStyle}
          />

          <label>Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={inputStyle}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            style={inputStyle}
          />
        </div>

        {/* Register Button */}
        <button
          type="submit"
          style={{
            background: "#181822",
            color: "#fff",
            borderRadius: "6px",
            padding: "13px 0",
            fontSize: "1.1rem",
            border: "none",
            marginTop: "20px",
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          Register
        </button>

        {/* Login Redirect */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            marginTop: "12px",
            background: "#fff",
            border: "1px solid #e5e5e7",
            color: "#232323",
            borderRadius: "6px",
            padding: "11px 0",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
};

// Reusable input styling
const inputStyle = {
  border: "1px solid #ddd",
  borderRadius: "6px",
  padding: "10px 12px",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.3s ease",
};

export default Register;
