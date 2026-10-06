import axios from "axios";
import { useState } from "react";
import { notifyError, notifySuccess } from "./notify";
import "./civic.css";

const CreatePoll = ({ userData, onLogout, onNavigate }) => {
  const user = userData || {};
  const displayName = user.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = user.email || '';
  const userLocation = user.location || 'Your City';
  const userRole = user.role === "admin" ? "Admin" : user.role === "official" ? "Unverified Official" : "Citizen";

  const [formData, setFormData] = useState({
    question: "",
    description: "",
    state: "",
    city: "",
    closesOn: "",
  });

  const [options, setOptions] = useState([
    { id: 1, text: "" },
    { id: 2, text: "" }
  ]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const indianStates = [
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (id, value) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text: value } : opt));
  };

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: Date.now(), text: "" }]);
    }
  };

  const handleRemoveOption = (id) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim()) {
      notifyError("Please enter a poll question");
      return;
    }
    if (!formData.state) {
      notifyError("Please select a state");
      return;
    }
    if (!formData.city.trim()) {
      notifyError("Please enter a city");
      return;
    }
    if (!formData.closesOn) {
      notifyError("Please select a closing date");
      return;
    }

    const filledOptions = options.filter(opt => opt.text.trim() !== "");
    if (filledOptions.length < 2) {
      notifyError("Please provide at least 2 poll options");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        notifyError("Please login again to create a poll");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/polls/create",
        {
          question: formData.question,
          description: formData.description,
          state: formData.state,
          city: formData.city,
          closesOn: formData.closesOn,
          options: filledOptions.map((opt) => opt.text),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      notifySuccess("Poll created successfully");
      setTimeout(() => {
        onNavigate("polls");
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create poll";
      notifyError(message);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        if (typeof onLogout === "function") {
          onLogout();
        }
      }
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
          <a onClick={() => onNavigate("petitions")}>Petitions</a>
          <a className="active">Polls</a>
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
                <button className="profile-menu-item danger" onClick={() => { setShowProfileMenu(false); onLogout(); }}>
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
              {userEmail && (
                <div className="info-row muted">
                  {userEmail}
                </div>
              )}
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
            <button className="menu-item" onClick={() => onNavigate("petitions")}>
              <span className="menu-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16v12H4z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 7l2-3h4l2 3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Petitions
            </button>
            <button className="menu-item active">
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

          <button className="logout-btn" onClick={onLogout}>
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
            <button className="btn-back" onClick={() => onNavigate("polls")}>
              ← Back to Polls
            </button>
            <h1>Create a Poll</h1>
            <p>Gather opinions from your community on important issues.</p>
          </section>

          {/* Important Information Banner */}
          <div className="info-banner">
            <div className="info-banner-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h4>Important Information</h4>
              <p>Design your poll carefully. Once created, options cannot be modified. Ensure your question is clear and options are comprehensive.</p>
            </div>
          </div>

          <form className="create-petition-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Poll Details</h3>
              
              <div className="form-group">
                <label htmlFor="question">Poll Question *</label>
                <input
                  type="text"
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Enter your poll question"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Provide additional context for your poll"
                ></textarea>
              </div>
            </div>

            <div className="form-section">
              <h3>Poll Options</h3>
              <p className="form-hint">Add 2-10 options for voters to choose from.</p>
              
              <div className="poll-options-list">
                {options.map((option, index) => (
                  <div key={option.id} className="poll-option-input-group">
                    <label>Option {index + 1}</label>
                    <div className="poll-option-input-wrapper">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        placeholder={`Enter option ${index + 1}`}
                        required={index < 2}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          className="btn-remove-option"
                          onClick={() => handleRemoveOption(option.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {options.length < 10 && (
                <button type="button" className="btn-add-option" onClick={handleAddOption}>
                  + Add Option
                </button>
              )}
            </div>

            <div className="form-section">
              <h3>Location & Timing</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="state">Target State *</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="closesOn">Closes On *</label>
                <input
                  type="date"
                  id="closesOn"
                  name="closesOn"
                  value={formData.closesOn}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => onNavigate("polls")}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Create Poll
              </button>
            </div>
          </form>
        </main>
      </div>

    </div>
  );
};

export default CreatePoll;
