import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation, Link } from "react-router";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import CreatePage from "./pages/CreatePage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AlarmModal from "./components/AlarmModal.jsx";
import { noteService } from "./services/api.js";
import { 
  getTriggeredAlarmIds, 
  markAlarmTriggered, 
  clearTriggeredAlarm,
  sendDesktopNotification 
} from "./services/alarmService.js";
import { Heart, Sparkles, Code, Terminal } from "lucide-react";
import toast from "react-hot-toast";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notesCount, setNotesCount] = useState(0);
  const [activeAlarmNote, setActiveAlarmNote] = useState(null);
  const [selectionModeTrigger, setSelectionModeTrigger] = useState(0);
  const location = useLocation();

  const handleEnableSelectionMode = () => {
    setSelectionModeTrigger((prev) => prev + 1);
  };

  // Reset search query when navigating away from home page
  useEffect(() => {
    if (location.pathname !== "/") {
      setSearchQuery("");
    }
  }, [location.pathname]);

  // Real-time Alarm Monitor (polls every 2 seconds for precise alarm ringing)
  useEffect(() => {
    const checkAlarmsAndSync = async () => {
      try {
        const data = await noteService.getAllNotes();
        if (data.success && Array.isArray(data.notes)) {
          setNotesCount(data.notes.length);

          // Check if any note has an active, untriggered alarm
          const now = Date.now();
          const triggeredIds = getTriggeredAlarmIds();

          const alarmNote = data.notes.find((n) => {
            if (!n.reminderDate) return false;
            const rTime = new Date(n.reminderDate).getTime();
            if (isNaN(rTime)) return false;
            // Check if alarm time is due (reached and within last 24 hours) and not dismissed yet
            const isDue = now >= rTime && (now - rTime) < 24 * 60 * 60 * 1000;
            return isDue && !triggeredIds.includes(n._id);
          });

          if (alarmNote && (!activeAlarmNote || activeAlarmNote._id !== alarmNote._id)) {
            sendDesktopNotification(alarmNote.title, alarmNote.content);
            setActiveAlarmNote(alarmNote);
          }
        }
      } catch {
        // silence background polling errors
      }
    };

    checkAlarmsAndSync();
    const interval = setInterval(checkAlarmsAndSync, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [location.pathname, activeAlarmNote]);

  const handleDismissAlarm = (noteId) => {
    markAlarmTriggered(noteId);
    setActiveAlarmNote(null);
    toast.success("Alarm dismissed");
  };

  const handleSnoozeAlarm = async (note) => {
    try {
      // Snooze for 10 minutes
      const newTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await noteService.updateNote(note._id, { reminderDate: newTime });
      clearTriggeredAlarm(note._id);
      setActiveAlarmNote(null);
      toast.success("Alarm snoozed for 10 minutes ⏰");
    } catch {
      setActiveAlarmNote(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-300/30 text-base-content flex flex-col font-sans selection:bg-primary selection:text-primary-content">
      
      {/* Navbar with Search & App Settings Menu */}
      <Navbar 
        notesCount={notesCount} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onEnableSelectionMode={handleEnableSelectionMode}
      />

      {/* Main Body Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                onNotesCountChange={setNotesCount}
                selectionModeTrigger={selectionModeTrigger}
              />
            } 
          />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      {/* Active Alarm Trigger Popup Modal */}
      <AlarmModal
        note={activeAlarmNote}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeAlarm}
      />

      {/* Footer */}
      <footer className="border-t border-base-content/10 bg-base-100/50 py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/60">
          <div className="flex items-center gap-2 font-medium">
            <span>SlackNotes <span className="text-[10px] text-base-content/40 font-mono">(by Slack-Hacker)</span></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-error fill-error" /> MongoDB, Express, React & Node.js
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link to="/about" className="hover:text-primary transition-colors font-medium">
              About & Specs
            </Link>
            <span>•</span>
            <span className="badge badge-ghost badge-sm gap-1">
              <Code className="w-3 h-3 text-primary" /> React 19
            </span>
            <span className="badge badge-ghost badge-sm gap-1">
              <Sparkles className="w-3 h-3 text-secondary" /> Tailwind v4
            </span>
            <span className="badge badge-ghost badge-sm gap-1">
              <Terminal className="w-3 h-3 text-accent" /> Upstash RateLimiter
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;