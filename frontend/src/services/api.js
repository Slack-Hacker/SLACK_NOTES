import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "https://slacknotes-api.onrender.com/api/notes";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "An error occurred";

      if (status === 429) {
        toast.error("⏳ Rate limit exceeded! Please wait a moment before trying again.", {
          id: "rate-limit-toast",
        });
      } else if (status === 404) {
        toast.error("🔍 Note not found", { id: "not-found-toast" });
      } else if (status >= 500) {
        toast.error(`⚠️ Server Error: ${message}`);
      } else if (status >= 400) {
        toast.error(`❌ ${message}`);
      }
    } else if (error.request) {
      toast.error("🔌 Unable to connect to backend server. Make sure your server on port 5001 is running.", {
        id: "network-error-toast",
      });
    } else {
      toast.error("An unexpected error occurred");
    }

    return Promise.reject(error);
  }
);

export const noteService = {
  // Fetch all notes
  async getAllNotes() {
    const res = await api.get("/");
    return res.data;
  },

  // Fetch single note by ID
  async getNoteById(id) {
    const res = await api.get(`/${id}`);
    return res.data;
  },

  // Create new note
  async createNote(noteData) {
    const res = await api.post("/", noteData);
    return res.data;
  },

  // Update existing note
  async updateNote(id, noteData) {
    const res = await api.put(`/${id}`, noteData);
    return res.data;
  },

  // Delete note
  async deleteNote(id) {
    const res = await api.delete(`/${id}`);
    return res.data;
  },

  // Delete multiple notes
  async deleteMultipleNotes(ids) {
    const res = await api.post("/delete-multiple", { ids });
    return res.data;
  },

  // Toggle pin
  async togglePinNote(id, isPinned) {
    const res = await api.put(`/${id}`, { isPinned });
    return res.data;
  },

  // Server health check
  async checkBackendHealth() {
    try {
      await api.get("/");
      return true;
    } catch {
      return false;
    }
  }
};

export default api;
