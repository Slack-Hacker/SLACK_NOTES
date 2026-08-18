import React from "react";
import { Palette, X, Check, Sun, Moon } from "lucide-react";

const LIGHT_THEMES = [
  { name: "light", label: "Light", desc: "Clean & Bright Blue", color: "#3b82f6" },
  { name: "emerald", label: "Emerald", desc: "Fresh Green Palette", color: "#10b981" },
  { name: "cupcake", label: "Cupcake", desc: "Soft Pink & Teal", color: "#65c3c8" },
  { name: "corporate", label: "Corporate", desc: "Modern Business Blue", color: "#4b6bfb" },
];

const DARK_THEMES = [
  { name: "dark", label: "Dark", desc: "Sleek Dark Mode", color: "#1f2937" },
  { name: "dracula", label: "Dracula", desc: "Gothic Purple Dark", color: "#ff79c6" },
  { name: "synthwave", label: "Synthwave", desc: "Neon Retro Cyber", color: "#e779c1" },
  { name: "sunset", label: "Sunset", desc: "Dark Sunset Violet", color: "#ff865b" },
];

const ThemeModal = ({ isOpen, currentTheme, onSelectTheme, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card bg-base-100 border border-base-content/10 w-full max-w-lg shadow-2xl rounded-3xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content">Select Visual Theme</h3>
              <p className="text-xs text-base-content/60">Choose your preferred color theme for SlackNotes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Sections Container */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          
          {/* Light Themes Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-base-content/60">
              <Sun className="w-4 h-4 text-warning" />
              <span>Light Themes ({LIGHT_THEMES.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LIGHT_THEMES.map((t) => {
                const isActive = currentTheme === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => onSelectTheme(t.name)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group ${
                      isActive 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs font-bold" 
                        : "border-base-content/10 bg-base-200/40 hover:border-primary/50 hover:bg-base-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-4 h-4 rounded-full border border-base-content/20 shadow-xs shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <div>
                        <span className={`font-bold text-xs block capitalize ${isActive ? "text-primary" : "text-base-content"}`}>
                          {t.label}
                        </span>
                        <span className="text-[10px] text-base-content/50 block">
                          {t.desc}
                        </span>
                      </div>
                    </div>

                    {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dark Themes Section */}
          <div className="space-y-3 pt-4 border-t border-base-content/10">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-base-content/60">
              <Moon className="w-4 h-4 text-primary" />
              <span>Dark Themes ({DARK_THEMES.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DARK_THEMES.map((t) => {
                const isActive = currentTheme === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => onSelectTheme(t.name)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group ${
                      isActive 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs font-bold" 
                        : "border-base-content/10 bg-base-200/40 hover:border-primary/50 hover:bg-base-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-4 h-4 rounded-full border border-base-content/20 shadow-xs shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <div>
                        <span className={`font-bold text-xs block capitalize ${isActive ? "text-primary" : "text-base-content"}`}>
                          {t.label}
                        </span>
                        <span className="text-[10px] text-base-content/50 block">
                          {t.desc}
                        </span>
                      </div>
                    </div>

                    {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-base-200/50 border-t border-base-content/5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary btn-sm rounded-xl px-6 font-semibold text-white"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default ThemeModal;
