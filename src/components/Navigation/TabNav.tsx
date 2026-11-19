// ============================================================
// src/components/Navigation/TabNav.tsx
// ARIA Compliant Tablist with Full Keyboard Navigation
// Per WCAG 2.2 AA (arrow key navigation, tab stops, focus rings)
// ============================================================

import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Calendar, Compass, Wind, Users } from 'lucide-react';

export const TabNav: React.FC = () => {
  const { activeTab, setActiveTab, t, isHighContrast } = useApp();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = [
    { id: 'telemetry', label: t.tabTelemetry, icon: Activity },
    { id: 'routine', label: t.tabRoutine, icon: Calendar },
    { id: 'transit', label: t.tabTransit, icon: Compass },
    { id: 'iaq', label: t.tabIAQ, icon: Wind },
    { id: 'community', label: t.tabCommunity, icon: Users },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    setActiveTab(tabs[newIndex].id);
    tabRefs.current[newIndex]?.focus();
  };

  return (
    <nav
      aria-label="Application Sections"
      className={`border-b transition-colors ${
        isHighContrast ? 'bg-black border-yellow-400' : 'bg-slate-900 border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          role="tablist"
          aria-label="Navigation Tabs"
          className="flex space-x-2 sm:space-x-8 overflow-x-auto py-2 scrollbar-none"
        >
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex items-center space-x-2 py-3 px-3 text-sm font-semibold rounded-lg border-b-2 transition-all whitespace-nowrap focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  isSelected
                    ? isHighContrast
                      ? 'border-yellow-400 text-yellow-300 bg-yellow-950/40'
                      : 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
