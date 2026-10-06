import axios from "axios";
import { useState } from "react";
import { notifyError, notifySuccess } from "./notify";
import "./civic.css";

const CreatePetition = ({ userData, onNavigate }) => {
  const user = userData || {};
  const displayName = user.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = user.email || '';
  const userLocation = user.location || 'Bangalore';
  const userRole = user.role === "admin" ? "Admin" : user.role === "official" ? "Unverified Official" : "Citizen";

  // Indian locations
  const indianLocations = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Ladakh",
    "Jammu & Kashmir",
  ];

  const [formData, setFormData] = useState({
    title: "",
    category: "Environment",
    state: userLocation,
    city: "",
    signatureGoal: 100,
    description: "",
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        notifyError("Please login again to create a petition");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/petitions/create",
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.state,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      notifySuccess("Petition created successfully");
      onNavigate("petitions");
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to create petition");
    }
  };

  return (
    <div className="dashboard-page">
      {/* Topbar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 11.5L12 4l8 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 10.5v8h10v-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="brand-name">Civix</span>
          <span className="beta-pill">Beta</span>
        </div>

        <nav className="topnav">
          <a onClick={() => onNavigate("dashboard")}>Home</a>
          <a onClick={() => onNavigate("petitions")} className="active">
            Petitions
          </a>
          <a onClick={() => onNavigate("polls")}>Polls</a>
          <a onClick={() => onNavigate("reports")}>Reports</a>
        </nav>

        <div className="top-actions">
          <button className="icon-btn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M15 17H5l1.5-2V10a5.5 5.5 0 0111 0v5L19 17h-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 19a2 2 0 004 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="profile-dropdown">
            <div className="profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="avatar">{userInitial}</div>
              <span className="user-name">{displayName}</span>
              <span className="chevron" aria-hidden="true">v</span>
            </div>
            
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="avatar lg">{userInitial}</div>
                  <div>
                    <div className="menu-user-name">{displayName}</div>
                    <div className="menu-user-email">{userEmail}</div>
                    <div className="menu-user-role">{userRole}</div>
                  </div>
                </div>
                <div className="profile-menu-divider"></div>
                <button className="profile-menu-item" onClick={() => { setShowProfileMenu(false); onNavigate("settings"); }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M19 12a7 7 0 01-.2 1.6l2 1.6-2 3.4-2.3-.8a7 7 0 01-2.7 1.6l-.4 2.4H10l-.4-2.4a7 7 0 01-2.7-1.6l-2.3.8-2-3.4 2-1.6A7 7 0 014 12a7 7 0 01.2-1.6l-2-1.6 2-3.4 2.3.8a7 7 0 012.7-1.6L10 2h4l.4 2.4a7 7 0 012.7 1.6l2.3-.8 2 3.4-2 1.6c.1.5.2 1 .2 1.6z" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                  Settings
                </button>
                <button className="profile-menu-item" onClick={() => { setShowProfileMenu(false); onNavigate("help"); }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M9.5 9.5a2.5 2.5 0 014 2c0 1.5-2 1.5-2 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="12" cy="17" r="1" fill="currentColor"/>
                  </svg>
                  Help & Support
                </button>
                <div className="profile-menu-divider"></div>
                <button className="profile-menu-item danger" onClick={() => { setShowProfileMenu(false); onNavigate("settings"); }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="profile-card">
            <div className="profile-top">
              <div className="avatar lg">{userInitial}</div>
              <div>
                <h4>{displayName}</h4>
                <p>{userRole}</p>
              </div>
            </div>
            <div className="profile-info">
              <div className="info-row">
                <span className="info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21s6-6.2 6-11a6 6 0 10-12 0c0 4.8 6 11 6 11z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <span>{userLocation}</span>
              </div>
              <div className="info-row muted">
                {userEmail}
              </div>
            </div>
          </div>

          <div className="menu">
            <button className="menu-item" onClick={() => onNavigate("dashboard")}>
              <span className="menu-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 11.5L12 4l8 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 10.5v8h10v-8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Dashboard
            </button>
            <button className="menu-item active" onClick={() => onNavigate("petitions")}>
              <span className="menu-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M5 8h8M5 12h8M5 16h6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              Petitions
            </button>
            <button className="menu-item" onClick={() => onNavigate("polls")}>
              <span className="menu-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h4v7H5v-7zM10 5h4v14h-4V5zM15 9h4v10h-4V9z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              Polls
            </button>
            <button className="menu-item" onClick={() => onNavigate("officials")}>
              <span className="menu-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 11a4 4 0 10-8 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 20a6 6 0 0112 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              Officials
            </button>
            <button className="menu-item" onClick={() => onNavigate("reports")}>
              <span className="menu-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 4h12v16H6z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M9 8h6M9 12h6M9 16h4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              Reports
            </button>
            <button className="menu-item" onClick={() => onNavigate("settings")}>
              <span className="menu-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M19 12a7 7 0 01-.2 1.6l2 1.6-2 3.4-2.3-.8a7 7 0 01-2.7 1.6l-.4 2.4H10l-.4-2.4a7 7 0 01-2.7-1.6l-2.3.8-2-3.4 2-1.6A7 7 0 014 12a7 7 0 01.2-1.6l-2-1.6 2-3.4 2.3.8a7 7 0 012.7-1.6L10 2h4l.4 2.4a7 7 0 012.7 1.6l2.3-.8 2 3.4-2 1.6c.1.5.2 1 .2 1.6z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              Settings
            </button>
          </div>

          <div className="help-card" onClick={() => onNavigate("help")}>
            <span className="menu-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M9.5 9.5a2.5 2.5 0 014 2c0 1.5-2 1.5-2 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
            </span>
            Help & Support
          </div>

          <button className="logout-btn">
            <span className="menu-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="content">
          <section className="create-petition-header">
            <h1>Create a New Petition</h1>
            <p>Share your voice and make a difference in your community</p>
          </section>

          {/* Warning Banner */}
          <div className="warning-banner">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>Important Information</strong>
              <p>Please ensure all information is accurate. Petitions are reviewed before publication.</p>
            </div>
          </div>

          {/* Create Petition Form */}
          <form className="create-petition-form" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">Petition Title</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter a clear, concise title for your petition"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option>Environment</option>
                <option>Infrastructure</option>
                <option>Education</option>
                <option>Public Safety</option>
                <option>Transportation</option>
                <option>Healthcare</option>
                <option>Housing</option>
                <option>Other</option>
              </select>
            </div>

            {/* State */}
            <div className="form-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              >
                {indianLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Signature Goal */}
            <div className="form-group">
              <label htmlFor="signatureGoal">Signature Goal</label>
              <input
                type="number"
                id="signatureGoal"
                name="signatureGoal"
                min="1"
                value={formData.signatureGoal}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your petition in detail. Why is this important? What change do you want to see?"
                rows="8"
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Create Petition
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => onNavigate("petitions")}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CreatePetition;