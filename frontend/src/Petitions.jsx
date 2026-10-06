import axios from "axios";
import { useEffect, useState } from "react";
import "./civic.css";
import { notifyError, notifyInfo, notifySuccess } from "./notify";

const Petitions = ({ userData, onLogout, onNavigate, initialPetitionId, onPetitionLinkHandled }) => {
  const user = userData || {};
  const displayName = user.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = user.email || '';
  const userId = user._id || '';
  const userLocation = user.location || 'Bangalore';
  const isOfficialUser = ["official", "admin"].includes(user.role);
  const userRole = user.role === "admin" ? "Admin" : isOfficialUser ? "Unverified Official" : "Citizen";

  const [activeTab, setActiveTab] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [petitionsData, setPetitionsData] = useState([]);
  const [officialComment, setOfficialComment] = useState("");
  const [officialStatus, setOfficialStatus] = useState("under_review");

  const getDisplayStatus = (status) => {
    if (status === "under_review") return "Under Review";
    if (status === "closed") return "Closed";
    if (status === "resolved") return "Resolved";
    return "Active";
  };

  const getCreatorId = (petition) => {
    if (!petition?.creator) return "";
    if (typeof petition.creator === "string") return petition.creator;
    return petition.creator._id || "";
  };

  const hasSignedPetition = (petition) => {
    if (!Array.isArray(petition?.signatures) || !userId) return false;
    return petition.signatures.some((id) => String(id) === String(userId));
  };

  const formatCreatedDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const fetchPetitions = async () => {
    const token = localStorage.getItem("token");
    const endpoint = isOfficialUser
      ? "http://localhost:5000/api/petitions/official/locality"
      : "http://localhost:5000/api/petitions/all";

    const config = isOfficialUser
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const res = await axios.get(endpoint, config);
    const list = Array.isArray(res.data) ? res.data : [];
    setPetitionsData(list);
    return list;
  };


// ================= FETCH PETITIONS FROM BACKEND =================

useEffect(() => {
  const loadPetitions = async () => {
    try {
      await fetchPetitions();
    } catch (error) {
      console.log(error);
    }
  };

  loadPetitions();

}, []);


// ================= OPEN PETITION FROM SHARE LINK =================

useEffect(() => {

  if (!initialPetitionId) return;

  const petitionFromLink = petitionsData.find(
    (petition) => petition._id === initialPetitionId
  );

  if (petitionFromLink) {

    setSelectedPetition(petitionFromLink);

    if (onPetitionLinkHandled) {
      onPetitionLinkHandled();
    }

  }

}, [initialPetitionId, petitionsData, onPetitionLinkHandled]);


// ================= PETITIONS STATE =================

const petitions = petitionsData;


// ================= DELETE PETITION =================

const handleDeletePetition = async (id) => {

  try {

    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/petitions/delete/${id}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    setPetitionsData((prev) => prev.filter((petition) => petition._id !== id));
    setSelectedPetition(null);
    notifySuccess("Petition deleted successfully");

  } catch (error) {

    notifyError(error.response?.data?.message || "Error deleting petition");

  }

};


// ================= SIGN PETITION =================

const handleSignPetition = async () => {

  try {

    const token = localStorage.getItem("token");

    const res = await axios.patch(
      `http://localhost:5000/api/petitions/sign/${selectedPetition._id}`,
      {},
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    notifySuccess(res.data?.message || "Petition signed successfully");

    const updatedPetitions = await fetchPetitions();
    const updatedSelectedPetition = updatedPetitions.find(
      (petition) => petition._id === selectedPetition._id
    );
    setSelectedPetition(updatedSelectedPetition || null);
  } catch (error) {

    notifyError(error.response?.data?.message || "Error signing petition");

  }

};

const handleOfficialResponse = async () => {
  if (!selectedPetition?._id) return;

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      notifyError("Please login again");
      return;
    }

    const res = await axios.post(
      `http://localhost:5000/api/petitions/official/respond/${selectedPetition._id}`,
      {
        comment: officialComment,
        status: officialStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const refreshed = res.data?.petition;

    if (refreshed?._id) {
      setPetitionsData((prev) => prev.map((item) => (item._id === refreshed._id ? refreshed : item)));
      setSelectedPetition(refreshed);
    }

    setOfficialComment("");
    setOfficialStatus("under_review");
    notifySuccess(res.data?.message || "Official response submitted");
  } catch (error) {
    notifyError(error.response?.data?.message || "Unable to submit official response");
  }
};


// ================= SHARE PETITION =================

const handleSharePetition = async () => {

  if (!selectedPetition) return;

  const shareUrl =
  `${window.location.origin}${window.location.pathname}?page=petitions&petitionId=${selectedPetition._id}`;

  try {

    if (navigator.clipboard?.writeText) {

      await navigator.clipboard.writeText(shareUrl);

      notifyInfo("Share link copied to clipboard");

    } else {

      const textArea = document.createElement("textarea");

      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand("copy");

      document.body.removeChild(textArea);

      notifyInfo("Share link copied to clipboard");

    }

  } catch {

    notifyError("Unable to copy link");

  }

};


// ================= FILTER OPTIONS =================

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
  "Jammu & Kashmir"
];

const categories = [
  "All Categories",
  "Environment",
  "Infrastructure",
  "Education",
  "Public Safety",
  "Transportation",
  "Healthcare",
  "Housing",
  "Other"
];
  const filteredPetitions = petitions.filter((pet) => {
    // Filter by tab
    if (activeTab === "my") {
      const creatorId = getCreatorId(pet);
      const isMineById = userId && String(creatorId) === String(userId);
      const isMineByEmail = pet?.creator?.email && pet.creator.email === userEmail;
      if (!isMineById && !isMineByEmail) return false;
    }

    if (activeTab === "signed" && !hasSignedPetition(pet)) return false;
    
    // Filter by location
    if (!isOfficialUser && selectedLocation !== "All Locations" && pet.location !== selectedLocation) return false;
    
    // Filter by category
    if (selectedCategory !== "All Categories" && pet.category !== selectedCategory) return false;
    
    // Filter by status
    if (selectedStatus !== "All Statuses" && getDisplayStatus(pet.status) !== selectedStatus) return false;
    
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
          <div className="avatar">{userInitial}</div>
          <span className="user-name">{displayName}</span>
          <span className="chevron" aria-hidden="true">v</span>
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
            <button className="menu-item active">
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
            <h1>Petitions</h1>
            <p>Browse, sign, and track petitions in your community.</p>
            <button className="btn-create" onClick={() => onNavigate("create-petition")}>
              + Create New Petition
            </button>
          </section>

          {/* Tabs */}
          <div className="petition-tabs">
            <button
              className={`petition-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Petitions
            </button>
            <button
              className={`petition-tab ${activeTab === "my" ? "active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Petitions
            </button>
            <button
              className={`petition-tab ${activeTab === "signed" ? "active" : ""}`}
              onClick={() => setActiveTab("signed")}
            >
              Signed by Me
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
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                {indianLocations.map((location) => (
                  <option key={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <svg className="filter-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 4h18v2H3V4zm2 8h14v2H5v-2zm3 8h8v2H8v-2z" fill="currentColor" />
              </svg>
              <div className="dropdown-wrapper">
                <button
                  className="filter-btn"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  {selectedCategory}
                </button>
                {showCategoryDropdown && (
                  <div className="dropdown-menu">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        className={`dropdown-item ${selectedCategory === cat ? "active" : ""}`}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-group">
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option>All Statuses</option>
                <option>Active</option>
                <option>Under Review</option>
                <option>Closed</option>
              </select>
            </div>
          </div>

          {/* Petitions Grid */}
          <div className="petitions-grid">
            {filteredPetitions.map((petition) => (
              <div key={petition._id} className="petition-card">
                <div className="petition-status-bar"></div>
                <div className="petition-time">{formatCreatedDate(petition.createdAt)}</div>
                <h3>{petition.title}</h3>
                <p className="petition-desc">{petition.category}</p>
                <p className="petition-location">{petition.location}</p>
                <div className="petition-footer">
                  <div className="signature-info">
                    <span>{Number(petition.signatureCount) || 0} signatures</span>
                    <span className="status-badge">{getDisplayStatus(petition.status)}</span>
                  </div>
                  <button 
                    className="btn-view-details"
                    onClick={() => setSelectedPetition(petition)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <section className="petition-cta">
            <h2>Have an issue that needs attention?</h2>
            <button className="btn-create-large" onClick={() => onNavigate("create-petition")}>
              Create a New Petition
            </button>
          </section>
        </main>
      </div>

      {/* Petition Details Modal */}
      {selectedPetition && (
        <div className="modal-overlay" onClick={() => setSelectedPetition(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => {
                setSelectedPetition(null);
                setOfficialComment("");
                setOfficialStatus("under_review");
              }}
            >
              ✕
            </button>

            <div className="modal-header">
              <h2>{selectedPetition.title}</h2>
              <span className="status-badge-modal">{getDisplayStatus(selectedPetition.status)}</span>
            </div>

            <div className="modal-meta">
              <div className="meta-item-modal">
                <span className="meta-label">Category</span>
                <span className="meta-value">{selectedPetition.category}</span>
              </div>
              <div className="meta-item-modal">
                <span className="meta-label">Location</span>
                <span className="meta-value">{selectedPetition.location}</span>
              </div>
              <div className="meta-item-modal">
                <span className="meta-label">Created</span>
                <span className="meta-value">{formatCreatedDate(selectedPetition.createdAt)}</span>
              </div>
            </div>

            <div className="modal-progress">
              <div className="progress-bar-modal">
                <div 
                  className="progress-fill-modal" 
                  style={{ width: `${Math.min(Number(selectedPetition.signatureCount) || 0, 100)}%` }}
                ></div>
              </div>
              <p className="progress-text-modal">{Number(selectedPetition.signatureCount) || 0} signatures</p>
            </div>

            <div className="modal-description">
              <h3>Description</h3>
              <p>{selectedPetition.description}</p>
            </div>

            <div className="modal-actions">
              <button
                className="btn-sign-modal"
                onClick={handleSignPetition}
                disabled={
                  selectedPetition.status !== "active" ||
                  hasSignedPetition(selectedPetition)
                }
              >
                {selectedPetition.status !== "active"
                  ? "Petition Closed"
                  : hasSignedPetition(selectedPetition)
                    ? "Already Signed"
                    : "Sign This Petition"}
              </button>
              <button className="btn-share-modal" onClick={handleSharePetition}>Share</button>
              {String(getCreatorId(selectedPetition)) === String(userId) && (
                <button 
                  className="btn-delete-modal"
                  onClick={() => handleDeletePetition(selectedPetition._id)}
                >
                  Delete
                </button>
              )}
            </div>

            {Array.isArray(selectedPetition.officialResponses) && selectedPetition.officialResponses.length > 0 && (
              <div className="modal-description">
                <h3>Official Responses</h3>
                {selectedPetition.officialResponses
                  .slice()
                  .reverse()
                  .map((response) => (
                    <div key={response._id} className="meta-item-modal" style={{ marginBottom: "0.75rem" }}>
                      <span className="meta-label">
                        {(response.official && response.official.name) || "Official"} · {getDisplayStatus(response.status)}
                      </span>
                      <span className="meta-value">{response.comment}</span>
                    </div>
                  ))}
              </div>
            )}

            {isOfficialUser && (
              <div className="modal-description">
                <h3>Respond As Official</h3>
                <div className="petition-filters" style={{ marginTop: "0.75rem" }}>
                  <div className="filter-group">
                    <select value={officialStatus} onChange={(e) => setOfficialStatus(e.target.value)}>
                      <option value="under_review">Under Review</option>
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <textarea
                  value={officialComment}
                  onChange={(e) => setOfficialComment(e.target.value)}
                  rows={4}
                  placeholder="Add progress update or official comment"
                  style={{ width: "100%", marginTop: "0.75rem", marginBottom: "0.75rem" }}
                />
                <button
                  className="btn-create"
                  onClick={handleOfficialResponse}
                  disabled={!officialComment.trim()}
                >
                  Submit Response
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Petitions;