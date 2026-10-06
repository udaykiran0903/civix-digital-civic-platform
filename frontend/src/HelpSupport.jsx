import "./civic.css";

const HelpSupport = ({ userData, onLogout, onNavigate }) => {
  const user = userData || {};
  const displayName = user.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = user.email || '';
  const userLocation = user.location || 'Your City';
  const userRole = user.role === "admin" ? "Admin" : user.role === "official" ? "Unverified Official" : "Citizen";

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

          <div className="help-card active">
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
          <section className="help-header">
            <h1>Help & Support</h1>
            <p>We're here to help you. Get in touch with our support team.</p>
          </section>

          {/* Contact Cards */}
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon email">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Email Support</h3>
              <p>For general inquiries and support</p>
              <a href="mailto:support@civix.com" className="contact-link">support@civix.com</a>
            </div>

            <div className="contact-card">
              <div className="contact-icon phone">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Phone Support</h3>
              <p>Call us for urgent assistance</p>
              <a href="tel:+911800123456" className="contact-link">+91 1800-123-456</a>
              <p className="contact-hours">Mon-Fri, 9AM - 6PM IST</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon urgent">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Report Issues</h3>
              <p>Report technical issues or bugs</p>
              <a href="mailto:issues@civix.com" className="contact-link">issues@civix.com</a>
            </div>
          </div>

          {/* Raise Concern Form */}
          <div className="raise-concern-section">
            <h2>Raise a Concern</h2>
            <p className="section-desc">Have a question or concern? Fill out the form below and we'll get back to you within 24 hours.</p>
            
            <form className="concern-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="concern-name">Your Name</label>
                  <input
                    type="text"
                    id="concern-name"
                    defaultValue={displayName}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="concern-email">Your Email</label>
                  <input
                    type="email"
                    id="concern-email"
                    defaultValue={userEmail}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="concern-type">Concern Type</label>
                <select id="concern-type">
                  <option value="">Select a type</option>
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account Problem</option>
                  <option value="petition">Petition Related</option>
                  <option value="poll">Poll Related</option>
                  <option value="privacy">Privacy Concern</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="concern-subject">Subject</label>
                <input
                  type="text"
                  id="concern-subject"
                  placeholder="Brief description of your concern"
                />
              </div>

              <div className="form-group">
                <label htmlFor="concern-message">Message</label>
                <textarea
                  id="concern-message"
                  rows="6"
                  placeholder="Provide detailed information about your concern..."
                ></textarea>
              </div>

              <button type="submit" className="btn-submit-concern">
                Submit Concern
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-item">
              <h3>How do I create a petition?</h3>
              <p>Navigate to the Petitions page and click the "+ Create Petition" button. Fill in the required details and submit.</p>
            </div>

            <div className="faq-item">
              <h3>How do I vote in a poll?</h3>
              <p>Go to the Polls page, select a poll, and click on your preferred option to cast your vote.</p>
            </div>

            <div className="faq-item">
              <h3>Can I delete my petition or poll?</h3>
              <p>Yes, you can delete petitions and polls that you've created by clicking the delete button in the details view.</p>
            </div>

            <div className="faq-item">
              <h3>How do I change my account settings?</h3>
              <p>Click on Settings in the sidebar menu to update your profile information, password, and preferences.</p>
            </div>

            <div className="faq-item">
              <h3>Is my data secure?</h3>
              <p>Yes, we take data security seriously. All your information is stored securely and encrypted.</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="social-section">
            <h2>Connect With Us</h2>
            <div className="social-links">
              <a href="#" className="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              <a href="#" className="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </a>
              <a href="#" className="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.357.232-.548.232-.357 0-.297-.134-.42-.473l-.94-3.087-2.998-.924c-.643-.204-.657-.643.136-.953l11.694-4.506c.537-.194 1.006.128.832.941z"/>
                </svg>
                Telegram
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HelpSupport;
