import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import "./civic.css";
import { notifyError, notifySuccess } from "./notify";

const API_BASE_URL = "http://localhost:5000/api";

const Officials = ({ userData, onLogout, onNavigate, onUpdateUser }) => {
  const user = userData || {};
  const displayName = user.name || "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = user.email || "";
  const userLocation = user.location || "Your City";
  const isOfficialUser = ["official", "admin"].includes(user.role);

  const [activePetitionTab, setActivePetitionTab] = useState("pending");
  const [responseNotes, setResponseNotes] = useState({});
  const [issueNotes, setIssueNotes] = useState({});
  const [pollRegionFilter, setPollRegionFilter] = useState("all");
  const [pollCategoryFilter, setPollCategoryFilter] = useState("all");
  const [officialUpdateText, setOfficialUpdateText] = useState("");
  const [officialUpdates, setOfficialUpdates] = useState([]);
  const [monthlyLogs, setMonthlyLogs] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${now.getFullYear()}-${month}`;
  });
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("civix_darkMode") === "true",
  );
  const [petitions, setPetitions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Citizen contact form state
  const [contactForm, setContactForm] = useState({
    department: "Environmental Department",
    subject: "",
    message: "",
  });
  const [contactMessages, setContactMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const handleDarkModeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("civix_darkMode", String(next));
    if (next) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const fetchOfficialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [petitionsRes, pollsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/petitions/official/locality`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/polls/official/locality`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPetitions(Array.isArray(petitionsRes.data) ? petitionsRes.data : []);
      setPolls(Array.isArray(pollsRes.data) ? pollsRes.data : []);
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to load official dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/official/logs/monthly?month=${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMonthlyLogs(Array.isArray(res.data?.logs) ? res.data.logs : []);
    } catch {
      setMonthlyLogs([]);
    }
  };

  useEffect(() => {
    if (!isOfficialUser) return;
    fetchOfficialData();
  }, [isOfficialUser]);

  useEffect(() => {
    if (!isOfficialUser) return;
    fetchMonthlyLogs();
  }, [isOfficialUser, selectedMonth]);

  // Fetch citizen contact messages
  useEffect(() => {
    if (isOfficialUser) return;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/contact/my-messages?citizenId=${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setContactMessages(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log("Could not load messages:", error.message);
        setContactMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [isOfficialUser, user._id]);

  // Fetch official messages (for officials)
  useEffect(() => {
    if (!isOfficialUser) return;
    const fetchOfficialMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/contact/official/messages?userLocation=${userLocation}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setContactMessages(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log("Could not load official messages:", error.message);
        setContactMessages([]);
      }
    };
    fetchOfficialMessages();
  }, [isOfficialUser, userLocation]);

  const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

  // Handle contact form submission
  const handleSendContactMessage = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      notifyError("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/contact/send`,
        {
          citizenId: user._id,
          citizenName: displayName,
          citizenEmail: userEmail,
          department: contactForm.department,
          subject: contactForm.subject,
          message: contactForm.message,
          location: userLocation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setContactForm({
        department: "Environmental Department",
        subject: "",
        message: "",
      });

      // Refresh messages
      const messagesRes = await axios.get(
        `${API_BASE_URL}/contact/my-messages?citizenId=${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContactMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);

      notifySuccess("Your message has been sent to the officials!");
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to send message");
    }
  };

  // Handle official response to citizen message
  const handleRespondToMessage = async (messageId) => {
    const response = prompt("Enter your official response:");
    if (!response || !response.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/contact/official/respond/${messageId}`,
        { response },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh messages
      const messagesRes = await axios.get(
        `${API_BASE_URL}/contact/official/messages?userLocation=${userLocation}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContactMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);

      notifySuccess("Response sent to citizen!");
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to send response");
    }
  };

  const petitionStats = useMemo(() => {
    const pending = petitions.filter((p) => normalizeStatus(p.status) === "active").length;
    const underReview = petitions.filter((p) => normalizeStatus(p.status) === "under_review").length;
    const approved = petitions.filter((p) => normalizeStatus(p.status) === "resolved").length;
    const rejected = petitions.filter((p) => normalizeStatus(p.status) === "closed").length;
    const highPriority = petitions.filter((p) => (p.signatureCount || 0) >= 50 && normalizeStatus(p.status) !== "resolved").length;

    return {
      pending,
      underReview,
      approved,
      rejected,
      highPriority,
      activeIssues: pending + underReview,
    };
  }, [petitions]);

  const petitionTabs = useMemo(
    () => ({
      pending: petitions.filter((p) => normalizeStatus(p.status) === "active"),
      under_review: petitions.filter((p) => normalizeStatus(p.status) === "under_review"),
      approved: petitions.filter((p) => normalizeStatus(p.status) === "resolved"),
      rejected: petitions.filter((p) => normalizeStatus(p.status) === "closed"),
    }),
    [petitions],
  );

  const issueReports = useMemo(
    () => petitions.map((p) => ({
      id: p._id,
      title: p.title,
      location: p.location,
      evidence: p.description || "No evidence attached",
      status: normalizeStatus(p.status) === "resolved"
        ? "resolved"
        : normalizeStatus(p.status) === "under_review"
          ? "in_progress"
          : "open",
      signatures: p.signatureCount || 0,
    })),
    [petitions],
  );

  const pollCategoryFromText = (poll) => {
    const text = `${poll.question || ""} ${poll.description || ""}`.toLowerCase();
    if (text.includes("water") || text.includes("pollution") || text.includes("waste")) return "Environment";
    if (text.includes("road") || text.includes("transport") || text.includes("traffic")) return "Infrastructure";
    if (text.includes("school") || text.includes("education")) return "Education";
    if (text.includes("hospital") || text.includes("health")) return "Healthcare";
    return "General";
  };

  const pollRegions = useMemo(() => {
    const unique = [...new Set(polls.map((p) => p.state).filter(Boolean))];
    return ["all", ...unique];
  }, [polls]);

  const pollCategories = useMemo(() => {
    const unique = [...new Set(polls.map((p) => pollCategoryFromText(p)))];
    return ["all", ...unique];
  }, [polls]);

  const filteredPolls = useMemo(
    () => polls.filter((poll) => {
      if (pollRegionFilter !== "all" && poll.state !== pollRegionFilter) return false;
      if (pollCategoryFilter !== "all" && pollCategoryFromText(poll) !== pollCategoryFilter) return false;
      return true;
    }),
    [polls, pollRegionFilter, pollCategoryFilter],
  );

  const totalPollVotes = (poll) =>
    Array.isArray(poll.options)
      ? poll.options.reduce((sum, option) => sum + (Number(option?.votes) || 0), 0)
      : 0;

  const petitionSuccessRate = petitions.length
    ? Math.round((petitionStats.approved / petitions.length) * 100)
    : 0;

  const engagementMetric = petitions.reduce((sum, p) => sum + (p.signatureCount || 0), 0)
    + filteredPolls.reduce((sum, poll) => sum + totalPollVotes(poll), 0);

  const exportCsv = (filename, rows) => {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportPetitions = () => {
    const rows = [
      ["Title", "Location", "Status", "Signatures", "Created At"],
      ...petitions.map((p) => [p.title, p.location, p.status, p.signatureCount || 0, p.createdAt]),
    ];
    exportCsv("official-petitions.csv", rows);
  };

  const handleExportReports = () => {
    const rows = [
      ["Issue", "Location", "Status", "Signatures", "Evidence"],
      ...issueReports.map((r) => [r.title, r.location, r.status, r.signatures, r.evidence]),
    ];
    exportCsv("official-issue-reports.csv", rows);
  };

  const handleExportPolls = () => {
    const rows = [
      ["Question", "Region", "Category", "Total Votes", "Status"],
      ...filteredPolls.map((p) => [p.question, p.state, pollCategoryFromText(p), totalPollVotes(p), p.status]),
    ];
    exportCsv("official-poll-insights.csv", rows);
  };

  const handleModerationAction = async (petitionId, status) => {
    try {
      const token = localStorage.getItem("token");
      const comment = responseNotes[petitionId] || "";

      await axios.post(
        `${API_BASE_URL}/petitions/official/respond/${petitionId}`,
        { comment, status },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      notifySuccess("Petition updated successfully");
      setResponseNotes((prev) => ({ ...prev, [petitionId]: "" }));
      fetchOfficialData();
      fetchMonthlyLogs();
    } catch (error) {
      notifyError(error.response?.data?.message || "Unable to update petition");
    }
  };

  const handleIssueStatusUpdate = async (issueId, status) => {
    try {
      const token = localStorage.getItem("token");
      const statusMap = {
        open: "active",
        in_progress: "under_review",
        resolved: "resolved",
      };

      await axios.post(
        `${API_BASE_URL}/petitions/official/respond/${issueId}`,
        { comment: issueNotes[issueId] || "", status: statusMap[status] },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      notifySuccess("Issue report updated");
      fetchOfficialData();
      fetchMonthlyLogs();
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to update issue report");
    }
  };

  const handlePostOfficialUpdate = () => {
    const value = officialUpdateText.trim();
    if (!value) {
      notifyError("Please write an official update first");
      return;
    }

    setOfficialUpdates((prev) => [
      {
        id: Date.now(),
        message: value,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setOfficialUpdateText("");
    notifySuccess("Official update posted");
  };

  if (!isOfficialUser) {
    return (
      <div className="dashboard-page">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 11.5L12 4l8 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 10.5v8h10v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="brand-name">Civix</span>
            <span className="beta-pill">Beta</span>
          </div>
          
          
          <div className="top-actions">
            <button className="icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 17H5l1.5-2V10a5.5 5.5 0 0111 0v5L19 17h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <div className="profile-dropdown">
              <div className="profile-trigger" onClick={onLogout}>
                <div className="avatar">{userInitial}</div>
                <span className="user-name">{displayName}</span>
                <span className="chevron">v</span>
              </div>
            </div>
          </div>
        </header>

        <div className="layout">
          <aside className="sidebar">
            <div className="profile-card">
              <div className="profile-top">
                <div className="avatar lg">{userInitial}</div>
                <div>
                  <h4>{displayName}</h4>
                  <p>Citizen</p>
                </div>
              </div>
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 21s6-6.2 6-11a6 6 0 10-12 0c0 4.8 6 11 6 11z" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <span>{userLocation}</span>
                </div>
                {userEmail && <div className="info-row muted">{userEmail}</div>}
              </div>
            </div>

            <div className="menu">
              <button className="menu-item" onClick={() => onNavigate("dashboard")}>
                <span className="menu-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 11.5L12 4l8 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 10.5v8h10v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Dashboard
              </button>
              <button className="menu-item" onClick={() => onNavigate("petitions")}>
                <span className="menu-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M5 8h8M5 12h8M5 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                Petitions
              </button>
              <button className="menu-item" onClick={() => onNavigate("polls")}>
                <span className="menu-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h4v7H5v-7zM10 5h4v14h-4V5zM15 9h4v10h-4V9z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                Polls
              </button>
              <button className="menu-item active" onClick={() => onNavigate("officials")}>
                <span className="menu-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M16 11a4 4 0 10-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M6 20a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                Officials
              </button>
              <button className="menu-item" onClick={() => onNavigate("reports")}>
                <span className="menu-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                Reports
              </button>
              <button className="menu-item" onClick={() => onNavigate("settings")}>
                <span className="menu-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M19 12a7 7 0 01-.2 1.6l2 1.6-2 3.4-2.3-.8a7 7 0 01-2.7 1.6l-.4 2.4H10l-.4-2.4a7 7 0 01-2.7-1.6l-2.3.8-2-3.4 2-1.6A7 7 0 014 12a7 7 0 01.2-1.6l-2-1.6 2-3.4 2.3.8a7 7 0 012.7-1.6L10 2h4l.4 2.4a7 7 0 012.7 1.6l2.3-.8 2 3.4-2 1.6c.1.5.2 1 .2 1.6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Settings
              </button>
            </div>

            <div className="help-card" onClick={() => onNavigate("help")}>
              <span className="menu-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M9.5 9.5a2.5 2.5 0 014 2c0 1.5-2 1.5-2 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1" fill="currentColor" />
                </svg>
              </span>
              Help & Support
            </div>

            <button className="logout-btn" onClick={onLogout}>
              <span className="menu-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Logout
            </button>
          </aside>

          <main className="content">
            <section className="welcome-card">
              <div>
                <h2>Government Officials & Departments</h2>
                <p>Find verified public department information, contacts, and official service portals for civic issues.</p>
              </div>
            </section>

            {/* Six Department Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px", marginBottom: "32px" }}>
              {[
                { name: "Environmental Department", desc: "Air quality, pollution control, waste management, sustainability", contact: "1800-11-8600", email: "support@ecopolicy.gov.in" },
                { name: "Infrastructure Department", desc: "Roads, public utilities, urban works and civic infrastructure", contact: "1800-11-3434", email: "info@indan.nic.in" },
                { name: "Education Department", desc: "Schools, higher education, skill development and literacy", contact: "1800-11-6969", email: "feedback@education.gov.in" },
                { name: "Public Safety Department", desc: "Low & order, emergency response, disaster management support", contact: "112", email: "citizen@ndma.gov.in" },
                { name: "Transportation Department", desc: "Public transport planning, traffic systems, mobility services", contact: "1800-11-0400", email: "helpdesk@transport.gov.in" },
                { name: "Healthcare Department", desc: "Public health services, hospitals, disease control, health schemes", contact: "1075", email: "helpdesk-nhm@gov.in" },
              ].map((dept) => (
                <div key={dept.name} className="stat-card" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(243, 232, 255, 0.8) 100%)" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700", color: "#1f2937" }}>{dept.name}</h3>
                  <p style={{ margin: "0 0 14px 0", fontSize: "13px", color: "#6b7280", lineHeight: "1.5" }}>{dept.desc}</p>
                  <div style={{ fontSize: "13px", marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid rgba(168, 85, 247, 0.1)" }}>
                    <p style={{ margin: "0 0 4px 0" }}><strong>Contact:</strong> {dept.contact}</p>
                    <p style={{ margin: "0" }}><strong>Email:</strong> {dept.email}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => setContactForm({ ...contactForm, department: dept.name })}
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        background: "var(--gradient-purple)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => e.target.style.boxShadow = "0 4px 12px rgba(168, 85, 247, 0.3)"}
                      onMouseLeave={(e) => e.target.style.boxShadow = "none"}
                    >
                      Contact
                    </button>
                    <button 
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        background: "linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)",
                        color: "#a855f7",
                        border: "1px solid rgba(168, 85, 247, 0.2)",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => e.target.style.background = "linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)"}
                    >
                      Website
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form Section */}
            <section className="welcome-card">
              <div>
                <h2>Contact Public Officials</h2>
                <p>Send a message directly to government departments about your civic concerns.</p>
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
              {/* Contact Form */}
              <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(243, 232, 255, 0.8) 100%)", display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>Send Message</h3>
                
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#4b5563" }}>Select Department</label>
                  <select
                    value={contactForm.department}
                    onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      backgroundColor: "white",
                      color: "#1f2937",
                      cursor: "pointer",
                    }}
                  >
                    <option>Environmental Department</option>
                    <option>Infrastructure Department</option>
                    <option>Education Department</option>
                    <option>Public Safety Department</option>
                    <option>Transportation Department</option>
                    <option>Healthcare Department</option>
                  </select>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#4b5563" }}>Subject</label>
                  <input
                    type="text"
                    placeholder="What is your concern?"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "16px", flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#4b5563" }}>Message</label>
                  <textarea
                    placeholder="Describe your issue in detail..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      minHeight: "120px",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                <button
                  onClick={handleSendContactMessage}
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: "var(--gradient-purple)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                  }}
                  onMouseEnter={(e) => e.target.style.boxShadow = "0 6px 16px rgba(168, 85, 247, 0.3)"}
                  onMouseLeave={(e) => e.target.style.boxShadow = "0 4px 12px rgba(168, 85, 247, 0.2)"}
                >
                  Send Message
                </button>
              </div>

              {/* Messages History */}
              <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(243, 232, 255, 0.8) 100%)", display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>Your Messages ({contactMessages.length})</h3>
                
                <div style={{ flex: 1, overflowY: "auto", maxHeight: "350px" }}>
                  {loadingMessages ? (
                    <p style={{ color: "#9ca3af", fontSize: "13px" }}>Loading messages...</p>
                  ) : contactMessages.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: "13px" }}>No messages yet. Send one to the left!</p>
                  ) : (
                    contactMessages.map((msg) => (
                      <div key={msg._id} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(168, 85, 247, 0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "6px", gap: "8px" }}>
                          <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#1f2937" }}>{msg.department}</h4>
                          <span style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            whiteSpace: "nowrap",
                            backgroundColor: msg.status === "responded" ? "#dcfce7" : msg.status === "read" ? "#dbeafe" : "#fef3c7",
                            color: msg.status === "responded" ? "#166534" : msg.status === "read" ? "#1e40af" : "#92400e",
                            fontWeight: "600",
                          }}>
                            {msg.status === "responded" ? "✓ Replied" : msg.status === "read" ? "Opened" : "New"}
                          </span>
                        </div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "12px", fontWeight: "600", color: "#4b5563" }}>{msg.subject}</p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", lineHeight: "1.4" }}>{msg.message.substring(0, 80)}...</p>
                        {msg.officialResponse && (
                          <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "8px", borderRadius: "6px", marginTop: "8px", fontSize: "12px", borderLeft: "3px solid #10b981" }}>
                            <strong style={{ color: "#10b981" }}>Response:</strong>
                            <p style={{ margin: "4px 0 0 0", color: "#059669" }}>{msg.officialResponse.substring(0, 60)}...</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="official-admin-wrap">
      <header className="official-admin-top">
        <div className="official-admin-brand">
          <span className="official-admin-logo">Civix</span>
          <span className="official-admin-badge">Official Command Center</span>
        </div>
        <div className="official-admin-top-right">
          <div className="official-profile-mini">
            <span className="official-avatar">{userInitial}</span>
            <div>
              <strong>{displayName}</strong>
              <p>{userEmail}</p>
            </div>
          </div>
          <button className="official-logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="official-admin-shell">
        <aside className="official-admin-sidebar">
          <h3>Official Policy</h3>
          <ul>
            <li>Officials cannot create polls by default.</li>
            <li>Officials cannot sign petitions.</li>
            <li>Officials can only moderate and respond.</li>
            <li>All actions are logged for monthly reports.</li>
          </ul>

          <div className="official-verify-card">
            <h4>Profile & Verification</h4>
            <p><strong>Badge:</strong> Verified Official</p>
            <p><strong>Jurisdiction:</strong> {userLocation}</p>
            <p><strong>Department:</strong> Civic Administration</p>
          </div>

          <button className="official-settings-btn" onClick={() => onNavigate("settingsOfficials")}>Settings</button>
        </aside>

        <main className="official-admin-main">
          <section className="official-section">
            <div className="official-section-head">
              <h2>Dashboard Overview</h2>
              {loading && <span>Loading data...</span>}
            </div>
            <div className="official-stats-grid">
              <article className="official-stat-card"><h4>Pending</h4><strong>{petitionStats.pending}</strong></article>
              <article className="official-stat-card"><h4>Approved</h4><strong>{petitionStats.approved}</strong></article>
              <article className="official-stat-card"><h4>Rejected</h4><strong>{petitionStats.rejected}</strong></article>
              <article className="official-stat-card"><h4>Active Issues</h4><strong>{petitionStats.activeIssues}</strong></article>
            </div>
            <div className="official-alerts-box">
              <h4>High-Priority Alerts</h4>
              {petitionStats.highPriority === 0 ? (
                <p>No high-priority petitions currently.</p>
              ) : (
                <p>{petitionStats.highPriority} high-priority petitions need immediate moderation.</p>
              )}
            </div>
          </section>

          <section className="official-section">
            <div className="official-section-head">
              <h2>Petition Management</h2>
              <p>Moderation, status decisions, and official responses</p>
            </div>

            <div className="official-tabs">
              <button className={activePetitionTab === "pending" ? "active" : ""} onClick={() => setActivePetitionTab("pending")}>Pending Review</button>
              <button className={activePetitionTab === "under_review" ? "active" : ""} onClick={() => setActivePetitionTab("under_review")}>Under Review</button>
              <button className={activePetitionTab === "approved" ? "active" : ""} onClick={() => setActivePetitionTab("approved")}>Approved</button>
              <button className={activePetitionTab === "rejected" ? "active" : ""} onClick={() => setActivePetitionTab("rejected")}>Rejected</button>
            </div>

            <div className="official-list">
              {(petitionTabs[activePetitionTab] || []).map((petition) => (
                <article key={petition._id} className="official-list-card">
                  <div className="official-list-top">
                    <h4>{petition.title}</h4>
                    <span>{petition.location}</span>
                  </div>
                  <p>{petition.description}</p>
                  <div className="official-chip-row">
                    <span>Signatures: {petition.signatureCount || 0}</span>
                    <span>Status: {petition.status}</span>
                  </div>

                  <textarea
                    placeholder="Add official response"
                    value={responseNotes[petition._id] || ""}
                    onChange={(e) => setResponseNotes((prev) => ({ ...prev, [petition._id]: e.target.value }))}
                  />

                  <div className="official-actions-row">
                    <button onClick={() => handleModerationAction(petition._id, "under_review")}>Mark Under Review</button>
                    <button onClick={() => handleModerationAction(petition._id, "resolved")}>Approve</button>
                    <button className="danger" onClick={() => handleModerationAction(petition._id, "closed")}>Reject</button>
                  </div>
                </article>
              ))}
              {(petitionTabs[activePetitionTab] || []).length === 0 && <p>No petitions in this tab.</p>}
            </div>
          </section>

          <section className="official-section">
            <div className="official-section-head">
              <h2>Issue Reports</h2>
              <p>Citizen-submitted incidents with location and evidence</p>
            </div>

            <div className="official-list">
              {issueReports.map((issue) => (
                <article key={issue.id} className="official-list-card">
                  <div className="official-list-top">
                    <h4>{issue.title}</h4>
                    <span>{issue.location}</span>
                  </div>
                  <p><strong>Evidence:</strong> {issue.evidence}</p>
                  <div className="official-chip-row">
                    <span>Current Status: {issue.status}</span>
                    <span>Support: {issue.signatures}</span>
                  </div>

                  <textarea
                    placeholder="Resolution notes"
                    value={issueNotes[issue.id] || ""}
                    onChange={(e) => setIssueNotes((prev) => ({ ...prev, [issue.id]: e.target.value }))}
                  />

                  <div className="official-actions-row">
                    <button onClick={() => handleIssueStatusUpdate(issue.id, "open")}>Open</button>
                    <button onClick={() => handleIssueStatusUpdate(issue.id, "in_progress")}>In Progress</button>
                    <button onClick={() => handleIssueStatusUpdate(issue.id, "resolved")}>Resolved</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="official-section">
            <div className="official-section-head">
              <h2>Public Communication</h2>
              <p>Official updates, clarifications, and response threads</p>
            </div>
            <div className="official-comm-grid">
              <article className="official-panel">
                <h4>Post Official Update</h4>
                <textarea
                  placeholder="Write an official announcement or clarification"
                  value={officialUpdateText}
                  onChange={(e) => setOfficialUpdateText(e.target.value)}
                />
                <button onClick={handlePostOfficialUpdate}>Post Update</button>
              </article>

              <article className="official-panel">
                <h4>Recent Updates</h4>
                {officialUpdates.length === 0 && <p>No official updates posted yet.</p>}
                {officialUpdates.map((update) => (
                  <div key={update.id} className="official-update-item">
                    <p>{update.message}</p>
                    <span>{new Date(update.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </article>

              <article className="official-panel">
                <h4>FAQ / Clarification Threads</h4>
                <ul className="official-faq-list">
                  <li>Why is this petition under review? Pending legal and budget checks.</li>
                  <li>When does status change to approved? After field validation and department sign-off.</li>
                  <li>Can citizens escalate? Yes, through Help & Support with petition ID.</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="official-section">
            <div className="official-section-head">
              <h2>Poll Insights</h2>
              <p>Regional trends and decision support (officials cannot create polls here)</p>
            </div>

            <div className="official-filter-row">
              <label>
                Region
                <select value={pollRegionFilter} onChange={(e) => setPollRegionFilter(e.target.value)}>
                  {pollRegions.map((region) => (
                    <option key={region} value={region}>{region === "all" ? "All Regions" : region}</option>
                  ))}
                </select>
              </label>
              <label>
                Category
                <select value={pollCategoryFilter} onChange={(e) => setPollCategoryFilter(e.target.value)}>
                  {pollCategories.map((category) => (
                    <option key={category} value={category}>{category === "all" ? "All Categories" : category}</option>
                  ))}
                </select>
              </label>
              <button onClick={handleExportPolls}>Export Poll Data</button>
            </div>

            <div className="official-list">
              {filteredPolls.map((poll) => (
                <article key={poll._id} className="official-list-card">
                  <div className="official-list-top">
                    <h4>{poll.question}</h4>
                    <span>{poll.state}</span>
                  </div>
                  <p>{poll.description}</p>
                  <div className="official-chip-row">
                    <span>Category: {pollCategoryFromText(poll)}</span>
                    <span>Total Votes: {totalPollVotes(poll)}</span>
                    <span>Status: {poll.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="official-section">
            <div className="official-section-head">
              <h2>Analytics & Reports</h2>
              <p>Engagement metrics and petition outcomes</p>
            </div>
            <div className="official-stats-grid">
              <article className="official-stat-card"><h4>Engagement Score</h4><strong>{engagementMetric}</strong></article>
              <article className="official-stat-card"><h4>Petition Success Rate</h4><strong>{petitionSuccessRate}%</strong></article>
              <article className="official-stat-card"><h4>Monthly Official Logs</h4><strong>{monthlyLogs.length}</strong></article>
            </div>

            <div className="official-filter-row">
              <label>
                Report Month
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
              </label>
            </div>

            <div className="official-log-list">
              {monthlyLogs.length === 0 && <p>No logs available for this month.</p>}
              {monthlyLogs.map((log) => (
                <div key={log._id} className="official-log-item">
                  <p>{log.action}</p>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="official-section">
            <div className="official-section-head">
              <h2>Citizen Contact Messages</h2>
              <p>Messages from citizens regarding civic issues and department concerns</p>
            </div>

            <div className="official-list">
              {contactMessages.length === 0 ? (
                <p>No citizen messages yet.</p>
              ) : (
                contactMessages.map((msg) => (
                  <article key={msg._id} className="official-list-card">
                    <div className="official-list-top">
                      <h4>{msg.subject}</h4>
                      <span>{msg.department}</span>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <p><strong>From:</strong> {msg.citizenName} ({msg.citizenEmail})</p>
                      <p><strong>Location:</strong> {msg.location || "Not specified"}</p>
                      <p><strong>Status:</strong> <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "4px", 
                        fontSize: "12px",
                        backgroundColor: msg.status === "responded" ? "#d4edda" : msg.status === "read" ? "#cfe2ff" : "#fff3cd"
                      }}>{msg.status === "responded" ? "✓ Responded" : msg.status === "read" ? "Opened" : "New"}</span></p>
                    </div>
                    <p><strong>Message:</strong></p>
                    <p>{msg.message}</p>
                    {msg.officialResponse && (
                      <div style={{ backgroundColor: "#e8f5e9", padding: "10px", borderRadius: "4px", marginTop: "10px" }}>
                        <p><strong>Your Response:</strong></p>
                        <p>{msg.officialResponse}</p>
                        <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                          Responded on {new Date(msg.respondedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div className="official-actions-row">
                      {!msg.officialResponse && (
                        <button onClick={() => handleRespondToMessage(msg._id)}>Respond</button>
                      )}
                      <button className="secondary" disabled>Sent {new Date(msg.createdAt).toLocaleDateString()}</button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="official-section">
            <div className="official-section-head">
              <h2>Download Center</h2>
              <p>Export petitions, issue reports, and poll insights</p>
            </div>
            <div className="official-download-grid">
              <button onClick={handleExportPetitions}>Export Petitions CSV</button>
              <button onClick={handleExportReports}>Export Issue Reports CSV</button>
              <button onClick={handleExportPolls}>Export Poll Insights CSV</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Officials;
