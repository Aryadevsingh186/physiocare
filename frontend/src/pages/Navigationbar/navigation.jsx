import React from "react";
import logo from '../../assets/logo.png'; 
import { NavLink, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();

  // Toggle link text based on current path:
  const homeAboutLink =
    location.pathname === "/about"
      ? { path: "/", label: "Home" }
      : { path: "/about", label: "About" };

  // Active link style function
  const activeLinkStyle = {
    color: "#1496f3",
    fontWeight: "600",
    textDecoration: "underline",
  };

  const defaultLinkStyle = {
    color: "#232323",
    textDecoration: "none",
    margin: "0 16px",
  };

  return (
    <header
      style={{
        background: "#fff",
        color: "#232323",
        padding: "10px 0",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        textAlign: "center",
        borderBottom: "1px solid #eee",
      }}
    >
      <nav
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "36px",
          paddingRight: "36px",
        }}
      >
        {/* Logo Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logo.jpg"
            alt="logo"
            style={{ width: "40px", height: "40px", borderRadius: 6 }}
          />
          <span style={{ fontWeight: 600, fontSize: "1.2rem" }}>PhysioCare</span>
        </div>

        {/* Links */}
        <div>
          <NavLink
            to={homeAboutLink.path}
            style={({ isActive }) =>
              isActive ? { ...activeLinkStyle, margin: "0 16px" } : defaultLinkStyle
            }
          >
            {homeAboutLink.label}
          </NavLink>

          <NavLink
            to="/pricing"
            style={({ isActive }) =>
              isActive ? { ...activeLinkStyle, margin: "0 16px" } : defaultLinkStyle
            }
          >
            Pricing
          </NavLink>

          <NavLink
            to="/contact"
            style={({ isActive }) =>
              isActive ? { ...activeLinkStyle, margin: "0 16px" } : defaultLinkStyle
            }
          >
            Contact
          </NavLink>

          <NavLink
            to="/login"
            style={{
              background: "#1496f3",
              color: "#fff",
              borderRadius: "6px",
              padding: "8px 18px",
              fontWeight: "500",
              marginLeft: "12px",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Sign In
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
