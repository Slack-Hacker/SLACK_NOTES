import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { 
  RotateCw, 
  Pin, 
  ImageIcon, 
  Bell, 
  Layers,
  CheckSquare,
  Square,
  Trash2,
  X,
  Plus,
  Share2
} from "lucide-react";
import { noteService } from "../services/api";
import NoteCard from "../components/NoteCard";
import NoteSkeleton from "../components/NoteSkeleton";
import EmptyState from "../components/EmptyState";
import DeleteModal from "../components/DeleteModal";
import ImageLightboxModal from "../components/ImageLightboxModal";
import ShareModal from "../components/ShareModal";
import toast from "react-hot-toast";

const HomePage = ({ searchQuery = "", setSearchQuery, onNotesCountChange, selectionModeTrigger = 0 }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Multi-Select / Bulk Delete state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Filter & Sort States
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Single Delete modal state
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Lightbox modal state
  const [lightboxImage, setLightboxImage] = useState({ isOpen: false, url: "", title: "" });

  // Share modal state (supports single note or multiple notes)
  const [shareModal, setShareModal] = useState({ isOpen: false, note: null, notes: [] });

  // Listen to menu trigger for multi-select mode
  useEffect(() => {
    if (selectionModeTrigger > 0) {
      setIsSelectionMode(true);
    }
  }, [selectionModeTrigger]);

  const fetchNotes = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await noteService.getAllNotes();
      if (data.success && Array.isArray(data.notes)) {
        setNotes(data.notes);
        if (onNotesCountChange) {
          onNotesCountChange(data.notes.length);
        }
      }
      if (isManualRefresh) {
        toast.success("Notes list updated ✨");
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Multi-select handlers
  const handleToggleSelectNote = (id) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNoteIds.length === filteredNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(filteredNotes.map((n) => n._id));
    }
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedNoteIds([]);
  };

  const confirmBulkDelete = async () => {
    if (selectedNoteIds.length === 0) return;
    try {
      setDeleting(true);
      const count = selectedNoteIds.length;
      await noteService.deleteMultipleNotes(selectedNoteIds);
      
      setNotes((prev) => prev.filter((n) => !selectedNoteIds.includes(n._id)));
      if (onNotesCountChange) {
        onNotesCountChange(notes.length - count);
      }
      toast.success(`${count} notes deleted successfully!`);
      handleCancelSelection();
    } catch (error) {
      console.error("Failed bulk deletion:", error);
    } finally {
      setDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  // Bulk share handler for selected notes
  const handleBulkShare = () => {
    if (selectedNoteIds.length === 0) return;
    const selectedNotesList = notes.filter((n) => selectedNoteIds.includes(n._id));
    setShareModal({
      isOpen: true,
      note: null,
      notes: selectedNotesList,
    });
  };

  // Delete Alarm Only handler
  const handleRemoveAlarm = async (noteId) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === noteId ? { ...n, reminderDate: null } : n))
    );
    try {
      await noteService.updateNote(noteId, { reminderDate: null });
      toast.success("Alarm deleted from note 🔕");
    } catch (error) {
      console.error("Failed to delete alarm:", error);
      toast.error("Failed to delete alarm");
      fetchNotes();
    }
  };

  // Handle Pin Toggle
  const handleTogglePin = async (id, newPinState) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isPinned: newPinState } : n))
    );

    try {
      await noteService.togglePinNote(id, newPinState);
      toast.success(newPinState ? "Note pinned to top 📌" : "Note unpinned");
    } catch {
      setNotes((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isPinned: !newPinState } : n))
      );
      toast.error("Failed to update pin status");
    }
  };

  // Single delete handler
  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      setDeleting(true);
      await noteService.deleteNote(noteToDelete._id);
      setNotes((prev) => prev.filter((n) => n._id !== noteToDelete._id));
      if (onNotesCountChange) {
        onNotesCountChange(notes.length - 1);
      }
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setDeleting(false);
      setNoteToDelete(null);
    }
  };

  // Filtered and Sorted Notes calculation
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q)
      );
    }

    if (activeTab === "pinned") {
      result = result.filter((n) => n.isPinned);
    } else if (activeTab === "screenshots") {
      result = result.filter((n) => Boolean(n.imageUrl));
    } else if (activeTab === "alarms") {
      result = result.filter((n) => Boolean(n.reminderDate));
    }

    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned && activeTab !== "pinned") {
        return a.isPinned ? -1 : 1;
      }

      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });
      } else {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [notes, searchQuery, activeTab, sortBy]);

  const pinnedCount = useMemo(() => notes.filter((n) => n.isPinned).length, [notes]);
  const screenshotCount = useMemo(() => notes.filter((n) => Boolean(n.imageUrl)).length, [notes]);
  const alarmCount = useMemo(() => notes.filter((n) => Boolean(n.reminderDate)).length, [notes]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header Section: Left Title & Far Right Aligned New Note CTA Button */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-base-content/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {searchQuery ? `Results for "${searchQuery}"` : "My Notes"}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-0.5 font-medium">
            {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"} available
          </p>
        </div>

        {/* New Note CTA button aligned to the VERY RIGHT of the screen header */}
        <Link
          to="/create"
          className="btn btn-primary btn-sm gap-1.5 rounded-xl font-bold text-white bg-linear-to-r from-primary to-secondary hover:brightness-110 shadow-md shadow-primary/25 hover:scale-105 transition-all"
          title="Create a new note"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </Link>
      </div>

      {/* Multi-Select Floating Action Bar (With Bulk Share & Bulk Delete) */}
      {isSelectionMode && (
        <div className="card bg-base-200/80 border-2 border-primary/30 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="btn btn-ghost btn-xs sm:btn-sm gap-1.5 rounded-xl font-semibold"
            >
              {selectedNoteIds.length === filteredNotes.length ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                {selectedNoteIds.length === filteredNotes.length ? "Deselect All" : "Select All"}
              </span>
            </button>

            <span className="text-xs sm:text-sm font-bold text-primary">
              {selectedNoteIds.length} of {filteredNotes.length} selected
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Bulk Share Selected Button */}
            <button
              onClick={handleBulkShare}
              disabled={selectedNoteIds.length === 0}
              className="btn btn-primary btn-sm gap-1.5 rounded-xl text-white font-bold shadow-md shadow-primary/20 flex-1 sm:flex-initial"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Selected ({selectedNoteIds.length})</span>
            </button>

            {/* Bulk Delete Selected Button */}
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              disabled={selectedNoteIds.length === 0}
              className="btn btn-error btn-sm gap-1.5 rounded-xl text-white font-bold shadow-md shadow-error/20 flex-1 sm:flex-initial"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedNoteIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Right Controls (Sort -> Select Multi -> Refresh) */}
      {!loading && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-base-200/50 p-2 rounded-2xl border border-base-content/10 shadow-2xs">
          {/* Left: Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all font-bold ${
                activeTab === "all"
                  ? "bg-primary text-primary-content shadow-xs"
                  : "hover:bg-base-200 text-base-content/70"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({notes.length})</span>
            </button>

            {pinnedCount > 0 && (
              <button
                onClick={() => setActiveTab("pinned")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all font-bold ${
                  activeTab === "pinned"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "hover:bg-base-200 text-base-content/70"
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
                <span>Pinned ({pinnedCount})</span>
              </button>
            )}

            {screenshotCount > 0 && (
              <button
                onClick={() => setActiveTab("screenshots")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all font-bold ${
                  activeTab === "screenshots"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "hover:bg-base-200 text-base-content/70"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Screenshots ({screenshotCount})</span>
              </button>
            )}

            {alarmCount > 0 && (
              <button
                onClick={() => setActiveTab("alarms")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all font-bold ${
                  activeTab === "alarms"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "hover:bg-base-200 text-base-content/70"
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Alarms ({alarmCount})</span>
              </button>
            )}
          </div>

          {/* Right Controls: Sort -> Select Multi -> Refresh */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-base-content/50 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-xs select-bordered rounded-xl bg-base-100 font-semibold pr-8 focus:outline-none focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* Icon-Only Multiple Selection Trigger */}
            {!isSelectionMode ? (
              <button
                onClick={() => setIsSelectionMode(true)}
                className="btn btn-outline btn-circle btn-xs sm:btn-sm border-base-content/20 hover:border-error hover:bg-error/10 text-error transition-all"
                title="Select multiple notes to delete or share"
              >
                <CheckSquare className="w-3.5 h-3.5 text-error" />
              </button>
            ) : (
              <button
                onClick={handleCancelSelection}
                className="btn btn-ghost btn-circle btn-xs sm:btn-sm text-base-content/70 hover:bg-base-200"
                title="Cancel selection mode"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Refresh Option */}
            <button
              onClick={() => fetchNotes(true)}
              disabled={refreshing}
              className="btn btn-ghost btn-circle btn-xs sm:btn-sm text-base-content/60 hover:text-base-content hover:bg-base-200"
              title="Refresh notes list"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid / State Content */}
      {loading ? (
        <NoteSkeleton count={6} />
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          isSearch={Boolean(searchQuery) || activeTab !== "all"}
          searchQuery={searchQuery || (activeTab !== "all" ? activeTab : "")}
          onResetSearch={() => {
            if (setSearchQuery) setSearchQuery("");
            setActiveTab("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onDelete={(n) => setNoteToDelete(n)}
              onTogglePin={handleTogglePin}
              onRemoveAlarm={handleRemoveAlarm}
              onShare={(n) => setShareModal({ isOpen: true, note: n, notes: [] })}
              onImageClick={(url, title) => setLightboxImage({ isOpen: true, url, title })}
              isSelectionMode={isSelectionMode}
              isSelected={selectedNoteIds.includes(note._id)}
              onToggleSelect={handleToggleSelectNote}
            />
          ))}
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={confirmDeleteNote}
        loading={deleting}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.title || "this note"}"? This action cannot be undone.`}
      />

      {/* Bulk Multiple Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        loading={deleting}
        title="Delete Multiple Notes"
        message={`Are you sure you want to delete ${selectedNoteIds.length} selected notes? This action cannot be undone.`}
      />

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxImage.isOpen}
        imageUrl={lightboxImage.url}
        title={lightboxImage.title}
        onClose={() => setLightboxImage({ isOpen: false, url: "", title: "" })}
      />

      {/* Single & Bulk Multiple Notes Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, note: null, notes: [] })}
        note={shareModal.note}
        notes={shareModal.notes}
      />

    </div>
  );
};

export default HomePage;