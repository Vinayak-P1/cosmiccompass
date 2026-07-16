import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/";
  const { login } = useContext(AuthContext);
  const [tab, setTab] = useState("login");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: verify, 2: set new
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const API = import.meta.env.VITE_API_URL || "";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user && data.token) {
        login(data.user, data.token);
        alert("Login successful!");
        if (data.user.isAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate(redirectPath, { replace: true });
        }
      } else {
        alert(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Server error during login: " + err.message);
    }

  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("securityAnswer", securityAnswer || "");
      if (profilePicFile) formData.append("profilePic", profilePicFile);

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.user && data.token) {
        login(data.user, data.token);
        alert("Signup successful!");
        navigate(redirectPath, { replace: true });
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      alert("Server error during signup: " + err.message);
    }
  };

  const handleForgotVerify = async () => {
    try {
      const res = await fetch(`${API}/api/auth/forgot/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail || email, securityAnswer: forgotAnswer }),
      });
      const j = await res.json();
      if (res.ok && j.success) {
        setForgotStep(2);
        alert("Security answer correct. Enter new password.");
      } else {
        alert(j.error || "Incorrect security answer");
      }
    } catch (e) {
      console.error(e);
      alert("Server error");
    }
  };

  const handleForgotReset = async () => {
    try {
      const res = await fetch(`${API}/api/auth/forgot/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail || email, securityAnswer: forgotAnswer, newPassword }),
      });
      const j = await res.json();
      if (res.ok && j.success) {
        alert("Password reset successful. Please login with new password.");
        setForgotMode(false);
        setForgotStep(1);
        setNewPassword("");
      } else {
        alert(j.error || "Reset failed");
      }
    } catch (e) {
      console.error(e);
      alert("Server error");
    }
  };

  return (
    <div className="font-display min-h-screen flex items-center justify-center pt-20 sm:pt-24 bg-[#030014] text-white relative overflow-hidden">
      {/* 🌌 Animated Starfield Background */}
 <div className="absolute inset-0 bg-[radial-gradient(white,rgba(255,255,255,0.15)_1px,transparent_40px),radial-gradient(white,rgba(255,255,255,0.1)_1px,transparent_30px),radial-gradient(white,rgba(255,255,255,0.05)_2px,transparent_40px),radial-gradient(rgba(255,255,255,0.25),rgba(255,255,255,0.05)_2px,transparent_30px)] bg-[size:550px_550px,350px_350px,250px_250px,150px_150px] bg-[position:0_0,40px_60px,130px_270px,70px_100px] animate-stars"></div>


      {/* 🌠 Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b20]/40 via-[#0b0b20]/30 to-[#1b0033]/20 pointer-events-none"></div>

      {/* Login/Signup Card */}
      <div className="relative w-full max-w-md bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg" style={{fontFamily:'Inter,sans-serif'}}>
              Urban<span className="text-blue-400">Astro</span>
            </h1>
            <p className="text-white/70 mt-2">
              {tab === "login"
                ? "Your Stars, Your City."
                : "Create your account"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-black/20 dark:bg-white/5 rounded-full p-1 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`w-1/2 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
                tab === "login"
                  ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`w-1/2 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
                tab === "signup"
                  ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {tab === "login" ? (
            <>
            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg h-12 px-4 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg h-12 px-4 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {/* security question is collected at signup, not at login */}
              <div className="flex justify-end">
                <button type="button" onClick={() => { setForgotMode(true); setForgotEmail(email); }} className="text-sm text-white/70 hover:underline">Forgot password?</button>
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 font-bold rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
              >
                Login
              </button>
            </form>
            {forgotMode && (
              <div className="mt-4 p-4 bg-white/5 rounded">
                <h3 className="font-bold mb-2">Forgot Password</h3>
                {forgotStep === 1 ? (
                  <>
                    <input value={forgotEmail} onChange={(e)=>setForgotEmail(e.target.value)} placeholder="Email" className="w-full mb-2 p-2 rounded bg-black/30" />
                    <label className="text-sm text-white/70 mb-1 block">Security Question: Enter last 4 digits of your mobile</label>
                    <input value={forgotAnswer} onChange={(e)=>setForgotAnswer(e.target.value)} placeholder="Last 4 digits" className="w-full mb-2 p-2 rounded bg-black/30" />
                    <div className="flex gap-2">
                      <button onClick={handleForgotVerify} className="bg-blue-500 px-3 py-2 rounded">Verify</button>
                      <button onClick={()=>{ setForgotMode(false); setForgotStep(1); }} className="px-3 py-2 rounded border">Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <input value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} type="password" placeholder="New password" className="w-full mb-2 p-2 rounded bg-black/30" />
                    <div className="flex gap-2">
                      <button onClick={handleForgotReset} className="bg-green-600 px-3 py-2 rounded">Set New Password</button>
                      <button onClick={()=>{ setForgotMode(false); setForgotStep(1); }} className="px-3 py-2 rounded border">Cancel</button>
                    </div>
                  </>
                )}
              </div>
            )}
            </>
          ) : (
            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <img
                    src={
                      profilePicPreview ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-blue-400 shadow-lg"
                  />
                  <label
                    htmlFor="file-upload"
                    className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 cursor-pointer hover:bg-blue-600 transition"
                  >
                    <span className="material-symbols-outlined text-white text-[18px]">
                      edit
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg h-12 px-4 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg h-12 px-4 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg h-12 px-4 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <input
                type="text"
                placeholder="Security answer (last 4 digits of mobile)"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg h-12 px-4 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button
                type="submit"
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 font-bold rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
              >
                Sign Up
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
