"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const ColorCard = ({ name, variable, bgClass, textClass }: { name: string, variable: string, bgClass: string, textClass: string }) => (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl shadow-sm border border-border bg-card transition-colors duration-300">
      <div className={`w-24 h-24 rounded-lg shadow-inner ${bgClass} border border-border flex items-center justify-center transition-colors duration-300`}>
        <span className={`text-xs ${textClass} font-mono`}>{variable}</span>
      </div>
      <p className="font-semibold text-text-primary capitalize">{name}</p>
    </div>
  );

  return (
    <div className="min-h-screen p-8 transition-colors duration-300 bg-background text-text-primary font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Theme Color Palette</h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ColorCard name="Primary" variable="--primary" bgClass="bg-primary" textClass="text-white" />
          <ColorCard name="Secondary" variable="--secondary" bgClass="bg-secondary" textClass="text-white" />
          <ColorCard name="Accent" variable="--accent" bgClass="bg-accent" textClass="text-black" />
          <ColorCard name="Background" variable="--bg" bgClass="bg-background" textClass="text-text-primary" />
          <ColorCard name="Card" variable="--card" bgClass="bg-card" textClass="text-text-primary" />
          <ColorCard name="Text Primary" variable="--text-primary" bgClass="bg-text-primary" textClass="text-background" />
          <ColorCard name="Text Secondary" variable="--text-secondary" bgClass="bg-text-secondary" textClass="text-background" />
          <ColorCard name="Border" variable="--border" bgClass="bg-border" textClass="text-text-primary" />
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-text-primary">Preview Content</h2>
          <p className="text-text-secondary leading-relaxed">
            This is a sample paragraph to demonstrate the text colors. 
            The primary text color is used for headings and main content, 
            while secondary text is used for supporting information like this.
            The background of this box uses the card color, and it has a border using the border color.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="px-4 py-2 rounded-md bg-primary text-white font-medium hover:opacity-90 transition-opacity cursor-pointer">Primary Button</button>
            <button className="px-4 py-2 rounded-md bg-secondary text-white font-medium hover:opacity-90 transition-opacity cursor-pointer">Secondary Button</button>
            <button className="px-4 py-2 rounded-md bg-accent text-black font-medium hover:opacity-90 transition-opacity cursor-pointer">Accent Button</button>
            <button className="px-4 py-2 rounded-md border border-border text-text-primary hover:bg-background transition-colors cursor-pointer">Outline Button</button>
          </div>
        </div>
      </div>
    </div>
  );
}
