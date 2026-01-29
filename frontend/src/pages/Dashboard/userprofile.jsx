import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./userprofile.css";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [tempUser, setTempUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setTempUser(res.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  function getInitials(name) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (!user) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  const handleEdit = () => {
    setEditing(true);
    setTempUser(user);
  };

  const handleCancel = () => {
    setEditing(false);
    setTempUser(user);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/user/update",
        tempUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(res.data.user);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const handleInputChange = (field, value) => {
    setTempUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-info-section">
            <div className="profile-avatar">{getInitials(user.name)}</div>
            <div className="profile-info">
              <h1>{user.name}</h1>
              <span className="profile-role">User</span>
              <div className="contact-info">
                <p>📧 {user.email}</p>
                <p>📞 {user.phone}</p>
              </div>
            </div>
          </div>
          <div className="header-buttons">
            <button
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Back
            </button>
            <button
              className="edit-button"
              onClick={() => (editing ? handleCancel() : handleEdit())}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
        <div>
          <div className="section-title">👤 Personal Information</div>
          <div className="section-description">
            Your basic account details
          </div>
          <div className="info-grid">
            <div>
              <label className="label">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  className="info-input"
                  value={tempUser.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              ) : (
                <div className="info-value">{user.name}</div>
              )}
            </div>
            <div>
              <label className="label">Email Address</label>
              {editing ? (
                <input
                  type="email"
                  className="info-input"
                  value={tempUser.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              ) : (
                <div className="info-value">{user.email}</div>
              )}
            </div>
            <div>
              <label className="label">Phone Number</label>
              {editing ? (
                <input
                  type="tel"
                  className="info-input"
                  value={tempUser.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              ) : (
                <div className="info-value">{user.phone}</div>
              )}
            </div>
            <div>
              <label className="label">Age</label>
              {editing ? (
                <input
                  type="number"
                  className="info-input"
                  value={tempUser.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                />
              ) : (
                <div className="info-value">{user.age} years</div>
              )}
            </div>
          </div>
          {editing && (
            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
