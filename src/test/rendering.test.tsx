// ============================================================
// src/test/rendering.test.tsx
// Component Rendering & WCAG 2.2 AA Accessibility Landmarks
// Tier 4 Validation Suite: Screen Reader Twins & Semantic Structure
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sparkline } from '../components/Dashboard/Sparkline';
import { AlertBanner } from '../components/shared/AlertBanner';
import { PollutantCard } from '../components/Dashboard/PollutantCard';
import { AppProvider } from '../context/AppContext';

describe('Component Accessibility & Presentation Rendering', () => {
  it('renders Sparkline with role="img" and matching .sr-only textual twin', () => {
    const testData = [100, 150, 200, 250, 300];
    render(<Sparkline data={testData} label="Historical Telemetry" />);

    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label');

    // Verify .sr-only twin lists every numerical reading
    expect(screen.getByText('Historical Telemetry Detailed Readings (Past 12 Hours)')).toBeInTheDocument();
    expect(screen.getByText('Hour 5: AQI 300')).toBeInTheDocument();
  });

  it('renders AlertBanner with role="alert" when smog emergency or inversion is active', () => {
    render(
      <AppProvider>
        <AlertBanner />
      </AppProvider>
    );

    const banner = screen.getByRole('alert');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders PollutantCard with category badge and WHO limit comparison', () => {
    render(
      <PollutantCard
        name="Fine Particulate Matter"
        chemicalFormula="PM2.5"
        value={150}
        unit="µg/m³"
        whoLimit={15}
        category="hazardous"
        healthDescription="Penetrates deep pulmonary alveoli."
      />
    );

    expect(screen.getByText('Fine Particulate Matter')).toBeInTheDocument();
    expect(screen.getByText('(PM2.5)')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText(/hazardous/i)).toBeInTheDocument();
    expect(screen.getByText('10.0x Safe Limit')).toBeInTheDocument();
  });
});
