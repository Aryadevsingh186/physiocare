import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

const Login = () => {
  const [role, setRole] = useState("Patient");
  const navigate = useNavigate();

  const selectedRoleStyle = {
    background: "#1496f3",
    color: "#fff",
    boxShadow: "0 1px 6px rgba(21,150,243,0.09)",
  };
  const unselectedRoleStyle = {
    background: "transparent",
    color: "#75757B",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: add authentication here
    // Navigate to Dashboard on successful login
    navigate("/dashboard");
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
        padding: "20px"
      }}
    >
      <header
        style={{
          width: "100%",
          maxWidth: "440px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <Link
          to="/"
          style={{
            color: "#232323",
            fontWeight: 500,
            textDecoration: "none",
            fontSize: "1.17rem",
          }}
        >
          ← Back to Home
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logo.png"
            alt="logo"
            style={{ width: "40px", height: "40px", borderRadius: "10px", objectFit: "cover" }}
          />
          <span style={{ fontWeight: 600, fontSize: "1.17rem" }}>PhysioCare</span>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{
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
        <h2
          style={{
            textAlign: "center",
            fontWeight: 600,
            marginBottom: "5px",
            fontSize: "2rem",
            letterSpacing: ".02em",
          }}
        >
          Welcome Back
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#7B7B88",
            fontSize: "1.13rem",
            marginBottom: "22px",
          }}
        >
          Sign in to continue your recovery
        </p>

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
            onClick={() => setRole("Patient")}
            style={{
              flex: 1,
              padding: "13px 0",
              border: "none",
              fontWeight: 500,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.3s",
              ...(role === "Patient" ? selectedRoleStyle : unselectedRoleStyle),
            }}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("Doctor")}
            style={{
              flex: 1,
              padding: "13px 0",
              border: "none",
              fontWeight: 500,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.3s",
              ...(role === "Doctor" ? selectedRoleStyle : unselectedRoleStyle),
            }}
          >
            Doctor/Physio
          </button>
        </div>

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
          />
        </div>

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
          />
        </div>

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

        <div
          style={{
            margin: "12px 0 2px 0",
            textAlign: "center",
            color: "#232323",
            fontSize: "1.05rem",
          }}
        >
          Don't have an account?{" "}
          <a href="#" style={{ color: "#1169f0", textDecoration: "none" }}>
            Sign up
          </a>
        </div>

        <div
          style={{
            textAlign: "center",
            color: "#75757B",
            fontSize: "1.01rem",
            marginTop: "7px",
          }}
        >
          <a href="#" style={{ color: "#1169f0", textDecoration: "none" }}>
            Forgot your password?
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
