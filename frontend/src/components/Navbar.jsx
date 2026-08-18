import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { 
  Plus, 
  Search, 
  X, 
  Palette, 
  StickyNote,
  Menu,
  Bell,
  Volume2,
  Info,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  BellOff,
  Check,
  Sun,
  Moon
} from "lucide-react";
import { 
  playAlarmSound, 
  requestNotificationPermission, 
  getNotificationPermissionStatus, 
  isNotificationSettingEnabled,
  setNotificationSettingEnabled 
} from "../services/alarmService";
import toast from "react-hot-toast";

const LIGHT_THEMES = [
  { name: "light", label: "Light", color: "#3b82f6" },
  { name: "emerald", label: "Emerald", color: "#10b981" },
  { name: "cupcake", label: "Cupcake", color: "#65c3c8" },
  { name: "corporate", label: "Corporate", color: "#4b6bfb" },
];

const DARK_THEMES = [
  { name: "dark", label: "Dark", color: "#1f2937" },
  { name: "dracula", label: "Dracula", color: "#ff79c6" },
  { name: "synthwave", label: "Synthwave", color: "#e779c1" },
  { name: "sunset", label: "Sunset", color: "#ff865b" },
];

const Navbar = ({ searchQuery = "", setSearchQuery, onEnableSelectionMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const menuContainerRef = useRef(null);
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "emerald";
  });

  const [notifPermission, setNotifPermission] = useState(getNotificationPermissionStatus());
  const [notifSettingEnabled, setNotifSettingEnabled] = useState(isNotificationSettingEnabled());
  
  // Controlled Menu & Theme Window states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showThemeSubmenu, setShowThemeSubmenu] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Click outside listener to close menu only when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setIsMenuOpen(false);
        setShowThemeSubmenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    if (setSearchQuery) setSearchQuery("");
  };

  const handleTestSound = (e) => {
    e.preventDefault();
    e.stopPropagation();
    playAlarmSound();
    toast.success("🔊 Playing chime sound test!");
  };

  const handleToggleNotifications = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notifSettingEnabled) {
      const granted = await requestNotificationPermission();
      setNotifPermission(getNotificationPermissionStatus());
      setNotificationSettingEnabled(true);
      setNotifSettingEnabled(true);
      if (granted) {
        toast.success("🔔 Desktop notifications enabled!");
      } else {
        toast.error("Notification permission was not granted by browser");
      }
    } else {
      setNotificationSettingEnabled(false);
      setNotifSettingEnabled(false);
      toast.success("🔕 Desktop notifications disabled");
    }
  };

  const handleSelectMultipleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setShowThemeSubmenu(false);
    if (location.pathname !== "/") {
      navigate("/");
    }
    if (onEnableSelectionMode) {
      onEnableSelectionMode();
    }
  };

  const handleToggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
    if (isMenuOpen) {
      setShowThemeSubmenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-base-100/90 border-b border-base-content/10 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group shrink-0 focus:outline-none"
            onClick={() => {
              setIsMenuOpen(false);
              setShowThemeSubmenu(false);
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-primary-content font-bold shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight leading-none group-hover:text-primary transition-colors">
                SlackNotes
              </span>
              <span className="text-[10px] text-base-content/50 font-medium tracking-wider mt-0.5">
                by Slack-Hacker
              </span>
            </div>
          </Link>

          {/* Right Header Controls: Search bar positioned right next to Menu button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {location.pathname === "/" && setSearchQuery && (
              <div className="w-40 sm:w-60 md:w-72">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-sm w-full pl-8 pr-8 rounded-xl bg-base-200/70 border border-base-content/10 transition-all text-xs shadow-inner focus:outline-none focus:border-primary"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content p-0.5 rounded-full hover:bg-base-200"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Controlled App Menu Container */}
            <div className="shrink-0 relative" ref={menuContainerRef}>
            
            {/* Clean Hamburger Menu Button (Icon Only, No Arrow or Text) */}
            <button 
              type="button"
              onClick={handleToggleMenu}
              className={`btn btn-ghost btn-circle btn-sm hover:bg-base-200 transition-all ${
                isMenuOpen ? "text-primary bg-primary/10" : "text-base-content/80"
              }`}
              title="Open App Menu & Settings"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Controlled Menu Options Card */}
            {isMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 bg-base-100 rounded-3xl p-3 shadow-2xl border border-base-content/10 z-50 text-xs animate-fade-in space-y-1"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Title */}
                <div className="text-[11px] font-bold text-base-content/40 uppercase tracking-wider px-2 py-1 flex justify-between items-center">
                  <span>SlackNotes Menu</span>
                  <span className="text-[10px] text-primary lowercase font-mono">by Slack-Hacker</span>
                </div>

                {/* 1. Create New Note */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowThemeSubmenu(false);
                    navigate("/create");
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4" />
                    <span>New Note</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* 2. Delete Multiple Notes Option */}
                <button
                  type="button"
                  onClick={handleSelectMultipleClick}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-error/10 text-error font-semibold transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4" />
                    <span>Select / Delete Multiples</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <div className="divider my-0.5 opacity-40" />

                {/* 3. Theme Options Trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowThemeSubmenu(!showThemeSubmenu);
                  }}
                  className={`w-full flex items-center justify-between py-2.5 px-2.5 rounded-xl font-semibold transition-all text-left ${
                    showThemeSubmenu 
                      ? "bg-primary/15 text-primary" 
                      : "hover:bg-base-200 text-base-content/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-primary" />
                    <span>Theme Options</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-primary capitalize font-bold bg-primary/10 px-2 py-0.5 rounded-lg">
                      {theme}
                    </span>
                    <ChevronLeft className={`w-3.5 h-3.5 text-base-content/50 transition-transform ${showThemeSubmenu ? "rotate-90 text-primary" : ""}`} />
                  </div>
                </button>

                {/* 4. Audio Alarm & Notification Settings */}
                <div className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider px-2 pt-2">
                  Notification & Audio
                </div>

                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-base-200 text-base-content/80 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {notifSettingEnabled ? (
                      <Bell className="w-4 h-4 text-accent" />
                    ) : (
                      <BellOff className="w-4 h-4 text-base-content/40" />
                    )}
                    <span>Desktop Notifications</span>
                  </div>
                  
                  {/* Toggle Switch */}
                  <input 
                    type="checkbox" 
                    checked={notifSettingEnabled && notifPermission === "granted"} 
                    onChange={() => {}} // handled by button click
                    className="toggle toggle-xs toggle-primary pointer-events-none" 
                  />
                </button>

                <button
                  type="button"
                  onClick={handleTestSound}
                  className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-base-200 text-base-content/80 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-secondary" />
                    <span>Test Alarm Chime</span>
                  </div>
                  <span className="text-[10px] text-secondary font-bold">Play 🔊</span>
                </button>

                <div className="divider my-0.5 opacity-40" />

                {/* 5. About SlackNotes */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowThemeSubmenu(false);
                    navigate("/about");
                  }}
                  className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-base-200 font-semibold text-base-content/80 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-info" />
                    <span>About SlackNotes</span>
                  </div>
                  <span className="text-[10px] text-base-content/50">v2.0</span>
                </button>

              </div>
            )}

            {/* Small Attached Theme Window */}
            {isMenuOpen && showThemeSubmenu && (
              <div 
                className="absolute right-[calc(100%+0.75rem)] top-0 w-64 bg-base-100 p-4 shadow-2xl rounded-3xl border border-base-content/15 z-50 space-y-3 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-1 pb-1.5 border-b border-base-content/10">
                  <span className="font-bold text-xs text-base-content flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-primary" /> Theme Options
                  </span>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowThemeSubmenu(false);
                    }}
                    className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content"
                    title="Close theme window"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4 Light Themes */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 px-1 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-warning" /> Light Themes (4)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {LIGHT_THEMES.map((t) => {
                      const isActive = theme === t.name;
                      return (
                        <button
                          key={t.name}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTheme(t.name);
                            toast.success(`Theme set to ${t.label} ☀️`);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive 
                              ? "bg-primary text-primary-content shadow-xs font-bold" 
                              : "bg-base-200/60 hover:bg-base-200 text-base-content/80"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-base-content/20 shrink-0" 
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="truncate capitalize text-[11px]">{t.label}</span>
                          </div>
                          {isActive && <Check className="w-3 h-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Dark Themes */}
                <div className="space-y-1 pt-1 border-t border-base-content/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 px-1 flex items-center gap-1">
                    <Moon className="w-3 h-3 text-primary" /> Dark Themes (4)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DARK_THEMES.map((t) => {
                      const isActive = theme === t.name;
                      return (
                        <button
                          key={t.name}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTheme(t.name);
                            toast.success(`Theme set to ${t.label} 🌙`);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive 
                              ? "bg-primary text-primary-content shadow-xs font-bold" 
                              : "bg-base-200/60 hover:bg-base-200 text-base-content/80"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-base-content/20 shrink-0" 
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="truncate capitalize text-[11px]">{t.label}</span>
                          </div>
                          {isActive && <Check className="w-3 h-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  </header>
  );
};

export default Navbar;
