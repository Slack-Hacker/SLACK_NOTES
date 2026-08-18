import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

const DeleteModal = ({ isOpen, onClose, onConfirm, title = "Delete Note", message = "Are you sure you want to delete this note? This action cannot be undone.", loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card bg-base-100 border border-base-content/10 w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-6 pb-0 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content">{title}</h3>
              <p className="text-xs text-base-content/60 mt-0.5">{message}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-base-content"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-6 flex items-center justify-end gap-3 pt-6 border-t border-base-content/5 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-sm rounded-xl font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-error btn-sm gap-2 rounded-xl text-white font-semibold shadow-md shadow-error/20"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteModal;
