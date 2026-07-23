import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, NavLink, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, ChevronDown, LogOut, Shield, LayoutDashboard, Globe, Users, Calendar, Sparkles, User, ChevronRight } from "lucide-react";

const Navbar = () => {
  const API = import.meta.env.VITE_API_URL || "";

  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure dropdown is closed when user changes (e.g., after login/signup/navigation)
  useEffect(() => {
    setDropdown(false);
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMenu(false);
  }, [navigate, user, location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
      isActive
        ? "text-white bg-white/[0.06]"
        : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3.5 text-base font-medium rounded-xl transition-all cursor-pointer ${
      isActive
        ? "text-white bg-[#7C3AED]/20 border border-[#7C3AED]/30 font-semibold"
        : "text-white/70 hover:text-white hover:bg-white/[0.04] border border-transparent"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-2xl bg-[#050816]">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 cursor-pointer no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
            <span className="text-white text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>U</span>
          </div>
          <span
            className="text-white font-bold text-base tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            UrbanAstro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink to="/astrologers" className={navLinkClass}>
            Astrologers
          </NavLink>
          <NavLink to="/my-bookings" className={navLinkClass}>
            My Bookings
          </NavLink>
          <NavLink to="/askai" className={navLinkClass}>
            Ask AI
          </NavLink>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdown((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                <img
                  src={
                    user.profilePic
                      ? user.profilePic.startsWith("http")
                        ? user.profilePic
                        : `${API}${user.profilePic}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="profile"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-white/70 text-sm font-medium max-w-[100px] truncate">
                  {user.name || "User"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${dropdown ? "rotate-180" : ""}`} />
              </button>

              {dropdown && (
                <div className="absolute right-0 mt-2 w-48 ua-card py-2 shadow-lg shadow-black/30 z-50">
                  <div className="px-4 py-2.5 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-white/30 truncate">{user.phone || ""}</p>
                  </div>
                  {user.isAdmin && (
                    <button
                      onClick={() => {
                        navigate("/admin/dashboard");
                        setDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Panel
                    </button>
                  )}
                  {location.pathname.startsWith("/admin") && (
                    <button
                      onClick={() => {
                        navigate("/");
                        setDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Main Website
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:text-red-400 hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="ua-btn-primary"
            >
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Mobile hamburger button */}
        {!(
          location.pathname === "/login" ||
          location.pathname === "/signup"
        ) && (
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setShowMenu((s) => !s)}
              aria-label="Toggle menu"
              className="p-2.5 rounded-xl text-white/70 hover:text-white bg-white/[0.04] border border-white/[0.08] transition-colors cursor-pointer"
            >
              {showMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay — 100% OPAQUE BACKGROUND SOLID FIX */}
      {showMenu && (
        <div
          className="lg:hidden fixed top-[64px] left-0 right-0 bottom-0 z-[99999] bg-[#050816] border-t border-white/[0.08] flex flex-col justify-between p-5 overflow-y-auto"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="space-y-4">
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-widest px-2 pt-2">
              Navigation
            </div>
            <nav className="flex flex-col gap-2">
              <NavLink
                to="/astrologers"
                onClick={() => setShowMenu(false)}
                className={mobileNavLinkClass}
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <span>Astrologers</span>
                <ChevronRight className="w-4 h-4 ml-auto text-white/30" />
              </NavLink>

              <NavLink
                to="/my-bookings"
                onClick={() => setShowMenu(false)}
                className={mobileNavLinkClass}
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#22D3EE]" />
                </div>
                <span>My Bookings</span>
                <ChevronRight className="w-4 h-4 ml-auto text-white/30" />
              </NavLink>

              <NavLink
                to="/askai"
                onClick={() => setShowMenu(false)}
                className={mobileNavLinkClass}
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <span>Ask AI</span>
                <ChevronRight className="w-4 h-4 ml-auto text-white/30" />
              </NavLink>

              {user && user.isAdmin && (
                <button
                  onClick={() => {
                    navigate("/admin/dashboard");
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3.5 text-base font-medium rounded-xl text-white/70 hover:text-white bg-white/[0.03] border border-white/[0.06] transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-[#7C3AED]" />
                  </div>
                  <span>Admin Panel</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-white/30" />
                </button>
              )}
            </nav>
          </div>

          {/* Bottom Profile / Login Card */}
          <div className="pt-4 border-t border-white/[0.08] mt-auto">
            {user ? (
              <div className="ua-card p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      user.profilePic
                        ? user.profilePic.startsWith("http")
                          ? user.profilePic
                          : `${API}${user.profilePic}`
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="profile"
                    className="w-11 h-11 rounded-full object-cover border border-white/[0.1] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm truncate">
                      {user.name || "User"}
                    </div>
                    <div className="text-xs text-white/40 truncate">
                      {user.phone || ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {user.isAdmin && (
                    <button
                      onClick={() => {
                        navigate("/admin/dashboard");
                        setShowMenu(false);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-[#22D3EE] bg-[#7C3AED]/20 rounded-lg border border-[#7C3AED]/30"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                      navigate("/");
                    }}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-white/[0.04] rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setShowMenu(false);
                }}
                className="w-full ua-btn-primary justify-center text-base py-3.5 shadow-lg shadow-[#7C3AED]/25"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
