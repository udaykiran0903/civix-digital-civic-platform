import axios from "axios";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
);

import { useEffect, useState } from "react";
import "./civic.css";
import { notifyError, notifySuccess } from "./notify";

const Polls = ({ userData, onLogout, onNavigate }) => {
  const user = userData || {};
  const displayName = user.name || "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = user.email || "";
  const userId = user._id || "";
  const userLocation = user.location || "Your City";
  const isOfficialUser = ["official", "admin"].includes(user.role);
  const userRole = user.role === "admin" ? "Admin" : isOfficialUser ? "Unverified Official" : "Citizen";

  const [activeTab, setActiveTab] = useState("active");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pollsData, setPollsData] = useState([]);

  const normalizeStatus = (status) =>
    String(status || "")
      .trim()
      .toLowerCase();

  const isPollExpired = (closesOn) => {
    if (!closesOn) return false;
    const closeDate = new Date(`${closesOn}T23:59:59`);
    if (Number.isNaN(closeDate.getTime())) return false;
    return Date.now() > closeDate.getTime();
  };

  const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

  const getCreatorId = (poll) => {
    if (!poll?.creator) return "";
    if (typeof poll.creator === "string") return poll.creator;
    return poll.creator._id || "";
  };

  const hasVotedPoll = (poll) => {
    if (!Array.isArray(poll?.votedBy) || !userId) return false;
    return poll.votedBy.some((id) => String(id) === String(userId));
  };

  const fetchPolls = async () => {
    const token = localStorage.getItem("token");
    const endpoint = isOfficialUser
      ? "http://localhost:5000/api/polls/official/locality"
      : "http://localhost:5000/api/polls/all";

    const config = isOfficialUser
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const res = await axios.get(endpoint, config);
    const list = Array.isArray(res.data) ? res.data : [];
    setPollsData(list);
    return list;
  };

  useEffect(() => {
    const loadPolls = async () => {
      try {
        await fetchPolls();
      } catch (error) {
        console.log(error);
      }
    };

    loadPolls();
  }, [isOfficialUser]);

  // Indian locations
  const indianLocations = [
    "All Locations",
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

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm("Are you sure you want to delete this poll?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/polls/delete/${pollId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPollsData((prev) => prev.filter((poll) => poll._id !== pollId));
      setSelectedPoll(null);
      notifySuccess("Poll deleted successfully");
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to delete poll");
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `http://localhost:5000/api/polls/vote/${pollId}`,
        { optionIndex },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const updatedPoll = res.data?.poll;
      if (updatedPoll) {
        setPollsData((prev) =>
          prev.map((poll) => (poll._id === pollId ? updatedPoll : poll)),
        );
        setSelectedPoll(updatedPoll);
        notifySuccess("Vote submitted successfully");
      } else {
        await fetchPolls();
        notifySuccess("Vote submitted successfully");
      }
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to vote");
    }
  };

  const handleClosePoll = async (pollId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `http://localhost:5000/api/polls/close/${pollId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const closedPoll = res.data?.poll;
      if (closedPoll) {
        setPollsData((prev) =>
          prev.map((poll) => (poll._id === pollId ? closedPoll : poll)),
        );
        setSelectedPoll(closedPoll);
        notifySuccess("Poll closed successfully");
      }
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to close poll");
    }
  };

  const polls = pollsData;

  const filteredPolls = polls.filter((poll) => {
    const effectiveStatus =
      normalizeStatus(poll.status) === "closed" || isPollExpired(poll.closesOn)
        ? "closed"
        : "active";

    // Filter by tab
    if (activeTab === "my" && String(getCreatorId(poll)) !== String(userId))
      return false;
    if (activeTab === "voted" && !hasVotedPoll(poll)) return false;
    if (activeTab === "closed" && effectiveStatus !== "closed") return false;
    if (activeTab === "active" && effectiveStatus === "closed") return false;

    // Filter by location
    if (selectedLocation !== "All Locations" && poll.state !== selectedLocation)
      return false;

    return true;
  });

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
            <div
              className="profile-trigger"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="avatar">{userInitial}</div>
              <span className="user-name">{displayName}</span>
              <span className="chevron" aria-hidden="true">
                v
              </span>
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
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate("settings");
                  }}
                >
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
                  Settings
                </button>
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate("help");
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M9.5 9.5a2.5 2.5 0 014 2c0 1.5-2 1.5-2 3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="17" r="1" fill="currentColor" />
                  </svg>
                  Help & Support
                </button>
                <div className="profile-menu-divider"></div>
                <button
                  className="profile-menu-item danger"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                >
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
                    <circle
                      cx="12"
                      cy="10"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <span>{userLocation}</span>
              </div>
              {userEmail && <div className="info-row muted">{userEmail}</div>}
            </div>
          </div>

          <div className="menu">
            <button
              className="menu-item"
              onClick={() => onNavigate("dashboard")}
            >
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
            <button
              className="menu-item"
              onClick={() => onNavigate("petitions")}
            >
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
            <button
              className="menu-item"
              onClick={() => onNavigate("officials")}
            >
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
            <button
              className="menu-item"
              onClick={() => onNavigate("settings")}
            >
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
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
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
          <section className="petition-header">
            <h1>Polls</h1>
            <p>Participate in community polls and make your voice heard.</p>
            <button
              className="btn-create"
              onClick={() => onNavigate("create-poll")}
            >
              + Create Poll
            </button>
          </section>

          {/* Tabs */}
          <div className="petition-tabs">
            <button
              className={`petition-tab ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Active Polls
            </button>
            <button
              className={`petition-tab ${activeTab === "voted" ? "active" : ""}`}
              onClick={() => setActiveTab("voted")}
            >
              Polls I Voted On
            </button>
            <button
              className={`petition-tab ${activeTab === "my" ? "active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Polls
            </button>
            <button
              className={`petition-tab ${activeTab === "closed" ? "active" : ""}`}
              onClick={() => setActiveTab("closed")}
            >
              Closed Polls
            </button>
          </div>

          {/* Filters */}
          <div className="petition-filters">
            <div className="filter-group">
              <svg className="filter-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s6-6.2 6-11a6 6 0 10-12 0c0 4.8 6 11 6 11z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {indianLocations.map((location) => (
                  <option key={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Polls Grid */}
          <div className="petitions-grid">
            {filteredPolls.length === 0 ? (
              <div className="empty-state">
                <p>No polls found. Be the first to create one!</p>
              </div>
            ) : (
              filteredPolls.map((poll) => (
                <div key={poll._id} className="petition-card">
                  <div className="petition-status-bar"></div>
                  <div className="petition-time">{formatDate(poll.createdAt)}</div>
                  <h3>{poll.question}</h3>
                  <p className="petition-desc">{poll.state}</p>
                  <div className="petition-footer">
                    <div className="signature-info">
                      <span>{poll.options?.length || 0} options</span>
                      <span className="status-badge">
                        {normalizeStatus(poll.status) === "closed" ||
                        isPollExpired(poll.closesOn)
                          ? "Closed"
                          : "Active"}
                      </span>
                    </div>
                    <button
                      className="btn-view-details"
                      onClick={() => setSelectedPoll(poll)}
                    >
                      View & Vote
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom CTA */}
          <section className="petition-cta">
            <h2>Have a question for your community?</h2>
            <button
              className="btn-create-large"
              onClick={() => onNavigate("create-poll")}
            >
              Create a Poll
            </button>
          </section>
        </main>
      </div>

      {/* Poll Details Modal */}
      {selectedPoll && (
        <div className="modal-overlay" onClick={() => setSelectedPoll(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedPoll(null)}
            >
              ✕
            </button>

            <div className="modal-header">
              <h2>{selectedPoll.question}</h2>
              <span className="status-badge-modal">
                {normalizeStatus(selectedPoll.status) === "closed" ||
                isPollExpired(selectedPoll.closesOn)
                  ? "Closed"
                  : "Active"}
              </span>
            </div>

            <div className="modal-meta">
              <div className="meta-item-modal">
                <span className="meta-label">Location</span>
                <span className="meta-value">
                  {selectedPoll.city}, {selectedPoll.state}
                </span>
              </div>
              <div className="meta-item-modal">
                <span className="meta-label">Created</span>
                <span className="meta-value">{formatDate(selectedPoll.createdAt)}</span>
              </div>
              <div className="meta-item-modal">
                <span className="meta-label">Closes On</span>
                <span className="meta-value">{formatDate(selectedPoll.closesOn)}</span>

              </div>
            </div>

            {selectedPoll.description && (
              <div className="modal-description">
                <h3>Description</h3>
                <p>{selectedPoll.description}</p>
              </div>
            )}

            <div className="poll-options-container">
              <h3>Poll Options</h3>
              {selectedPoll.options?.map((option, index) => {
                const totalVotes = selectedPoll.options.reduce(
                  (sum, opt) => sum + (opt.votes || 0),
                  0,
                );
                const percentage =
                  totalVotes > 0
                    ? (((option.votes || 0) / totalVotes) * 100).toFixed(1)
                    : 0;
                const hasVoted = hasVotedPoll(selectedPoll);

                return (
                  <div key={index} className="poll-option">
                    <div className="poll-option-header">
                      <span className="poll-option-text">{option.text}</span>
                      <span className="poll-option-percentage">
                        {percentage}%
                      </span>
                    </div>
                    <div className="poll-option-bar">
                      <div
                        className="poll-option-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="poll-option-votes">
                      {option.votes || 0} votes
                    </div>
                    {!hasVoted &&
                      normalizeStatus(selectedPoll.status) !== "closed" &&
                      !isPollExpired(selectedPoll.closesOn) && (
                        <button
                          className="btn-vote"
                          onClick={() => {
                            handleVote(selectedPoll._id, index);
                          }}
                        >
                          Vote
                        </button>
                      )}
                  </div>
                );
              })}
            </div>

            {/* Poll Analytics */}
            <div style={{ marginTop: "30px" }}>
              <h3>Poll Analytics</h3>

              <div
                style={{
                  display: "flex",
                  gap: "40px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {/* Bar Chart */}
                <div style={{ width: "400px" }}>
                  <Bar
                    data={{
                      labels: selectedPoll.options.map((o) => o.text),
                      datasets: [
                        {
                          label: "Votes",
                          data: selectedPoll.options.map((o) => o.votes || 0),
                          backgroundColor: "#3b82f6",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </div>

                {/* Doughnut Chart */}
                <div style={{ width: "300px" }}>
                  <Doughnut
                    data={{
                      labels: selectedPoll.options.map((o) => o.text),
                      datasets: [
                        {
                          data: selectedPoll.options.map((o) => o.votes || 0),
                          backgroundColor: [
                            "#22c55e",
                            "#3b82f6",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                            "#06b6d4",
                          ],
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {String(getCreatorId(selectedPoll)) === String(userId) &&
                normalizeStatus(selectedPoll.status) !== "closed" &&
                !isPollExpired(selectedPoll.closesOn) && (
                  <button
                    className="btn-close-modal"
                    onClick={() => handleClosePoll(selectedPoll._id)}
                  >
                    Close Poll
                  </button>
                )}
              {String(getCreatorId(selectedPoll)) === String(userId) && (
                <button
                  className="btn-delete-modal"
                  onClick={() => handleDeletePoll(selectedPoll._id)}
                >
                  Delete Poll
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Polls;
