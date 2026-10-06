import axios from "axios";
import { useState } from "react";
import { notifyError, notifyInfo, notifySuccess } from "./notify";
import "./civic.css";

function Login({ onLogin }) {

const [activeForm, setActiveForm] = useState("login");
const [keepSignedIn, setKeepSignedIn] = useState(true);

const [otp, setOtp] = useState("");
const [emailForOtp, setEmailForOtp] = useState("");
const [newPassword, setNewPassword] = useState("");
const [loginEmail, setLoginEmail] = useState("");
const [accountType, setAccountType] = useState("citizen");

// ================= LOGIN =================

const handleLogin = async (e) => {

e.preventDefault();

const data = {
email: e.target.email.value,
password: e.target.password.value,
role: accountType,
};

try {

const res = await axios.post(
"http://localhost:5000/api/auth/login",
data
);

localStorage.setItem("token", res.data.token);

notifySuccess("Login successful");

if (onLogin) {
onLogin(res.data);
}

} catch (error) {
const message = error.response?.data?.message || "Login failed";

if (message.toLowerCase().includes("verify your email")) {
setEmailForOtp(data.email);
setOtp("");
notifyInfo("Please enter the OTP sent to your email.");
setActiveForm("otp");
return;
}

notifyError(message);

}

};

// ================= REGISTER =================

const handleRegister = async (e) => {

e.preventDefault();

const data = {
name: e.target[0].value,
email: e.target[1].value,
password: e.target[2].value,
location: e.target[3].value,
role: accountType,
};

try {

const res = await axios.post(
"http://localhost:5000/api/auth/register",
data
);

notifySuccess(res.data.message || "Registration successful");

setEmailForOtp(data.email);
setOtp("");
setActiveForm("otp");

} catch (error) {

notifyError(error.response?.data?.message || "Register failed");

}

};

// ================= VERIFY EMAIL OTP =================

const handleVerifyOtp = async (e) => {

e.preventDefault();

try {

const res = await axios.post(
"http://localhost:5000/api/auth/verify-email",
{
email: emailForOtp,
otp: otp
}
);

notifySuccess(res.data.message || "Email verified successfully");

setOtp("");
setLoginEmail(emailForOtp);
setActiveForm("login");

} catch (error) {

notifyError(error.response?.data?.message || "OTP verification failed");

}

};

const handleResendVerificationOtp = async () => {

if (!emailForOtp) {
notifyError("Please register first to set your email for verification");
return;
}

try {

const res = await axios.post(
"http://localhost:5000/api/auth/resend-verification",
{ email: emailForOtp }
);

notifySuccess(res.data?.message || "A new OTP has been sent");

} catch (error) {

notifyError(error.response?.data?.message || "Failed to resend OTP");

}

};

// ================= FORGOT PASSWORD =================

const handleSendOtp = async (e) => {

e.preventDefault();

const email = e.target.email.value;

try{

const res = await axios.post(
"http://localhost:5000/api/auth/forgot-password",
{ email }
);

setEmailForOtp(email);

notifySuccess(res.data?.message || "OTP sent to your email");

if (res.data?.devOtp) {
setOtp(String(res.data.devOtp));
notifyInfo(`Dev OTP: ${res.data.devOtp}`);
}

setActiveForm("reset");

}catch(error){

notifyError(error.response?.data?.message || "Error sending OTP");

}

};

// ================= RESET PASSWORD =================

const handleResetPassword = async (e) => {

e.preventDefault();

try{

await axios.post(
"http://localhost:5000/api/auth/reset-password",
{
email: emailForOtp,
otp: otp,
newPassword: newPassword
}
);

notifySuccess("Password updated successfully");

setActiveForm("login");

}catch(error){

notifyError(error.response?.data?.message || "Reset failed");

}

};

return (

<div className="login-container">

<div className="login-left">

<div className="login-header">

<div className="login-logo">

<svg viewBox="0 0 24 24" fill="none">

<path d="M4 11.5L12 4l8 7.5" stroke="white" strokeWidth="2"/>

<path d="M7 10.5v8h10v-8" stroke="white" strokeWidth="2"/>

</svg>

</div>

<h1>Civix</h1>

<p className="subtitle-left">
Digital Civic Engagement Platform
</p>

<p className="intro-left">
Civix enables citizens to engage in local governance through petitions, voting, and tracking officials' responses. Join our platform to make your voice heard and drive positive change in your community.
</p>

</div>

<div className="login-features">

<div className="feature-item">

<div className="feature-icon">

<svg viewBox="0 0 24 24" fill="none">

<path d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7" stroke="white" strokeWidth="2"/>

<path d="M5 8h8M5 12h8M5 16h6" stroke="white" strokeWidth="2"/>

</svg>

</div>

<div>
<h3>Create & Sign Petitions</h3>
<p>Easily create petitions for issues you care about.</p>
</div>

</div>

<div className="feature-item">

<div className="feature-icon">

<svg viewBox="0 0 24 24" fill="none">
<path d="M4 12h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
<path d="M12 4v16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
</svg>

</div>

<div>
<h3>Participate in Public Polls</h3>
<p>Vote on local issues and see real-time community sentiment.</p>
</div>

</div>

<div className="feature-item">

<div className="feature-icon">

<svg viewBox="0 0 24 24" fill="none">
<circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
<path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

</div>

<div>
<h3>Track Official Responses</h3>
<p>Follow updates from officials and monitor progress on issues.</p>
</div>

</div>

<div className="feature-item">

<div className="feature-icon">

<svg viewBox="0 0 24 24" fill="none">
<path d="M7 5h10v14H7z" stroke="white" strokeWidth="2"/>
<path d="M9 9h6M9 13h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
</svg>

</div>

<div>
<h3>Report Civic Issues</h3>
<p>Submit structured reports for local problems with clear details.</p>
</div>

</div>

<div className="feature-item">

<div className="feature-icon">

<svg viewBox="0 0 24 24" fill="none">
<path d="M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
<path d="M8 18v-6M12 18v-10M16 18v-3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
</svg>

</div>

<div>
<h3>Measure Community Impact</h3>
<p>Track participation and outcomes to understand civic momentum.</p>
</div>

</div>

</div>

</div>

<div className="login-right">

<div className="login-card">

<h2 className="login-title">Welcome to Civix</h2>

<p className="login-subtitle">
Join our platform to make your voice heard.
</p>

{(activeForm === "login" || activeForm === "register") && (

<div className="login-tabs">

<button
className={activeForm === "login" ? "login-tab active" : "login-tab"}
onClick={() => setActiveForm("login")}

>

Login </button>

<button
className={activeForm === "register" ? "login-tab active" : "login-tab"}
onClick={() => setActiveForm("register")}

>

Register </button>

</div>

)}

{/* LOGIN */}

{activeForm === "login" && (

<form className="login-form" onSubmit={handleLogin}>

<div className="login-field">
<label>Email</label>
<input
type="email"
name="email"
value={loginEmail}
onChange={(e) => setLoginEmail(e.target.value)}
required
/>
</div>

<div className="login-field">
<label>Password</label>
<input type="password" name="password" required />
</div>

<div className="login-field">
<label>Login as</label>
<select
value={accountType}
onChange={(e) => setAccountType(e.target.value)}
required
>
<option value="citizen">Citizen</option>
<option value="official">Public Official</option>
</select>
</div>

<button type="submit" className="login-btn">
Sign In
</button>

<p className="login-link">
<a onClick={() => setActiveForm("forgot")}>
Forgot Password?
</a>
</p>

<p className="login-link">
<a onClick={() => setActiveForm("register")}>
Register now
</a>
</p>

</form>

)}

{/* REGISTER */}

{activeForm === "register" && (

<form className="login-form" onSubmit={handleRegister}>

<div className="login-field">
<label>Full Name</label>
<input type="text" required />
</div>

<div className="login-field">
<label>Email</label>
<input type="email" required />
</div>

<div className="login-field">
<label>Password</label>
<input type="password" required />
</div>

<div className="login-field">
<label>Location</label>
<input type="text" required />
</div>

<div className="login-field">
<label>Register as</label>
<select
value={accountType}
onChange={(e) => setAccountType(e.target.value)}
required
>
<option value="citizen">Citizen</option>
<option value="official">Public Official</option>
</select>
</div>

<button type="submit" className="login-btn">
Create Account
</button>

</form>

)}

{/* VERIFY OTP */}

{activeForm === "otp" && (

<form className="login-form" onSubmit={handleVerifyOtp}>

<p className="login-subtitle">Verifying: {emailForOtp}</p>

<div className="login-field">

<label>Enter OTP</label>

<input
type="text"
value={otp}
onChange={(e) => setOtp(e.target.value)}
required
/>

</div>

<button type="submit" className="login-btn">
Verify OTP
</button>

<p className="login-link">
<a onClick={handleResendVerificationOtp}>
Resend OTP
</a>
</p>

</form>

)}

{/* FORGOT PASSWORD */}

{activeForm === "forgot" && (

<form className="login-form" onSubmit={handleSendOtp}>

<div className="login-field">
<label>Email</label>
<input type="email" name="email" required />
</div>

<button type="submit" className="login-btn">
Send OTP
</button>

</form>

)}

{/* RESET PASSWORD */}

{activeForm === "reset" && (

<form className="login-form" onSubmit={handleResetPassword}>

<div className="login-field">
<label>OTP</label>
<input
type="text"
value={otp}
onChange={(e) => setOtp(e.target.value)}
required
/>
</div>

<div className="login-field">
<label>New Password</label>
<input
type="password"
value={newPassword}
onChange={(e) => setNewPassword(e.target.value)}
required
/>
</div>

<button type="submit" className="login-btn">
Reset Password
</button>

</form>

)}

</div>

</div>

</div>

);

}

export default Login;
