import React from "react";
import { Link } from "react-router";
import { 
  StickyNote, 
  Bell, 
  Pin, 
  ImageIcon, 
  Search, 
  Palette, 
  Heart, 
  Code, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  Zap,
  Volume2
} from "lucide-react";
import { playAlarmSound } from "../services/alarmService";
import toast from "react-hot-toast";

const AboutPage = () => {
  const handleTestSound = () => {
    playAlarmSound();
    toast.success("🔊 Played alarm chime sound!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      
      {/* Top Bar */}
      <div>
        <Link
          to="/"
          className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notes
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative card bg-linear-to-r from-primary/15 via-secondary/15 to-accent/15 border border-base-content/10 rounded-3xl p-8 sm:p-10 shadow-sm overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xl shadow-primary/25 shrink-0">
          <StickyNote className="w-10 h-10" />
        </div>

        <div className="space-y-2 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-base-100/80 border border-base-content/10 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5 text-secondary" /> Version 2.0 Released
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-base-content">
            SlackNotes <span className="text-xs font-normal text-base-content/60 block sm:inline font-mono">(by Slack-Hacker)</span>
          </h1>
          <p className="text-base-content/70 text-sm max-w-xl leading-relaxed">
            A minimal, fast, and feature-rich MERN stack note management workspace built with real-time audio alarms, screenshot attachment support, note pinning, and multi-theme customization.
          </p>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-base-content flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> Key Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Audio Alarms */}
          <div className="card bg-base-100 border border-base-content/10 p-5 rounded-2xl space-y-2 shadow-xs hover:border-secondary/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Audio Alarm Reminders</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Set scheduled date & time reminders. Synthesizes pleasant audio chime sounds using Web Audio API when time is up.
            </p>
            <button
              onClick={handleTestSound}
              className="btn btn-ghost btn-xs gap-1.5 text-secondary hover:bg-secondary/10 rounded-lg pt-1"
            >
              <Volume2 className="w-3.5 h-3.5" /> Test Sound
            </button>
          </div>

          {/* Screenshot Attachments */}
          <div className="card bg-base-100 border border-base-content/10 p-5 rounded-2xl space-y-2 shadow-xs hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Screenshot Attachments</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Paste screenshots directly from your clipboard (<kbd className="kbd kbd-xs">Ctrl+V</kbd>), drag & drop images, and view in high-res lightbox.
            </p>
          </div>

          {/* Pinning System */}
          <div className="card bg-base-100 border border-base-content/10 p-5 rounded-2xl space-y-2 shadow-xs hover:border-accent/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold">
              <Pin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Note Pinning</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Pin your most important code snippets, links, or meeting notes to the top of your workspace for instant access.
            </p>
          </div>

          {/* Filter & Search */}
          <div className="card bg-base-100 border border-base-content/10 p-5 rounded-2xl space-y-2 shadow-xs hover:border-info/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-info/15 text-info flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Instant Search & Tabs</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Search notes in real-time by title or content. Filter by All, Pinned, Screenshots, or Alarms with custom sorting.
            </p>
          </div>

          {/* Theme Customization */}
          <div className="card bg-base-100 border border-base-content/10 p-5 rounded-2xl space-y-2 shadow-xs hover:border-warning/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">8 Curated Themes</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Switch themes effortlessly with Emerald, Dark, Light, Cyberpunk, Synthwave, Luxury, Dracula, and Sunset.
            </p>
          </div>

          {/* Rate Limiting */}
          <div className="card bg-base-100 border border-base-content/10 p-5 rounded-2xl space-y-2 shadow-xs hover:border-success/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Upstash Rate Limiting</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Protected by Upstash Redis sliding-window rate limiting on the backend to prevent spam and ensure stability.
            </p>
          </div>

        </div>
      </div>

      {/* Tech Stack Specs */}
      <div className="card bg-base-100 border border-base-content/10 p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" /> Technical Stack
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-base-200/50 border border-base-content/5 space-y-1">
            <span className="text-base-content/50 block font-medium">Frontend</span>
            <span className="font-bold text-base-content">React 19 + Vite</span>
          </div>

          <div className="p-3 rounded-xl bg-base-200/50 border border-base-content/5 space-y-1">
            <span className="text-base-content/50 block font-medium">Styling</span>
            <span className="font-bold text-base-content">Tailwind v4 + DaisyUI v5</span>
          </div>

          <div className="p-3 rounded-xl bg-base-200/50 border border-base-content/5 space-y-1">
            <span className="text-base-content/50 block font-medium">Backend API</span>
            <span className="font-bold text-base-content">Node.js + Express</span>
          </div>

          <div className="p-3 rounded-xl bg-base-200/50 border border-base-content/5 space-y-1">
            <span className="text-base-content/50 block font-medium">Database</span>
            <span className="font-bold text-base-content">MongoDB Mongoose</span>
          </div>
        </div>
      </div>

      {/* Developer Credit Footer Card */}
      <div className="card bg-linear-to-r from-base-100 via-base-200 to-base-100 border border-base-content/10 p-6 rounded-3xl text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-base-content">
          <span>Crafted with</span>
          <Heart className="w-4 h-4 text-error fill-error" />
          <span>by</span>
          <span className="text-primary font-bold">Slack-Hacker</span>
        </div>
        <p className="text-xs text-base-content/50">
          SlackNotes • Open Source MERN Stack Application
        </p>
      </div>

    </div>
  );
};

export default AboutPage;
