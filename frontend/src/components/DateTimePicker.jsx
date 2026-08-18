import React, { useMemo } from "react";
import { 
  Bell, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Volume2, 
  X, 
  Check,
  AlertTriangle
} from "lucide-react";
import { playAlarmSound } from "../services/alarmService";
import toast from "react-hot-toast";

const DateTimePicker = ({ value = "", onChange }) => {
  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  // Parse date and time values from string YYYY-MM-DDTHH:mm
  const [dateVal, timeVal] = useMemo(() => {
    if (!value) return ["", ""];
    const parts = value.split("T");
    return [parts[0] || "", parts[1] || ""];
  }, [value]);

  // Helper to get a smart default time (if today, 1 hour in the future; if future date, 09:00 AM)
  const getSmartDefaultTime = (dStr) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    if (dStr === todayStr) {
      const future = new Date(now.getTime() + 60 * 60 * 1000);
      return `${pad(future.getHours())}:${pad(future.getMinutes())}`;
    }
    return "09:00";
  };

  const validateAndSet = (dStr, tStr) => {
    if (!dStr) {
      onChange("");
      return;
    }

    const finalTime = tStr || getSmartDefaultTime(dStr);
    const selectedDate = new Date(`${dStr}T${finalTime}`);

    if (isNaN(selectedDate.getTime())) {
      onChange("");
      return;
    }

    // Check if selected date & time is in the past (buffer of 1 min)
    if (selectedDate.getTime() < Date.now() - 60000) {
      toast.error("Selected time today has already passed! Please pick a future time ⏰");
      // If time was specified, don't clear the date if it's today; instead update to a future time today
      const futureTime = getSmartDefaultTime(dStr);
      onChange(`${dStr}T${futureTime}`);
      return;
    }

    onChange(`${dStr}T${finalTime}`);
  };

  const handleDateChange = (newDate) => {
    if (!newDate) {
      onChange("");
      return;
    }
    const time = timeVal || getSmartDefaultTime(newDate);
    validateAndSet(newDate, time);
  };

  const handleTimeChange = (newTime) => {
    if (!newTime) return;
    const date = dateVal || todayStr;
    validateAndSet(date, newTime);
  };

  // Preset helpers
  const applyPreset = (offsetHours, specificHour = null) => {
    const now = new Date();
    if (specificHour !== null) {
      now.setHours(specificHour, 0, 0, 0);
      if (now <= new Date()) {
        // If target hour today has passed, set for tomorrow
        now.setDate(now.getDate() + 1);
      }
    } else {
      now.setTime(now.getTime() + offsetHours * 60 * 60 * 1000);
    }

    const pad = (n) => String(n).padStart(2, "0");
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const tStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    onChange(`${dStr}T${tStr}`);
    toast.success("Alarm preset set! 🔔");
  };

  // Time remaining calculation
  const countdownText = useMemo(() => {
    if (!value) return null;
    const target = new Date(value);
    if (isNaN(target.getTime())) return null;

    const diffMs = target.getTime() - Date.now();
    if (diffMs <= 0) return { expired: true, text: "Selected time is in the past. Pick a future time." };

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return { expired: false, text: `Rings in ${days} day${days > 1 ? "s" : ""}, ${hours % 24} hr${hours % 24 !== 1 ? "s" : ""}` };
    } else if (hours > 0) {
      return { expired: false, text: `Rings in ${hours} hr${hours > 1 ? "s" : ""}, ${mins} min${mins !== 1 ? "s" : ""}` };
    } else {
      return { expired: false, text: `Rings in ${mins} minute${mins !== 1 ? "s" : ""}` };
    }
  }, [value]);

  const handleTestSound = () => {
    playAlarmSound();
    toast.success("🔊 Playing chime sound test!");
  };

  return (
    <div className="card bg-base-200/50 border border-base-content/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <label className="label-text font-bold text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-secondary/10 text-secondary">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none">Set Alarm Reminder</span>
            <span className="text-[10px] text-base-content/50 font-normal mt-0.5">Pick a future date & time</span>
          </div>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestSound}
            className="btn btn-ghost btn-xs gap-1 text-primary hover:bg-primary/10 rounded-lg font-semibold"
            title="Test alarm sound chime"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Sound</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="btn btn-ghost btn-xs text-error gap-1 hover:bg-error/10 rounded-lg font-semibold"
              title="Remove alarm"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Preset Pills */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-secondary" /> Quick Presets
        </span>
        
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset(0.5)}
            className="btn btn-xs rounded-xl bg-base-100 border-base-content/15 hover:border-secondary hover:bg-secondary/10 font-semibold transition-all"
          >
            ⚡ In 30 Mins
          </button>
          <button
            type="button"
            onClick={() => applyPreset(1)}
            className="btn btn-xs rounded-xl bg-base-100 border-base-content/15 hover:border-secondary hover:bg-secondary/10 font-semibold transition-all"
          >
            🚀 In 1 Hour
          </button>
          <button
            type="button"
            onClick={() => applyPreset(0, 20)}
            className="btn btn-xs rounded-xl bg-base-100 border-base-content/15 hover:border-secondary hover:bg-secondary/10 font-semibold transition-all"
          >
            🌙 Tonight (8 PM)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(0, 9)}
            className="btn btn-xs rounded-xl bg-base-100 border-base-content/15 hover:border-secondary hover:bg-secondary/10 font-semibold transition-all"
          >
            ☀️ Tomorrow (9 AM)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(72)}
            className="btn btn-xs rounded-xl bg-base-100 border-base-content/15 hover:border-secondary hover:bg-secondary/10 font-semibold transition-all"
          >
            📅 In 3 Days
          </button>
        </div>
      </div>

      {/* Manual Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Date Selector */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-base-content/70 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-primary" /> Date
          </span>
          <input
            type="date"
            min={todayStr}
            value={dateVal}
            onChange={(e) => handleDateChange(e.target.value)}
            className="input input-sm input-bordered w-full rounded-xl focus:border-secondary font-medium bg-base-100"
          />
        </div>

        {/* Time Selector */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-base-content/70 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-secondary" /> Time
          </span>
          <input
            type="time"
            value={timeVal}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="input input-sm input-bordered w-full rounded-xl focus:border-secondary font-medium bg-base-100"
          />
        </div>
      </div>

      {/* Live Countdown / Context Preview Badge */}
      {countdownText && (
        <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
          countdownText.expired
            ? "bg-error/10 border-error/30 text-error"
            : "bg-secondary/10 border-secondary/30 text-secondary"
        }`}>
          <div className="flex items-center gap-2">
            {countdownText.expired ? (
              <AlertTriangle className="w-4 h-4 text-error shrink-0" />
            ) : (
              <Bell className="w-3.5 h-3.5 animate-pulse text-secondary shrink-0" />
            )}
            <span>{countdownText.text}</span>
          </div>
          {!countdownText.expired && <Check className="w-4 h-4 shrink-0 text-secondary" />}
        </div>
      )}

    </div>
  );
};

export default DateTimePicker;
