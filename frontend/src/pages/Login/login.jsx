import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

const Login = () => {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        alert("Login failed: " + (data.message || "Invalid credentials"));
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong: " + error.message);
    }
  };

  const selectedRoleStyle = {
    background: "#1496f3",
    color: "#fff",
    boxShadow: "0 1px 6px rgba(21,150,243,0.09)",
  };
  const unselectedRoleStyle = {
    background: "transparent",
    color: "#75757B",
  };

  return (
    <div
      style={{
        background: "#F7F8FA",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          position: "relative", // Needed for absolute positioning
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 1px 18px rgba(25,39,52,0.11)",
          padding: "38px 32px",
          width: "100%",
          maxWidth: "410px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Back button inside form, positioned at top left */}
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            fontSize: "1rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          aria-label="Go back to home"
        >
          ← Back
        </button>

        <h2
          style={{
            textAlign: "center",
            fontWeight: 600,
            marginBottom: "40px",
            fontSize: "2rem",
            letterSpacing: ".02em",
          }}
        >
          Welcome Back
        </h2>

        {/* Role selection */}
        <div
          style={{
            display: "flex",
            borderRadius: "9px",
            background: "#F7F8FA",
            marginBottom: "22px",
            overflow: "hidden",
            border: "1px solid #e7eaf0",
          }}
        >
          <button
            type="button"
            onClick={() => setRole("user")}
            style={{
              flex: 1,
              padding: "13px 0",
              border: "none",
              fontWeight: 500,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.3s",
              ...(role === "user" ? selectedRoleStyle : unselectedRoleStyle),
            }}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            style={{
              flex: 1,
              padding: "13px 0",
              border: "none",
              fontWeight: 500,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.3s",
              ...(role === "doctor" ? selectedRoleStyle : unselectedRoleStyle),
            }}
          >
            Doctor/Physio
          </button>
        </div>

        {/* Email */}
        <label style={{ fontWeight: 500, marginBottom: "6px", fontSize: "1.06rem" }}>
          Email
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#F7F8FA",
            borderRadius: "7px",
            padding: "10px 13px",
            marginBottom: "14px",
          }}
        >
          <FaEnvelope style={{ marginRight: "7px", color: "#a9a9b3" }} />
          <input
            type="email"
            placeholder="patient@example.com"
            style={{
              border: "none",
              background: "transparent",
              width: "100%",
              fontSize: "1.06rem",
              outline: "none",
            }}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <label style={{ fontWeight: 500, marginBottom: "6px", fontSize: "1.06rem" }}>
          Password
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#F7F8FA",
            borderRadius: "7px",
            padding: "10px 13px",
            marginBottom: "18px",
          }}
        >
          <FaLock style={{ marginRight: "7px", color: "#a9a9b3" }} />
          <input
            type="password"
            placeholder="••••••••"
            style={{
              border: "none",
              background: "transparent",
              width: "100%",
              fontSize: "1.06rem",
              outline: "none",
            }}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Sign In button */}
        <button
          type="submit"
          style={{
            background: "#181822",
            color: "#fff",
            fontWeight: 500,
            borderRadius: "6px",
            padding: "13px 0",
            fontSize: "1.13rem",
            border: "none",
            cursor: "pointer",
            marginBottom: "15px",
            boxShadow: "0 1px 8px rgba(25,39,52,0.07)",
          }}
        >
          Sign In
        </button>

        {/* Signup link */}
        <div
          style={{
            textAlign: "center",
            color: "#232323",
            fontSize: "1.05rem",
            marginBottom: "10px",
          }}
        >
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#1169f0", textDecoration: "none" }}>
            Sign up
          </Link>
        </div>

        {/* Forgot password */}
        <div
          style={{
            textAlign: "center",
            color: "#75757B",
            fontSize: "1.01rem",
            marginTop: "7px",
          }}
        >
          <Link to="/forgot-password" style={{ color: "#1169f0", textDecoration: "none" }}>
            Forgot your password?
          </Link>
        </div>

        {/* Social buttons */}
        <button
          type="button"
          style={{
            background: "#fff",
            border: "1px solid #e5e5e7",
            color: "#232323",
            borderRadius: "6px",
            padding: "11px 0",
            fontSize: "1.06rem",
            fontWeight: 500,
            marginBottom: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <FcGoogle size={21} />
          Continue with Google
        </button>
        <button
          type="button"
          style={{
            background: "#fff",
            border: "1px solid #e5e5e7",
            color: "#232323",
            borderRadius: "6px",
            padding: "11px 0",
            fontSize: "1.06rem",
            fontWeight: 500,
            marginBottom: "3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <FaFacebookF size={19} style={{ color: "#4064ac" }} />
          Continue with Facebook
        </button>
      </form>
    </div>
  );
};

export default Login;
