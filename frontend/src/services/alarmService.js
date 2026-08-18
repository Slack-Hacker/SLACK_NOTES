/**
 * Alarm Sound & Desktop Notification Service for SlackNotes (by Slack-Hacker)
 */

let sharedAudioCtx = null;

// Initialize & unlock AudioContext on user interaction
const getAudioContext = () => {
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

// Global event listener to unlock audio playback on first gesture
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    getAudioContext();
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
  };
  window.addEventListener("click", unlockAudio);
  window.addEventListener("keydown", unlockAudio);
  window.addEventListener("touchstart", unlockAudio);
}

// Synthesize pleasant bell chime sound
export const playAlarmSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    // Play double chime pattern
    [0, 0.6].forEach((delay) => {
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay + index * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + delay + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + index * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + index * 0.12 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay + index * 0.12);
        osc.stop(ctx.currentTime + delay + index * 0.12 + 0.5);
      });
    });
  } catch (err) {
    console.warn("Audio Context playback error:", err);
  }
};

// Request Desktop Notification Permission
export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

// Check Notification Status
export const getNotificationPermissionStatus = () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
};

const NOTIF_ENABLED_KEY = "slacknotes_notif_enabled";

export const isNotificationSettingEnabled = () => {
  try {
    const val = localStorage.getItem(NOTIF_ENABLED_KEY);
    return val === null ? true : JSON.parse(val);
  } catch {
    return true;
  }
};

export const setNotificationSettingEnabled = (enabled) => {
  try {
    localStorage.setItem(NOTIF_ENABLED_KEY, JSON.stringify(enabled));
  } catch (err) {
    console.error("Failed to save notification setting:", err);
  }
};

// Send Desktop System Notification
export const sendDesktopNotification = (title, body) => {
  try {
    if (!isNotificationSettingEnabled()) return;
    if ("Notification" in window && Notification.permission === "granted") {
      const notif = new Notification(`⏰ Alarm: ${title}`, {
        body: body ? body.slice(0, 100) : "SlackNotes Alarm Reminder!",
        icon: "/favicon.svg",
        tag: `slacknotes-alarm-${Date.now()}`,
        requireInteraction: true,
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }
  } catch (e) {
    console.warn("Desktop notification error:", e);
  }
};

// LocalStorage Triggered Alarms Key
const TRIGGERED_ALARMS_KEY = "slacknotes_triggered_alarms";

export const getTriggeredAlarmIds = () => {
  try {
    const data = localStorage.getItem(TRIGGERED_ALARMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const markAlarmTriggered = (noteId) => {
  try {
    const ids = getTriggeredAlarmIds();
    if (!ids.includes(noteId)) {
      ids.push(noteId);
      localStorage.setItem(TRIGGERED_ALARMS_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.error("Failed to mark alarm triggered:", err);
  }
};

export const clearTriggeredAlarm = (noteId) => {
  try {
    const ids = getTriggeredAlarmIds().filter((id) => id !== noteId);
    localStorage.setItem(TRIGGERED_ALARMS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error("Failed to clear triggered alarm:", err);
  }
};

export const resetAllTriggeredAlarms = () => {
  try {
    localStorage.removeItem(TRIGGERED_ALARMS_KEY);
  } catch (err) {
    console.error("Failed to reset triggered alarms:", err);
  }
};
