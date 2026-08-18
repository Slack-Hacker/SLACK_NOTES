import React from "react";
import { Link } from "react-router";
import { StickyNote, SearchX, Plus, RefreshCw } from "lucide-react";

const EmptyState = ({ isSearch = false, searchQuery = "", onResetSearch }) => {
  return (
    <div className="card bg-base-100/60 border border-base-content/10 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-8">
      <div className="flex flex-col items-center justify-center gap-4">
        
        {/* Animated Icon Container */}
        <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-primary/10 to-secondary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          {isSearch ? (
            <SearchX className="w-10 h-10 text-secondary" />
          ) : (
            <StickyNote className="w-10 h-10 text-primary" />
          )}
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-2">
          <h3 className="font-bold text-xl sm:text-2xl">
            {isSearch ? "No Notes Found" : "Your Notebook is Empty"}
          </h3>
          <p className="text-base-content/60 text-sm max-w-sm mx-auto leading-relaxed">
            {isSearch ? (
              <>
                No notes matched your search query <span className="font-semibold text-primary">"{searchQuery}"</span>. Try a different keyword or filter.
              </>
            ) : (
              "Capture your ideas, meeting notes, code snippets, or daily thoughts in one place."
            )}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          {isSearch ? (
            <button
              onClick={onResetSearch}
              className="btn btn-outline btn-sm sm:btn-md gap-2 rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Search
            </button>
          ) : (
            <Link
              to="/create"
              className="btn btn-primary btn-sm sm:btn-md gap-2 rounded-xl shadow-lg shadow-primary/25 hover:scale-105 transition-all font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Your First Note
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default EmptyState;
