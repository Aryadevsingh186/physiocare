import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [role, setRole] = useState("patient"); // ✅ FIXED
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("M");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role, // will now be 'patient' or 'doctor'
          age: age ? parseInt(age) : null,
          gender,
          phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server error. Please try again.");
    }

    setLoading(false);
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
      <form onSubmit={handleSubmit} style={formStyle}>
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={backButtonStyle}
        >
          ← Back
        </button>

        <h2 style={headingStyle}>Create Account</h2>

        <div style={fieldContainer}>
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
            placeholder="example@email.com"
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
            <option value="patient">Patient</option>
            <option value="doctor">Doctor / Physio</option>
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

        <button type="submit" disabled={loading} style={submitButtonStyle}>
          {loading ? "Registering..." : "Register"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={secondaryButtonStyle}
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
};

/* ------------------ Styles ------------------ */

const formStyle = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  padding: "36px 32px",
  width: "100%",
  maxWidth: "410px",
  display: "flex",
  flexDirection: "column",
};

const fieldContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const inputStyle = {
  border: "1px solid #ddd",
  borderRadius: "6px",
  padding: "10px 12px",
  fontSize: "1rem",
};

const backButtonStyle = {
  background: "#0D0D16",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  width: "fit-content",
  fontWeight: "500",
  marginBottom: "16px",
  cursor: "pointer",
};

const submitButtonStyle = {
  background: "#181822",
  color: "#fff",
  borderRadius: "6px",
  padding: "13px 0",
  fontSize: "1.1rem",
  border: "none",
  marginTop: "20px",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  marginTop: "12px",
  background: "#fff",
  border: "1px solid #e5e5e7",
  color: "#232323",
  borderRadius: "6px",
  padding: "11px 0",
  fontSize: "1.1rem",
  cursor: "pointer",
};

const headingStyle = {
  textAlign: "center",
  fontWeight: "600",
  marginBottom: "22px",
  fontSize: "1.9rem",
};

export default Register;