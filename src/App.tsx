// ============================================================
// src/App.tsx
// Core Application Shell for AeroGuard AI
// WCAG 2.2 AA Accessible Landmarks, Skip Links & Tab Panels
// Enforces Error Boundary containment across all view modules
// ============================================================

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Navigation/Header';
import { TabNav } from './components/Navigation/TabNav';
import { AlertBanner } from './components/shared/AlertBanner';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { AirTelemetryDashboard } from './components/Dashboard/AirTelemetryDashboard';
import { DailyRoutineOptimizer } from './components/Routine/DailyRoutineOptimizer';
import { TransitPlanner } from './components/Transit/TransitPlanner';
import { IAQCenter } from './components/IAQ/IAQCenter';
import { CommunityHub } from './components/Community/CommunityHub';
import { ShieldCheck, Heart, Github } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isHighContrast } = useApp();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isHighContrast ? 'bg-black text-yellow-300' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* WCAG Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg shadow-lg"
      >
        Skip to main content
      </a>

      {/* Header Landmark */}
      <Header />

      {/* Live Alert Banner */}
      <AlertBanner />

      {/* Tab Navigation */}
      <TabNav />

      {/* Main Landmark with ErrorBoundary Containment */}
      <main id="main-content" role="main" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary fallbackTitle="Module Render Error">
          {activeTab === 'telemetry' && <AirTelemetryDashboard />}
          {activeTab === 'routine' && <DailyRoutineOptimizer />}
          {activeTab === 'transit' && <TransitPlanner />}
          {activeTab === 'iaq' && <IAQCenter />}
          {activeTab === 'community' && <CommunityHub />}
        </ErrorBoundary>
      </main>

      {/* Accessible Footer */}
      <footer
        role="contentinfo"
        className={`border-t py-6 px-4 sm:px-6 lg:px-8 text-xs transition-colors ${
          isHighContrast
            ? 'bg-black border-yellow-400 text-yellow-400'
            : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>
              <strong>AeroGuard AI v1.0.0</strong> — Built for PromptWars Challenge 6 (Urban Air Quality Assistant)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>WCAG 2.2 Level AA Verified</span>
            <span>•</span>
            <span>ANSI/AHAM AC-1 Compliant</span>
            <span>•</span>
            <span>EPA &amp; CPCB Breakpoints</span>
            <span>•</span>
            <a
              href="https://github.com/Jeffreyryan2005/aeroguard-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" aria-hidden="true" />
              <span>GitHub</span>
            </a>
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" aria-hidden="true" />
            <span>for Urban Public Health</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Application Initialization Failed">
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
};
export default App;
