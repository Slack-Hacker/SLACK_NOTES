import React, { useEffect } from "react";
import { X, Download } from "lucide-react";

const ImageLightboxModal = ({ isOpen, imageUrl, title = "Screenshot", onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
        
        {/* Controls Bar */}
        <div className="w-full flex items-center justify-between p-3 bg-black/40 backdrop-blur-md rounded-t-2xl text-white">
          <span className="font-semibold text-sm truncate px-2">{title}</span>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="note-screenshot.png"
              className="btn btn-ghost btn-circle btn-xs text-white/80 hover:text-white"
              title="Download image"
              target="_blank"
              rel="noreferrer"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-xs text-white/80 hover:text-white"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="w-full bg-black/60 rounded-b-2xl overflow-hidden p-2 flex items-center justify-center border border-white/10">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl select-none"
          />
        </div>

      </div>
    </div>
  );
};

export default ImageLightboxModal;
