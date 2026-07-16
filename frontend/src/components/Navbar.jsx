import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import menuIcon from "../assets/menu_icon.svg";
import crossIcon from "../assets/cross_icon.png";

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

  // close mobile menu on route change
  useEffect(() => {
    setShowMenu(false);
  }, [navigate, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <a
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-tight" style={{fontFamily:'Inter,sans-serif'}}>Urban<span className="text-blue-400">Astro</span></span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <NavLink
            to="/astrologers"
            className={({ isActive }) =>
              `cursor-pointer transition ${
                isActive
                  ? 'text-blue-500 font-semibold'
                  : 'text-white hover:text-sky-500'
              }`
            }
          >
            Astrologers
          </NavLink>
          <NavLink
            to="/my-bookings"
            className={({ isActive }) =>
              `cursor-pointer transition ${
                isActive
                  ? 'text-blue-500 font-semibold'
                  : 'text-white hover:text-sky-500'
              }`
            }
          >
            My Bookings
          </NavLink>
          <NavLink
            to="/askai"
            className={({ isActive }) =>
              `cursor-pointer transition ${
                isActive
                  ? 'text-blue-500 font-semibold'
                  : 'text-white hover:text-sky-500'
              }`
            }
          >
            Ask AI
          </NavLink>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <img
                src={
                  user.profilePic
      ? (user.profilePic.startsWith('http') ? user.profilePic : `${API}${user.profilePic}`)
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="profile"
                className="w-10 h-10 rounded-full border-2 border-blue-400 cursor-pointer hover:opacity-90 transition"
                onClick={() => setDropdown((prev) => !prev)}
              />
              {dropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow-lg py-2 z-50">
                  <p className="px-4 py-2 text-sm font-semibold border-b border-gray-200">
                    {user.name || "User"}
                  </p>
                  {user.isAdmin && (
                    <button
                      onClick={() => {
                        navigate("/admin/dashboard");
                        setDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Admin Panel
                    </button>
                  )}
                  {location.pathname.startsWith("/admin") && (
                    <button
                      onClick={() => {
                        navigate("/");
                        setDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Main Website
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
            >
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Mobile hamburger (hidden on auth pages) */}
        {!(location.pathname === '/login' || location.pathname === '/signup') && (
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setShowMenu((s) => !s)}
              aria-label="Toggle menu"
              className="p-2 rounded-md bg-white/10 hover:bg-white/20"
            >
              <img src={showMenu ? crossIcon : menuIcon} alt="menu" className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Mobile menu overlay */}
        {showMenu && (
          <div 
            className="fixed inset-0 lg:hidden"
            style={{ backgroundColor: "#0B0B1A", zIndex: 9999, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/'); setShowMenu(false); }}>
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z"/></svg>
                  </div>
                  <span className="text-white text-lg font-bold tracking-tight" style={{fontFamily:'Inter,sans-serif'}}>Urban<span className="text-blue-400">Astro</span></span>
                </div>
                <button onClick={() => setShowMenu(false)} className="text-white">Close</button>
              </div>

              <nav className="flex flex-col gap-4 mt-4">
                
                <NavLink
                  to="/astrologers"
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    `cursor-pointer text-lg transition ${
                      isActive
                        ? 'text-blue-500 font-semibold'
                        : 'text-white'
                    }`
                  }
                >
                  Astrologers
                </NavLink>
                <NavLink
                  to="/my-bookings"
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    `cursor-pointer text-lg transition ${
                      isActive
                        ? 'text-blue-500 font-semibold'
                        : 'text-white'
                    }`
                  }
                >
                  My Bookings
                </NavLink>
                <NavLink
                  to="/askai"
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    `cursor-pointer text-lg transition ${
                      isActive
                        ? 'text-blue-500 font-semibold'
                        : 'text-white'
                    }`
                  }
                >
                  Ask AI
                </NavLink>
                {user && user.isAdmin && (
                  <button onClick={() => { navigate('/admin/dashboard'); setShowMenu(false); }} className="text-white text-lg text-left">Admin Panel</button>
                )}
              </nav>

              <div className="mt-auto border-t border-white/10 pt-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <img src={user.profilePic ? (user.profilePic.startsWith('http') ? user.profilePic : `${API}${user.profilePic}`) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="profile" className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <div className="font-semibold text-white">{user.name || user.phone || "User"}</div>
                      <div className="flex gap-3 items-center mt-1">
                        {user.isAdmin && (
                          <button onClick={() => { navigate('/admin/dashboard'); setShowMenu(false); }} className="text-sm text-white/80 underline">Admin Panel</button>
                        )}
                        <button onClick={() => { logout(); setShowMenu(false); navigate('/'); }} className="text-sm text-white/80">Logout</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { navigate('/login'); setShowMenu(false); }} className="w-full py-3 bg-white text-black rounded-lg">Login / Sign Up</button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
