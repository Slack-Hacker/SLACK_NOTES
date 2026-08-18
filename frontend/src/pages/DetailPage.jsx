import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Bell, 
  Image as ImageIcon,
  AlertTriangle,
  Calendar,
  Pin,
  Copy,
  Check,
  Upload,
  Share2
} from "lucide-react";
import { noteService } from "../services/api";
import { formatForDateTimeInput, formatAlarmDate, formatDisplayDate, isAlarmExpired } from "../utils/dateUtils";
import DeleteModal from "../components/DeleteModal";
import ImageLightboxModal from "../components/ImageLightboxModal";
import DateTimePicker from "../components/DateTimePicker";
import ShareModal from "../components/ShareModal";
import toast from "react-hot-toast";

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(() => searchParams.get("edit") === "true");
  
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editReminderDate, setEditReminderDate] = useState("");
  const [editIsPinned, setEditIsPinned] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const data = await noteService.getNoteById(id);
        if (data.success && data.note) {
          setNote(data.note);
          setEditTitle(data.note.title);
          setEditContent(data.note.content);
          setEditImageUrl(data.note.imageUrl || "");
          setEditReminderDate(formatForDateTimeInput(data.note.reminderDate));
          setEditIsPinned(Boolean(data.note.isPinned));
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        toast.error("Failed to load note details");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleCopyText = () => {
    if (!note) return;
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true);
    toast.success("Note content copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePinInView = async () => {
    if (!note) return;
    const newPinState = !note.isPinned;
    setNote((prev) => ({ ...prev, isPinned: newPinState }));
    setEditIsPinned(newPinState);

    try {
      await noteService.togglePinNote(id, newPinState);
      toast.success(newPinState ? "Note pinned to top 📌" : "Note unpinned");
    } catch {
      setNote((prev) => ({ ...prev, isPinned: !newPinState }));
      setEditIsPinned(!newPinState);
      toast.error("Failed to update pin status");
    }
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Title and content cannot be empty");
      return;
    }
    if (editReminderDate && new Date(editReminderDate).getTime() < Date.now() - 60000) {
      toast.error("Cannot set an alarm in the past! Please select a future date and time ⏰");
      return;
    }

    try {
      setSaving(true);
      const res = await noteService.updateNote(id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        imageUrl: editImageUrl,
        reminderDate: editReminderDate ? new Date(editReminderDate).toISOString() : null,
        isPinned: editIsPinned,
      });

      if (res.success && res.note) {
        setNote(res.note);
        setIsEditing(false);
        toast.success("Note updated successfully! ✨");
      }
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await noteService.deleteNote(id);
      toast.success("Note deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRemoveAlarm = async () => {
    try {
      await noteService.updateNote(id, { reminderDate: null });
      setNote((prev) => ({ ...prev, reminderDate: null }));
      setEditReminderDate("");
      toast.success("Alarm deleted 🔕");
    } catch (err) {
      console.error("Failed to remove alarm:", err);
      toast.error("Failed to remove alarm");
    }
  };

  // Image upload simulation / Base64 converter
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditImageUrl(reader.result);
      toast.success("Image attached! Save to apply.");
    };
    reader.readAsDataURL(file);
  };

  // Paste handler for screenshots
  const handlePaste = (e) => {
    if (!isEditing) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setEditImageUrl(reader.result);
            toast.success("Screenshot pasted successfully! 📸");
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-base-200 rounded-xl w-32" />
        <div className="card bg-base-100 border border-base-content/10 p-8 space-y-4 rounded-2xl">
          <div className="h-8 bg-base-200 rounded-xl w-3/4" />
          <div className="h-4 bg-base-200 rounded-xl w-1/2" />
          <div className="h-32 bg-base-200 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-md mx-auto text-center my-16 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Note Not Found</h2>
        <Link to="/" className="btn btn-primary btn-sm rounded-xl gap-2 mt-2">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    );
  }

  const hasReminder = Boolean(note.reminderDate);
  const expired = hasReminder ? isAlarmExpired(note.reminderDate) : false;

  return (
    <div className="max-w-2xl mx-auto space-y-6" onPaste={handlePaste}>
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notes
        </Link>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePinInView}
              className={`btn btn-sm rounded-xl gap-1.5 transition-all ${
                note.isPinned 
                  ? "btn-primary shadow-xs" 
                  : "btn-ghost text-base-content/60 hover:text-base-content"
              }`}
              title={note.isPinned ? "Unpin note" : "Pin note"}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{note.isPinned ? "Pinned" : "Pin"}</span>
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              className="btn btn-ghost btn-sm rounded-xl gap-1.5 text-primary hover:bg-primary/10 font-semibold"
              title="Share note"
            >
              <Share2 className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handleCopyText}
              className="btn btn-ghost btn-sm rounded-xl gap-1.5 text-base-content/70 hover:text-base-content"
              title="Copy note text"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-ghost btn-sm rounded-xl gap-1.5 text-base-content/70 hover:text-base-content"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-ghost btn-sm text-error/70 hover:text-error hover:bg-error/10 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Detail / Edit Card */}
      <div className="card bg-base-100 border border-base-content/10 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
        {isEditing ? (
          /* EDIT MODE FORM */
          <form onSubmit={handleSaveEdit} className="space-y-5">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
              <h2 className="font-bold text-lg">Edit Note</h2>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(note.title);
                  setEditContent(note.content);
                  setEditImageUrl(note.imageUrl || "");
                  setEditReminderDate(formatForDateTimeInput(note.reminderDate));
                  setEditIsPinned(Boolean(note.isPinned));
                }}
                className="btn btn-ghost btn-xs text-base-content/60"
              >
                Cancel Edit
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="label-text font-semibold text-xs">Note Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter title..."
                className="input input-bordered w-full rounded-xl focus:border-secondary font-bold text-lg"
              />
            </div>

            {/* Content */}
            <div className="space-y-1">
              <label className="label-text font-semibold text-xs">Note Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter note content..."
                rows={6}
                className="textarea textarea-bordered w-full rounded-xl focus:border-secondary leading-relaxed"
              />
            </div>

            {/* Screenshot Attachment Section */}
            <div className="space-y-2">
              <label className="label-text font-semibold text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-accent" /> Screenshot Attachment
                </span>
                <span className="text-[10px] text-base-content/50">Supports Ctrl + V paste</span>
              </label>

              {editImageUrl ? (
                <div className="relative group rounded-2xl overflow-hidden border border-base-content/10 bg-base-200/50 max-h-60">
                  <img src={editImageUrl} alt="Attached screenshot" className="w-full h-auto object-cover max-h-60" />
                  <button
                    type="button"
                    onClick={() => setEditImageUrl("")}
                    className="absolute top-2.5 right-2.5 btn btn-circle btn-xs btn-error text-white shadow-md"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-base-content/15 rounded-2xl cursor-pointer hover:border-secondary/40 hover:bg-base-200/30 transition-all text-center">
                  <Upload className="w-6 h-6 text-base-content/40 mb-1" />
                  <span className="text-xs font-semibold text-base-content/70">Click to upload screenshot</span>
                  <span className="text-[10px] text-base-content/40 mt-0.5">or paste image directly from clipboard (Ctrl + V)</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Alarm Component */}
            <DateTimePicker
              value={editReminderDate}
              onChange={(val) => setEditReminderDate(val)}
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-content/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost btn-sm rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white font-bold shadow-md shadow-primary/20"
              >
                {saving ? <span className="loading loading-spinner loading-xs" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* VIEW MODE CONTENT */
          <div className="space-y-6">
            
            {/* Header */}
            <div className="space-y-2 border-b border-base-content/10 pb-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  {note.title}
                </h1>

                {note.isPinned && (
                  <span className="badge badge-primary gap-1 font-bold text-xs shrink-0 py-2 px-3 shadow-2xs">
                    <Pin className="w-3 h-3 fill-current" /> Pinned
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-base-content/40" />
                  Created {formatDisplayDate(note.createdAt)}
                </span>

                {hasReminder && (
                  <div className="flex items-center gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${
                      expired 
                        ? "bg-warning/15 text-warning border-warning/30" 
                        : "bg-secondary/15 text-secondary border-secondary/30"
                    }`}>
                      <Bell className={`w-3 h-3 ${expired ? "" : "animate-pulse"}`} />
                      {expired ? "Expired: " : "Alarm: "}{formatAlarmDate(note.reminderDate)}
                    </span>

                    <button
                      type="button"
                      onClick={handleRemoveAlarm}
                      className="btn btn-circle btn-xs btn-ghost text-error/70 hover:text-error hover:bg-error/15"
                      title="Delete alarm only"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Attached Image Screenshot */}
            {note.imageUrl && (
              <div 
                onClick={() => setLightboxOpen(true)}
                className="relative rounded-2xl overflow-hidden border border-base-content/10 bg-base-200/50 cursor-pointer group max-h-96"
              >
                <img
                  src={note.imageUrl}
                  alt="Note screenshot attachment"
                  className="w-full h-auto object-cover max-h-96 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm gap-2">
                  <ImageIcon className="w-5 h-5" /> Click to view full screenshot
                </div>
              </div>
            )}

            {/* Note Content Text */}
            <div className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-base-content/90 font-normal">
              {note.content}
            </div>

          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Note"
        message={`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
      />

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        imageUrl={note.imageUrl}
        title={note.title}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        note={note}
      />
    </div>
  );
};

export default DetailPage;
