import React, { useState } from "react";
import { useNavigate } from "react-router";
import { 
  Calendar, 
  Trash2, 
  Edit3, 
  Bell, 
  Image as ImageIcon,
  Copy,
  Check,
  Eye,
  Pin,
  Square,
  CheckSquare,
  X,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDisplayDate, formatAlarmDate, isAlarmExpired } from "../utils/dateUtils";

const NoteCard = ({ 
  note, 
  onDelete, 
  onTogglePin, 
  onRemoveAlarm,
  onImageClick, 
  onShare,
  isSelectionMode = false, 
  isSelected = false, 
  onToggleSelect 
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [pinning, setPinning] = useState(false);

  const hasReminder = Boolean(note.reminderDate);
  const expired = hasReminder ? isAlarmExpired(note.reminderDate) : false;

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopied(true);
    toast.success("Note copied to clipboard ✨");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(note);
    }
  };

  const handlePin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onTogglePin || pinning) return;
    try {
      setPinning(true);
      await onTogglePin(note._id, !note.isPinned);
    } finally {
      setPinning(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(note);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/detail/${note._id}?edit=true`);
  };

  const handleViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/detail/${note._id}`);
  };

  const handleCardClick = (e) => {
    if (isSelectionMode && onToggleSelect) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect(note._id);
    } else {
      navigate(`/detail/${note._id}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`card bg-base-100 border transition-all duration-300 rounded-3xl overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer select-none relative ${
        isSelected
          ? "border-primary ring-2 ring-primary/40 bg-primary/5"
          : note.isPinned 
            ? "border-primary/40 bg-linear-to-b from-primary/5 via-base-100 to-base-100 shadow-md shadow-primary/5" 
            : "border-base-content/10 hover:border-primary/40"
      }`}
    >
      
      {/* Pinned Ribbon Indicator */}
      {note.isPinned && (
        <div className="absolute top-0 right-0 z-10 bg-primary text-primary-content text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-bl-2xl shadow-2xs flex items-center gap-1">
          <Pin className="w-2.5 h-2.5 fill-primary-content" /> Pinned
        </div>
      )}
      
      {/* Screenshot Thumbnail Header */}
      {note.imageUrl && (
        <div 
          onClick={(e) => {
            if (!isSelectionMode && onImageClick) {
              e.preventDefault();
              e.stopPropagation();
              onImageClick(note.imageUrl, note.title);
            }
          }}
          className="relative w-full h-44 bg-base-200/60 overflow-hidden border-b border-base-content/10 group/img"
        >
          <img 
            src={note.imageUrl} 
            alt="Screenshot attachment" 
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" 
          />

          {/* Selection Checkbox Overlay when in Selection Mode */}
          {isSelectionMode ? (
            <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md p-1.5 rounded-xl text-white">
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-primary fill-primary/20" />
              ) : (
                <Square className="w-5 h-5 text-white/80" />
              )}
            </div>
          ) : (
            <div className="absolute top-3 left-3 badge badge-neutral text-[11px] gap-1.5 bg-black/70 text-white backdrop-blur-md border-none px-3 py-1 font-semibold shadow-md">
              <ImageIcon className="w-3.5 h-3.5" /> Screenshot
            </div>
          )}
        </div>
      )}

      {/* Main Body */}
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        
        {/* Title & Selection / Pin / Copy Actions */}
        <div className="flex items-start justify-between gap-2">
          {isSelectionMode && !note.imageUrl && (
            <div className="pt-0.5 text-primary shrink-0">
              {isSelected ? (
                <CheckSquare className="w-5 h-5 fill-primary/20" />
              ) : (
                <Square className="w-5 h-5 text-base-content/40" />
              )}
            </div>
          )}

          <h3 className="font-extrabold text-base group-hover:text-primary transition-colors line-clamp-1 flex-1 leading-snug tracking-tight">
            {note.title}
          </h3>
          
          {!isSelectionMode && (
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              {onTogglePin && (
                <button
                  onClick={handlePin}
                  disabled={pinning}
                  className={`p-1.5 rounded-xl transition-colors ${
                    note.isPinned 
                      ? "text-primary bg-primary/10 hover:bg-primary/20" 
                      : "text-base-content/30 hover:text-base-content hover:bg-base-200"
                  }`}
                  title={note.isPinned ? "Unpin note" : "Pin note to top"}
                >
                  <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "fill-primary" : ""}`} />
                </button>
              )}

              <button
                onClick={handleShareClick}
                className="text-base-content/40 hover:text-primary p-1.5 rounded-xl hover:bg-primary/10 transition-colors"
                title="Share note"
              >
                <Share2 className="w-3.5 h-3.5 text-primary" />
              </button>

              <button
                onClick={handleCopy}
                className="text-base-content/40 hover:text-base-content p-1.5 rounded-xl hover:bg-base-200 transition-colors"
                title="Copy note text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Alarm Badge with Delete Alarm Only Button */}
        {hasReminder && (
          <div className="flex items-center gap-1.5 self-start" onClick={(e) => e.stopPropagation()}>
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
              expired 
                ? "bg-warning/15 text-warning border-warning/30" 
                : "bg-secondary/15 text-secondary border-secondary/30"
            }`}>
              <Bell className={`w-3 h-3 ${expired ? "text-warning" : "animate-pulse text-secondary"}`} />
              <span>{expired ? "Expired: " : "Alarm: "}{formatAlarmDate(note.reminderDate)}</span>
            </div>

            {onRemoveAlarm && !isSelectionMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveAlarm(note._id);
                }}
                className="btn btn-circle btn-xs btn-ghost text-error/70 hover:text-error hover:bg-error/15 transition-all"
                title="Delete alarm only"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Snippet Content */}
        <p className="text-base-content/70 text-xs sm:text-sm leading-relaxed line-clamp-3 whitespace-pre-line font-normal flex-1">
          {note.content}
        </p>
      </div>

      {/* Footer Actions Bar */}
      <div className="px-5 py-3 bg-base-200/40 border-t border-base-content/5 flex items-center justify-between text-xs text-base-content/50 mt-auto">
        <span className="flex items-center gap-1 font-medium text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-base-content/40" />
          {formatDisplayDate(note.createdAt)}
        </span>

        {!isSelectionMode && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleViewClick}
              className="btn btn-ghost btn-xs rounded-xl gap-1 hover:bg-base-200 font-semibold"
              title="View note"
            >
              <Eye className="w-3.5 h-3.5 text-base-content/70" />
              <span className="hidden sm:inline text-xs">View</span>
            </button>

            <button
              onClick={handleEditClick}
              className="btn btn-ghost btn-xs rounded-xl gap-1 hover:bg-base-200 font-semibold"
              title="Edit note"
            >
              <Edit3 className="w-3.5 h-3.5 text-base-content/70" />
            </button>

            <button
              onClick={handleDeleteClick}
              className="btn btn-ghost btn-xs rounded-xl text-error/70 hover:text-error hover:bg-error/10"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default NoteCard;
