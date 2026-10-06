import axios from "axios";
import { useEffect, useState } from "react";
import { notifyError, notifySuccess } from "./notify";
import "./civic.css";

const API_BASE_URL = "http://localhost:5000/api";

const SettingsOfficials = ({ userData, onNavigate, onUpdateUser, onLogout }) => {
  const user = userData || {};
  const displayName = user.name || "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = user.email || "";
  const userLocation = user.location || "Your City";

  const [settingsForm, setSettingsForm] = useState({
    name: user.name || "",
    email: user.email || "",
    location: user.location || "",
    department: localStorage.getItem("official_department") || "Civic Administration",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [adminVerifyForm, setAdminVerifyForm] = useState({
    officeId: user.adminVerification?.officeId || localStorage.getItem("official_office_id") || "",
    verificationCode: "",
  });

  const [adminVerificationState, setAdminVerificationState] = useState(
    user.adminVerification?.status
      || localStorage.getItem(`official_admin_verified_${user._id || "anon"}`)
      || "pending",
  );

  const [prefEmailAlerts, setPrefEmailAlerts] = useState(
    typeof user.preferences?.emailNotifications === "boolean"
      ? user.preferences.emailNotifications
      : false,
  );
  const [prefCriticalOnly, setPrefCriticalOnly] = useState(
    typeof user.preferences?.criticalAlertsOnly === "boolean"
      ? user.preferences.criticalAlertsOnly
      : false,
  );
  const [prefInAppAlerts, setPrefInAppAlerts] = useState(
    typeof user.preferences?.inAppAlerts === "boolean"
      ? user.preferences.inAppAlerts
      : false,
  );
  const [darkMode, setDarkMode] = useState(
    typeof user.preferences?.darkMode === "boolean"
      ? user.preferences.darkMode
      : localStorage.getItem("civix_darkMode") === "true",
  );

  const handleSettingsInput = (e) => {
    const { name, value } = e.target;
    setSettingsForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminVerifyInput = (e) => {
    const { name, value } = e.target;
    setAdminVerifyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const handleSavePreferences = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${API_BASE_URL}/auth/me`,
        {
          preferences: {
            darkMode,
            emailNotifications: prefEmailAlerts,
            inAppAlerts: prefInAppAlerts,
            criticalAlertsOnly: prefCriticalOnly,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (onUpdateUser && res.data?.user) {
        onUpdateUser(res.data.user);
      }

      localStorage.setItem("civix_darkMode", String(darkMode));
      localStorage.setItem("official_pref_email_alerts", String(prefEmailAlerts));
      localStorage.setItem("official_pref_critical_only", String(prefCriticalOnly));
      localStorage.setItem("official_pref_inapp_alerts", String(prefInAppAlerts));
      localStorage.setItem("official_department", settingsForm.department || "");
      notifySuccess("Official settings saved");
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to save official settings");
    }
  };

  const handleUpdateOfficialProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/auth/me`,
        {
          name: settingsForm.name,
          email: settingsForm.email,
          location: settingsForm.location,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (onUpdateUser && res.data?.user) {
        onUpdateUser(res.data.user);
      }
      notifySuccess("Official profile updated");
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangeOfficialPassword = async (e) => {
    e.preventDefault();

    if (!settingsForm.currentPassword) {
      notifyError("Current password is required");
      return;
    }

    if (settingsForm.newPassword.length < 6) {
      notifyError("New password must be at least 6 characters");
      return;
    }

    if (settingsForm.newPassword !== settingsForm.confirmPassword) {
      notifyError("New password and confirm password must match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword: settingsForm.currentPassword,
          newPassword: settingsForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSettingsForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      notifySuccess("Password changed successfully");
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleVerifyAdminAccess = async (e) => {
    e.preventDefault();

    if (!adminVerifyForm.officeId.trim()) {
      notifyError("Office ID is required for verification");
      return;
    }

    if (!adminVerifyForm.verificationCode.trim() || adminVerifyForm.verificationCode.trim().length < 6) {
      notifyError("Enter a valid verification code");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${API_BASE_URL}/auth/me`,
        {
          adminVerification: {
            officeId: adminVerifyForm.officeId.trim(),
            request: true,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const nextState = res.data?.user?.adminVerification?.status || (user.role === "admin" ? "verified" : "requested");
      setAdminVerificationState(nextState);

      if (onUpdateUser && res.data?.user) {
        onUpdateUser(res.data.user);
      }

      localStorage.setItem("official_office_id", adminVerifyForm.officeId.trim());
      localStorage.setItem(`official_admin_verified_${user._id || "anon"}`, nextState);
      notifySuccess(
        nextState === "verified"
          ? "Administrator verification completed"
          : "Verification request submitted for admin approval",
      );
    } catch (error) {
      notifyError(error.response?.data?.message || "Failed to submit verification request");
    }
  };

  useEffect(() => {
    const emailPref = localStorage.getItem("official_pref_email_alerts");
    const criticalPref = localStorage.getItem("official_pref_critical_only");
    const inAppPref = localStorage.getItem("official_pref_inapp_alerts");

    if (emailPref !== null) setPrefEmailAlerts(emailPref === "true");
    if (criticalPref !== null) setPrefCriticalOnly(criticalPref === "true");
    if (inAppPref !== null) setPrefInAppAlerts(inAppPref === "true");
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <div className="official-admin-wrap">
      <header className="official-admin-top">
        <div className="official-admin-brand">
          <span className="official-admin-logo">Civix</span>
          <span className="official-admin-badge">Official Settings</span>
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
          <h3>Navigation</h3>
          <ul>
            <li>Official Settings</li>
          </ul>

          <div className="official-verify-card">
            <h4>Your Profile</h4>
            <p><strong>Name:</strong> {displayName}</p>
            <p><strong>Email:</strong> {userEmail}</p>
            <p><strong>Jurisdiction:</strong> {userLocation}</p>
          </div>

          <div className="official-settings-card">
            <h4>Quick Info</h4>
            <p>Update your profile, security settings, preferences, and admin verification status on this page.</p>
          </div>

          <button
            className="official-settings-btn secondary official-back-btn"
            onClick={() => onNavigate("officials")}
          >
            Back to Dashboard
          </button>
        </aside>

        <main className="official-admin-main">
          <section className="official-section">
            <div className="official-section-head">
              <h2>Settings & Verification Center</h2>
              <p>Manage your administrative profile, security, verification, and preferences</p>
            </div>

            <div className="official-settings-grid-full">
              <article className="official-panel">
                <h4>Account Profile</h4>
                <form className="official-form" onSubmit={handleUpdateOfficialProfile}>
                  <label>
                    Username
                    <input
                      type="text"
                      name="name"
                      value={settingsForm.name}
                      onChange={handleSettingsInput}
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={settingsForm.email}
                      onChange={handleSettingsInput}
                      required
                    />
                  </label>
                  <label>
                    Jurisdiction
                    <input
                      type="text"
                      name="location"
                      value={settingsForm.location}
                      onChange={handleSettingsInput}
                      required
                    />
                  </label>
                  <label>
                    Department
                    <input
                      type="text"
                      name="department"
                      value={settingsForm.department}
                      onChange={handleSettingsInput}
                    />
                  </label>
                  <button type="submit">Update Profile</button>
                </form>
              </article>

              <article className="official-panel">
                <h4>Security</h4>
                <form className="official-form" onSubmit={handleChangeOfficialPassword}>
                  <label>
                    Current Password
                    <input
                      type="password"
                      name="currentPassword"
                      value={settingsForm.currentPassword}
                      onChange={handleSettingsInput}
                      required
                    />
                  </label>
                  <label>
                    New Password
                    <input
                      type="password"
                      name="newPassword"
                      value={settingsForm.newPassword}
                      onChange={handleSettingsInput}
                      required
                    />
                  </label>
                  <label>
                    Confirm New Password
                    <input
                      type="password"
                      name="confirmPassword"
                      value={settingsForm.confirmPassword}
                      onChange={handleSettingsInput}
                      required
                    />
                  </label>
                  <button type="submit">Change Password</button>
                </form>
              </article>

              <article className="official-panel">
                <h4>Display & Notifications</h4>
                <div className="official-pref-stack">
                  <div className="pref-toggle-row">
                    <span>Dark mode</span>
                    <button
                      type="button"
                      className={`toggle-btn ${darkMode ? "active" : ""}`}
                      onClick={handleDarkModeToggle}
                    >
                      <span className="toggle-slider" />
                    </button>
                  </div>

                  <div className="pref-toggle-row">
                    <span>Email notifications</span>
                    <button
                      type="button"
                      className={`toggle-btn ${prefEmailAlerts ? "active" : ""}`}
                      onClick={() => setPrefEmailAlerts(!prefEmailAlerts)}
                    >
                      <span className="toggle-slider" />
                    </button>
                  </div>

                  <div className="pref-toggle-row">
                    <span>In-app alerts</span>
                    <button
                      type="button"
                      className={`toggle-btn ${prefInAppAlerts ? "active" : ""}`}
                      onClick={() => setPrefInAppAlerts(!prefInAppAlerts)}
                    >
                      <span className="toggle-slider" />
                    </button>
                  </div>

                  <div className="pref-toggle-row">
                    <span>Critical alerts only</span>
                    <button
                      type="button"
                      className={`toggle-btn ${prefCriticalOnly ? "active" : ""}`}
                      onClick={() => setPrefCriticalOnly(!prefCriticalOnly)}
                    >
                      <span className="toggle-slider" />
                    </button>
                  </div>
                </div>
                <button onClick={handleSavePreferences}>Save Preferences</button>
              </article>

              <article className="official-panel">
                <h4>Admin Verification</h4>
                <p className="official-verify-state">
                  Current status: <strong>{adminVerificationState}</strong>
                </p>
                <form className="official-form" onSubmit={handleVerifyAdminAccess}>
                  <label>
                    Office ID
                    <input
                      type="text"
                      name="officeId"
                      value={adminVerifyForm.officeId}
                      onChange={handleAdminVerifyInput}
                      required
                    />
                  </label>
                  <label>
                    Verification Code
                    <input
                      type="text"
                      name="verificationCode"
                      value={adminVerifyForm.verificationCode}
                      onChange={handleAdminVerifyInput}
                      placeholder="Enter admin verification code"
                      required
                    />
                  </label>
                  <button type="submit">
                    {user.role === "admin" ? "Verify Admin Access" : "Request Admin Verification"}
                  </button>
                </form>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SettingsOfficials;
