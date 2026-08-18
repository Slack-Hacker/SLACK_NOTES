import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  X,
  Pin,
  Upload
} from "lucide-react";
import { noteService } from "../services/api";
import DateTimePicker from "../components/DateTimePicker";
import toast from "react-hot-toast";

const CreatePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Keyboard shortcut Ctrl + Enter to submit note
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (title.trim() && content.trim() && !submitting) {
          handleSubmit(e);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, submitting]);

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
      toast.success("📸 Image attached successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // Support Ctrl+V paste image from clipboard
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        processFile(file);
        break;
      }
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a note title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter note content");
      return;
    }
    if (reminderDate && new Date(reminderDate).getTime() < Date.now() - 60000) {
      toast.error("Cannot set an alarm in the past! Please select a future date and time ⏰");
      return;
    }

    try {
      setSubmitting(true);
      const res = await noteService.createNote({
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        reminderDate: reminderDate ? new Date(reminderDate).toISOString() : null,
        isPinned,
      });

      if (res.success) {
        toast.success("Note created successfully! ✨");
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Word and character counts
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6" onPaste={handlePaste}>
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notes
        </Link>

        {/* Quick Pin Toggle */}
        <button
          type="button"
          onClick={() => setIsPinned(!isPinned)}
          className={`btn btn-sm rounded-xl gap-1.5 transition-all ${
            isPinned 
              ? "btn-primary shadow-sm" 
              : "btn-ghost text-base-content/60 hover:text-base-content"
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
          <span>{isPinned ? "Pinned to Top" : "Pin Note"}</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="card bg-base-100 border border-base-content/10 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Note</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Note Title */}
          <div className="space-y-1.5">
            <label className="label-text font-semibold text-sm">
              Note Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="Title of your note..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              className="input input-bordered w-full rounded-xl focus:border-primary"
            />
          </div>

          {/* Note Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="label-text font-semibold text-sm">
                Content <span className="text-error">*</span>
              </label>
              <span className="text-[11px] text-base-content/50 font-medium">
                {wordCount} words · {charCount} chars
              </span>
            </div>
            <textarea
              placeholder="Write your note here... (Markdown text, code, ideas, links)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              required
              className="textarea textarea-bordered w-full rounded-xl text-base leading-relaxed focus:border-primary font-normal"
            />
          </div>

          {/* Attach Screenshot / Drag & Drop Zone */}
          <div className="space-y-2 pt-1">
            <label className="label-text font-semibold text-sm flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-primary" /> Image / Screenshot Attachment
            </label>

            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-base-content/10 max-h-52 bg-base-200">
                <img src={imageUrl} alt="Attached screenshot" className="w-full h-48 object-contain" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2.5 right-2.5 btn btn-circle btn-xs btn-error text-white shadow-md"
                  title="Remove screenshot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? "border-primary bg-primary/10" 
                    : "border-base-content/20 bg-base-200/30 hover:border-primary/50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                  <Upload className={`w-6 h-6 ${isDragging ? "text-primary animate-bounce" : "text-primary/70"}`} />
                  <span className="text-xs font-semibold text-primary">
                    {isDragging ? "Drop image here" : "Click to upload or drag & drop image"}
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    Or paste directly from clipboard with Ctrl + V (PNG, JPG up to 5MB)
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Alarm Date & Time Selector */}
          <DateTimePicker value={reminderDate} onChange={setReminderDate} />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-content/10">
            <Link to="/" className="btn btn-ghost btn-sm rounded-xl">
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="btn btn-primary btn-sm gap-2 rounded-xl font-semibold shadow-md shadow-primary/20 hover:scale-105 transition-all"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;