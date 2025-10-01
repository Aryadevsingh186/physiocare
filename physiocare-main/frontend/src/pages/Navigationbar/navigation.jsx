import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();

  // Toggle link text based on current path:
  const homeAboutLink = location.pathname === "/about" 
    ? { path: "/", label: "Home" } 
    : { path: "/about", label: "About" };

  return (
    <header style={{
      background: "#fff",
      color: "#232323",
      padding: "10px 0",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      textAlign: "center",
      borderBottom: "1px solid #eee"
    }}>
      <nav style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: "36px",
        paddingRight: "36px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.png" alt="logo" style={{ width: "40px", height: "40px" }} />
          <span style={{ fontWeight: 600 }}>PhysioCare</span>
        </div>
        <div>
          <Link to={homeAboutLink.path} style={{ margin: "0 16px", color: "#232323", textDecoration: "none" }}>
            {homeAboutLink.label}
          </Link>
          <Link to="/pricing" style={{ margin: "0 16px", color: "#232323", textDecoration: "none" }}>
            Pricing
          </Link>
          <Link to="/contact" style={{ margin: "0 16px", color: "#232323", textDecoration: "none" }}>
            Contact
          </Link>
          <Link to="/login" style={{
            background: "#1496f3",
            color: "#fff",
            borderRadius: "6px",
            padding: "8px 18px",
            fontWeight: "500",
            marginLeft: "12px",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-block"
          }}>
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
