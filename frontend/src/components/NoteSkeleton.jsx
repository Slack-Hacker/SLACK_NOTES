import React from "react";

const NoteSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="card bg-base-100/60 border border-base-content/10 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse"
        >
          {/* Skeleton Title */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-base-300 rounded-lg w-3/4" />
            <div className="h-5 w-5 bg-base-300 rounded-full" />
          </div>

          {/* Skeleton Content lines */}
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-base-300 rounded w-full" />
            <div className="h-4 bg-base-300 rounded w-5/6" />
            <div className="h-4 bg-base-300 rounded w-2/3" />
          </div>

          {/* Skeleton Footer */}
          <div className="pt-4 border-t border-base-content/5 flex items-center justify-between">
            <div className="h-3 bg-base-300 rounded w-24" />
            <div className="flex gap-2">
              <div className="h-6 w-12 bg-base-300 rounded-lg" />
              <div className="h-6 w-6 bg-base-300 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteSkeleton;
