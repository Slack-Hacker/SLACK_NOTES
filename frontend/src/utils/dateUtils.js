/**
 * Formats a Date object or ISO string to local YYYY-MM-DDTHH:mm string 
 * suitable for <input type="datetime-local">.
 */
export const formatForDateTimeInput = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formats date for display in note cards and header.
 * e.g., "Aug 18, 2026" or "Today"
 */
export const formatDisplayDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (isToday) return "Today";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Formats alarm date with relative time context if today/tomorrow.
 */
export const formatAlarmDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const alarmDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((alarmDay - today) / (1000 * 60 * 60 * 24));

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (diffDays === 0) return `Today at ${timeStr}`;
  if (diffDays === 1) return `Tomorrow at ${timeStr}`;
  if (diffDays === -1) return `Yesterday at ${timeStr}`;

  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${timeStr}`;
};

/**
 * Returns true if alarm date is in the past.
 */
export const isAlarmExpired = (dateInput) => {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
};
