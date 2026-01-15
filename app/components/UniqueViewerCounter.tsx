"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export default function UniqueViewerCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Check if this user has already caused an increment
    const hasVisited = localStorage.getItem("has_visited_site");
    
    const fetchCount = async () => {
      try {
        let url = "/api/counter";
        if (!hasVisited) {
          url += "?increment=true";
          localStorage.setItem("has_visited_site", "true");
        }
        
        const res = await fetch(url);
        const data = await res.json();
        setCount(data.count);
      } catch (error) {
        console.error("Failed to fetch viewer count", error);
      }
    };

    fetchCount();
  }, []);

  if (count === null) return null;

  return (
    <div className="mt-8 pt-6  flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/20 shadow-sm">
        <Eye className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-sm font-medium text-text-secondary">
          Unique Visitors: <span className="text-secondary font-bold font-mono">{count.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}
