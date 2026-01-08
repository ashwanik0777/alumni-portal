"use client";

import { useState, useEffect } from "react";

export default function StyleGuidePage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans transition-colors duration-300 pb-20">
      
      {/* Header / Nav */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Theme & Component Showcase</h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg bg-text-primary text-background font-medium hover:opacity-90 transition-opacity text-sm cursor-pointer"
          >
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        
        {/* Section 1: Color Palette Overview (Raw Colors) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🎨</span>
            <h2 className="text-2xl font-bold text-text-primary">1. Color Palette (Raw)</h2>
          </div>
          <p className="text-text-secondary mb-4">
            Visual reference for all defined theme variables.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-primary shadow-sm flex items-center justify-center text-white font-mono text-sm">--color-primary</div>
              <p className="text-sm font-medium text-text-primary text-center">Primary Action</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-secondary shadow-sm flex items-center justify-center text-white font-mono text-sm">--color-secondary</div>
              <p className="text-sm font-medium text-text-primary text-center">Secondary / Success</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-accent shadow-sm flex items-center justify-center text-white font-mono text-sm">--color-accent</div>
              <p className="text-sm font-medium text-text-primary text-center">Accent / Highlight</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg border border-border bg-background shadow-sm flex items-center justify-center text-text-primary font-mono text-sm">--color-bg</div>
              <p className="text-sm font-medium text-text-primary text-center">Page Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg border border-border bg-card shadow-sm flex items-center justify-center text-text-primary font-mono text-sm">--color-card</div>
              <p className="text-sm font-medium text-text-primary text-center">Card Surface</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-text-primary shadow-sm flex items-center justify-center text-background font-mono text-sm">--color-text-primary</div>
              <p className="text-sm font-medium text-text-primary text-center">Main Text</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-text-secondary shadow-sm flex items-center justify-center text-background font-mono text-sm">--color-text-secondary</div>
              <p className="text-sm font-medium text-text-primary text-center">Muted Text</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-border shadow-sm flex items-center justify-center text-text-primary font-mono text-sm">--color-border</div>
              <p className="text-sm font-medium text-text-primary text-center">Borders</p>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* Section 2: Typography & Text Colors */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">📝</span>
            <h2 className="text-2xl font-bold text-text-primary">2. Typography & Text Colors</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-wider text-text-secondary font-semibold">Headings</h3>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-text-primary">Heading 1 (Text Primary)</h1>
                <h2 className="text-3xl font-bold text-primary">Heading 2 (Primary Color)</h2>
                <h3 className="text-2xl font-bold text-secondary">Heading 3 (Secondary Color)</h3>
                <h4 className="text-xl font-bold text-accent">Heading 4 (Accent Color)</h4>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-wider text-text-secondary font-semibold">Paragraphs</h3>
              <p className="text-text-primary leading-relaxed">
                <span className="font-bold">Text Primary:</span> This is the standard text color used for the main content. 
                It should have the highest contrast against the background. 
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <p className="text-text-secondary leading-relaxed">
                 <span className="font-bold">Text Secondary:</span> This is used for supporting text, subtitles, or less important information. 
                 It is softer and recedes slightly into the background. 
                 Sed do eiusmod tempor incididunt ut labore.
              </p>
              <p className="text-sm text-text-secondary italic">
                (Small Label text usually looks like this)
              </p>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* Section 3: Buttons & Interactive Elements */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🔘</span>
            <h2 className="text-2xl font-bold text-text-primary">3. Buttons & Actions</h2>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer">
              Primary Button
            </button>
            <button className="px-6 py-2.5 rounded-lg bg-secondary text-white font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer">
              Secondary Button
            </button>
            <button className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer">
              Accent Button
            </button>
            <button className="px-6 py-2.5 rounded-lg border border-border text-text-primary bg-transparent hover:bg-card transition-colors cursor-pointer">
              Outline / Ghost
            </button>
            <button className="px-6 py-2.5 rounded-lg bg-text-secondary text-white font-medium opacity-50 cursor-not-allowed">
              Disabled
            </button>
          </div>
        </section>

        <hr className="border-border" />

        {/* Section 4: Cards, Borders & Surfaces */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🃏</span>
            <h2 className="text-2xl font-bold text-text-primary">4. Surfaces & Borders</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             {/* Standard Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary text-xl">
                 ★
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Standard Card</h3>
              <p className="text-text-secondary text-sm">
                This card uses <code>bg-card</code> and <code>border-border</code>. 
                It represents distinct modules of content floating on the background.
              </p>
            </div>

            {/* Highlighted Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-primary mb-2">Primary Highlight</h3>
              <p className="text-text-secondary text-sm">
                Sometimes you need a card that stands out. We use a low-opacity primary background here.
              </p>
              <button className="mt-4 text-sm font-semibold text-primary hover:underline cursor-pointer">
                Read more →
              </button>
            </div>

            {/* Accent Card */}
            <div className="bg-gradient-to-br from-secondary to-green-600 rounded-xl p-6 text-white shadow-md">
              <h3 className="text-lg font-bold mb-2">Filled Surface</h3>
              <p className="text-white/90 text-sm">
                This card uses the full <code>secondary</code> color for specialized call-to-action areas.
              </p>
              <button className="mt-4 px-4 py-1.5 bg-white text-secondary rounded text-xs font-bold uppercase tracking-wide cursor-pointer">
                Action
              </button>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* Section 5: Form Elements */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">⌨️</span>
            <h2 className="text-2xl font-bold text-text-primary">5. Form Inputs</h2>
          </div>

          <div className="max-w-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-text-secondary/50"
              />
              <p className="text-xs text-text-secondary mt-1">We'll never share your email.</p>
            </div>

            <div className="flex gap-4">
               <div className="flex-1">
                  <label className="block text-sm font-medium text-text-primary mb-1">First Name</label>
                  <input 
                    type="text" 
                    defaultValue="John"
                    className="w-full px-4 py-2 rounded-lg border border-primary bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-primary mt-1">Active / Focused state (simulated)</p>
               </div>
               <div className="flex-1">
                  <label className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-red-400 bg-red-50 dark:bg-red-900/20 text-text-primary focus:outline-none"
                    placeholder="Doe"
                  />
                   <p className="text-xs text-red-500 mt-1">Error state example</p>
               </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
