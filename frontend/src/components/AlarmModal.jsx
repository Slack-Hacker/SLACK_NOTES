import React, { useEffect } from "react";
import { Bell, Volume2, ArrowRight, Clock } from "lucide-react";
import { playAlarmSound } from "../services/alarmService";
import { Link } from "react-router";

const AlarmModal = ({ note, onDismiss, onSnooze }) => {
  useEffect(() => {
    if (note) {
      // Play chime sound immediately on alarm trigger
      playAlarmSound();

      // Repeat chime sound every 3 seconds while modal is active until dismissed/snoozed
      const interval = setInterval(() => {
        playAlarmSound();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [note]);

  if (!note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="card bg-base-100 border-2 border-primary/50 w-full max-w-md shadow-2xl rounded-3xl overflow-hidden animate-scale-up">
        
        {/* Header Banner */}
        <div className="bg-linear-to-r from-primary to-secondary p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center animate-bounce">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">Alarm Reminder</span>
              <h3 className="text-lg font-extrabold leading-tight">It's Time! ⏰</h3>
            </div>
          </div>

          <button
            onClick={() => playAlarmSound()}
            className="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/20"
            title="Replay alarm chime sound"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Note Details */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-bold text-xl text-base-content leading-snug">{note.title}</h4>
            <p className="text-xs text-base-content/60 mt-1 line-clamp-4 whitespace-pre-line leading-relaxed">
              {note.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-base-content/10 flex flex-col sm:flex-row items-center justify-end gap-2">
            <button
              onClick={() => onSnooze(note)}
              className="btn btn-ghost btn-sm w-full sm:w-auto gap-1.5 rounded-xl text-base-content/70"
            >
              <Clock className="w-4 h-4" />
              Snooze 10m
            </button>

            <button
              onClick={() => onDismiss(note._id)}
              className="btn btn-outline btn-sm w-full sm:w-auto rounded-xl"
            >
              Dismiss
            </button>

            <Link
              to={`/detail/${note._id}`}
              onClick={() => onDismiss(note._id)}
              className="btn btn-primary btn-sm w-full sm:w-auto gap-1.5 rounded-xl font-semibold shadow-md shadow-primary/20"
            >
              <span>View Note</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AlarmModal;
