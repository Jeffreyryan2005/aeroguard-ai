// ============================================================
// src/test/dom.test.tsx
// Interactive DOM Action & State Flow Tests
// Tier 5 Validation Suite: Tab Navigation, Pledges & Simulations
// ============================================================

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { TabNav } from '../components/Navigation/TabNav';
import { CommunityHub } from '../components/Community/CommunityHub';
import { AirTelemetryDashboard } from '../components/Dashboard/AirTelemetryDashboard';

describe('Interactive DOM Actions & State Flows', () => {
  it('navigates across tabs using role="tab"', () => {
    render(
      <AppProvider>
        <TabNav />
      </AppProvider>
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(5);

    // Initial selected is Telemetry
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // Click Routine tab
    fireEvent.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('toggles community pledges and updates participant counts', () => {
    render(
      <AppProvider>
        <CommunityHub />
      </AppProvider>
    );

    // Find pledge button
    const pledgeButtons = screen.getAllByRole('button', { name: /Pledge/i });
    expect(pledgeButtons.length).toBeGreaterThan(0);

    const initialText = pledgeButtons[0].textContent;
    fireEvent.click(pledgeButtons[0]);
    expect(pledgeButtons[0].textContent).not.toBe(initialText);
  });

  it('triggers atmospheric inversion spike simulation and displays simulation banner', () => {
    render(
      <AppProvider>
        <AirTelemetryDashboard />
      </AppProvider>
    );

    const spikeBtn = screen.getByRole('button', { name: /Simulate Smog Inversion Spike/i });
    fireEvent.click(spikeBtn);

    // Verify simulation banner appears
    expect(screen.getByText(/Simulation Mode Active/i)).toBeInTheDocument();
  });
});
