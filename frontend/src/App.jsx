import axios from "axios";
import { useState, useEffect } from "react";
import Login from "./login";
import Dashboard from "./Dashboard";
import Petitions from "./Petitions";
import CreatePetition from "./CreatePetition";
import Polls from "./Polls";
import CreatePoll from "./CreatePoll";
import Reports from "./Reports";
import Officials from "./Officials";
import SettingsOfficials from "./SettingsOfficials";
import Settings from "./Settings";
import HelpSupport from "./HelpSupport";
import { NOTIFY_EVENT_NAME } from "./notify";
import "./civic.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [initialPetitionId, setInitialPetitionId] = useState(null);
  const [toast, setToast] = useState(null);

  // Check localStorage on app mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    const petitionParam = params.get("petitionId");

    if (pageParam) {
      setCurrentPage(pageParam);
    }

    if (petitionParam) {
      setInitialPetitionId(petitionParam);
    }

    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(res.data);
        setIsLoggedIn(true);

        // FIX: Redirect officials to officials page on app load
        if (["official", "admin"].includes(res.data?.role)) {
          setCurrentPage("officials");
        }
      } catch {
        localStorage.removeItem("token");
      }
    };

    restoreSession();

    // Apply dark mode if enabled
    const darkMode = localStorage.getItem('civix_darkMode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  useEffect(() => {
    let timeoutId;

    const handleNotify = (event) => {
      const nextToast = event?.detail;
      if (!nextToast?.message) return;

      setToast(nextToast);

      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setToast(null);
      }, nextToast.duration || 2600);
    };

    window.addEventListener(NOTIFY_EVENT_NAME, handleNotify);

    return () => {
      window.removeEventListener(NOTIFY_EVENT_NAME, handleNotify);
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleLogin = (data) => {
    setUserData(data);
    setIsLoggedIn(true);

    if (["official", "admin"].includes(data?.role)) {
      setCurrentPage("officials");
    } else {
      setCurrentPage("dashboard");
    }
  };

  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
    localStorage.removeItem("token");
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);

    if (page !== "petitions" && initialPetitionId) {
      setInitialPetitionId(null);
      const params = new URLSearchParams(window.location.search);
      params.delete("petitionId");
      if (params.get("page") !== page) {
        params.set("page", page);
      }
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    }
  };

  const handleUpdateUser = (updatedData) => {
    setUserData(updatedData);
  };

  return (
    <div>
      {toast && (
        <div className="ui-toast-wrap">
          <div className={`ui-toast ui-toast-${toast.type || "success"}`}>
            <span className="ui-toast-message">{toast.message}</span>
            <button
              type="button"
              className="ui-toast-close"
              onClick={() => setToast(null)}
              aria-label="Close notification"
            >
              x
            </button>
          </div>
        </div>
      )}

      {isLoggedIn ? (
        <>
          {currentPage === "dashboard" && (
            <Dashboard userData={userData} onLogout={handleLogout} onNavigate={handleNavigate} />
          )}
          {currentPage === "petitions" && (
            <Petitions
              userData={userData}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
              initialPetitionId={initialPetitionId}
              onPetitionLinkHandled={() => setInitialPetitionId(null)}
            />
          )}
          {currentPage === "create-petition" && (
            <CreatePetition userData={userData} onNavigate={handleNavigate} />
          )}
          {currentPage === "polls" && (
            <Polls userData={userData} onLogout={handleLogout} onNavigate={handleNavigate} />
          )}
          {currentPage === "create-poll" && (
            <CreatePoll userData={userData} onLogout={handleLogout} onNavigate={handleNavigate} />
          )}
          {currentPage === "reports" && (
            <Reports userData={userData} onLogout={handleLogout} onNavigate={handleNavigate} />
          )}
          {currentPage === "officials" && (
            <Officials
              userData={userData}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
              onUpdateUser={handleUpdateUser}
            />
          )}
          {currentPage === "settings" && (
            <Settings userData={userData} onLogout={handleLogout} onNavigate={handleNavigate} onUpdateUser={handleUpdateUser} />
          )}
          {currentPage === "settingsOfficials" && (
            <SettingsOfficials userData={userData} onLogout={handleLogout} onNavigate={handleNavigate} onUpdateUser={handleUpdateUser} />
          )}
          {currentPage === "help" && (
            <HelpSupport userData={userData} onLogout={handleLogout} onNavigate={handleNavigate} />
          )}
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
