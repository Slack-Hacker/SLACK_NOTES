import React, { useState } from "react";
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  Download, 
  Mail, 
  MessageSquare,
  Globe,
  FileText,
  FileImage
} from "lucide-react";
import toast from "react-hot-toast";
import { exportNotesAsJPEG, exportNotesAsPDF } from "../utils/exportUtils";

const ShareModal = ({ isOpen, onClose, note = null, notes = [] }) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const isMultiple = notes.length > 0;
  const targetNotes = isMultiple ? notes : note ? [note] : [];

  if (targetNotes.length === 0) return null;

  // Format content for copying / sharing / text export
  const getFormattedShareText = () => {
    if (!isMultiple) {
      const single = targetNotes[0];
      return `📌 ${single.title}\n\n${single.content}${
        single.reminderDate ? `\n\n⏰ Reminder: ${new Date(single.reminderDate).toLocaleString()}` : ""
      }\n\nShared via SlackNotes (by Slack-Hacker)`;
    } else {
      let combined = `📝 SlackNotes Export (${targetNotes.length} Notes)\n${"=".repeat(35)}\n\n`;
      targetNotes.forEach((n, idx) => {
        combined += `--- Note #${idx + 1}: ${n.title} ---\n`;
        combined += `${n.content}\n`;
        if (n.reminderDate) {
          combined += `⏰ Reminder: ${new Date(n.reminderDate).toLocaleString()}\n`;
        }
        combined += `\n`;
      });
      combined += `Shared via SlackNotes (by Slack-Hacker)`;
      return combined;
    }
  };

  const shareText = getFormattedShareText();
  const shareTitle = isMultiple 
    ? `SlackNotes Export (${targetNotes.length} Notes)` 
    : targetNotes[0]?.title || "SlackNote";

  const shareUrl = !isMultiple && targetNotes[0]
    ? `${window.location.origin}/detail/${targetNotes[0]._id}`
    : window.location.origin;

  // Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully! ✨");
        onClose();
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Native share failed:", err);
        }
      }
    }
  };

  // Copy Full Text
  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    toast.success("Note content copied to clipboard!");
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Copy Link (Single note)
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Shareable link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp...");
  };

  // Email Share
  const handleEmailShare = () => {
    const mailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
    window.location.href = mailUrl;
  };

  // Download .txt file
  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([shareText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = isMultiple 
      ? `SlackNotes_Export_${targetNotes.length}_notes.txt`
      : `SlackNote_${shareTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded .txt note file! 💾");
  };

  // Export as PDF
  const handleExportPdf = async () => {
    try {
      toast.loading("Generating PDF note document...", { id: "export-pdf" });
      await exportNotesAsPDF(targetNotes, isMultiple ? "SlackNotes_Collection" : `SlackNote_${targetNotes[0]?.title || "Note"}`);
      toast.success("PDF ready for saving / printing! 📄", { id: "export-pdf" });
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to export PDF", { id: "export-pdf" });
    }
  };

  // Export as JPEG
  const handleExportJpeg = async () => {
    try {
      toast.loading("Generating JPEG note image...", { id: "export-jpeg" });
      await exportNotesAsJPEG(targetNotes, isMultiple ? "SlackNotes_Collection" : `SlackNote_${targetNotes[0]?.title || "Note"}`);
      toast.success("JPEG image downloaded! 🖼️", { id: "export-jpeg" });
    } catch (err) {
      console.error("JPEG export error:", err);
      toast.error("Failed to export JPEG", { id: "export-jpeg" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card bg-base-100 border border-base-content/10 w-full max-w-md shadow-2xl rounded-3xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-2 flex items-start justify-between gap-3 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-snug">
                {isMultiple ? `Share ${targetNotes.length} Notes` : "Share Note"}
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5 line-clamp-1">
                {isMultiple 
                  ? `Export or share ${targetNotes.length} selected notes` 
                  : targetNotes[0]?.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-base-content"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Preview Box */}
        <div className="px-5 sm:px-6 pt-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-base-200/60 border border-base-content/10 text-xs font-mono max-h-32 overflow-y-auto whitespace-pre-line text-base-content/80">
            {shareText}
          </div>

          {/* Share Action Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Copy Text */}
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-base-200/70 hover:bg-primary/10 hover:text-primary border border-base-content/10 font-semibold text-xs transition-all text-left"
            >
              {copiedText ? (
                <Check className="w-4 h-4 text-success shrink-0" />
              ) : (
                <Copy className="w-4 h-4 text-primary shrink-0" />
              )}
              <div className="flex flex-col truncate">
                <span className="truncate">{copiedText ? "Copied!" : "Copy Text"}</span>
                <span className="text-[10px] text-base-content/50 font-normal">Formatted text</span>
              </div>
            </button>

            {/* 2. Copy Link (Single Note) */}
            {!isMultiple && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-base-200/70 hover:bg-primary/10 hover:text-primary border border-base-content/10 font-semibold text-xs transition-all text-left"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-success shrink-0" />
                ) : (
                  <LinkIcon className="w-4 h-4 text-secondary shrink-0" />
                )}
                <div className="flex flex-col truncate">
                  <span className="truncate">{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                  <span className="text-[10px] text-base-content/50 font-normal">Shareable URL</span>
                </div>
              </button>
            )}

            {/* 3. WhatsApp Direct Share */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-base-200/70 hover:bg-success/15 hover:text-success border border-base-content/10 font-semibold text-xs transition-all text-left"
            >
              <MessageSquare className="w-4 h-4 text-success shrink-0" />
              <div className="flex flex-col truncate">
                <span className="truncate">WhatsApp</span>
                <span className="text-[10px] text-base-content/50 font-normal">Direct message</span>
              </div>
            </button>

            {/* 4. Email Share */}
            <button
              type="button"
              onClick={handleEmailShare}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-base-200/70 hover:bg-info/15 hover:text-info border border-base-content/10 font-semibold text-xs transition-all text-left"
            >
              <Mail className="w-4 h-4 text-info shrink-0" />
              <div className="flex flex-col truncate">
                <span className="truncate">Send Email</span>
                <span className="text-[10px] text-base-content/50 font-normal">Mail client</span>
              </div>
            </button>

            {/* 5. Export as PDF */}
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-base-200/70 hover:bg-error/15 hover:text-error border border-base-content/10 font-semibold text-xs transition-all text-left"
            >
              <FileText className="w-4 h-4 text-error shrink-0" />
              <div className="flex flex-col truncate">
                <span className="truncate">Export as PDF</span>
                <span className="text-[10px] text-base-content/50 font-normal">Formatted .pdf document</span>
              </div>
            </button>

            {/* 6. Export as JPEG */}
            <button
              type="button"
              onClick={handleExportJpeg}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-base-200/70 hover:bg-primary/15 hover:text-primary border border-base-content/10 font-semibold text-xs transition-all text-left"
            >
              <FileImage className="w-4 h-4 text-primary shrink-0" />
              <div className="flex flex-col truncate">
                <span className="truncate">Export as JPEG</span>
                <span className="text-[10px] text-base-content/50 font-normal">Card .jpg image</span>
              </div>
            </button>

            {/* 7. Download Text File */}
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-base-200/70 hover:bg-warning/15 hover:text-warning border border-base-content/10 font-semibold text-xs transition-all text-left col-span-2"
            >
              <Download className="w-4 h-4 text-warning shrink-0" />
              <div className="flex flex-col truncate">
                <span className="truncate">Download .txt File</span>
                <span className="text-[10px] text-base-content/50 font-normal">Save note text to disk</span>
              </div>
            </button>

            {/* 6. Native Browser Share (if supported) */}
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="btn btn-primary btn-sm rounded-2xl gap-2 font-bold text-white shadow-md shadow-primary/20 col-span-2 mt-1"
              >
                <Globe className="w-4 h-4" />
                <span>More Options (Web Share)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 flex justify-end border-t border-base-content/10 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm rounded-xl font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShareModal;
