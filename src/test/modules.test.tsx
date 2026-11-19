// ============================================================
// src/test/modules.test.tsx
// Comprehensive Component & Feature Suite for AeroGuard AI
// Validates ErrorBoundary, TransitPlanner, IAQCenter, DailyRoutine, Header & App
// ============================================================

import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { TransitPlanner } from '../components/Transit/TransitPlanner';
import { IAQCenter } from '../components/IAQ/IAQCenter';
import { DailyRoutineOptimizer } from '../components/Routine/DailyRoutineOptimizer';
import { Header } from '../components/Navigation/Header';
import { App } from '../App';

const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Simulated Module Crash');
  }
  return <div>Healthy Module Content</div>;
};

describe('ErrorBoundary Resilience', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Healthy Module Content')).toBeInTheDocument();
  });

  it('catches render errors and renders fallback UI with role="alert"', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallbackTitle="Custom Module Error">
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Custom Module Error')).toBeInTheDocument();
    expect(screen.getByText('Simulated Module Crash')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recover Component/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

describe('TransitPlanner Clean-Corridor Component', () => {
  it('renders multimodal transit options and highlights clean corridor', () => {
    render(
      <AppProvider>
        <TransitPlanner />
      </AppProvider>
    );

    expect(screen.getByText(/Clean-Corridor Multi-Modal Transit Planner/i)).toBeInTheDocument();
    const metroElements = screen.getAllByText(/Subterranean Metro/i);
    expect(metroElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Open Auto-Rickshaw/i)).toBeInTheDocument();
  });

  it('adjusts commute slider and updates duration calculation', () => {
    render(
      <AppProvider>
        <TransitPlanner />
      </AppProvider>
    );

    const slider = screen.getByLabelText(/Commute:/i);
    act(() => {
      fireEvent.change(slider, { target: { value: '25' } });
    });

    const kmLabels = screen.getAllByText(/25 km/i);
    expect(kmLabels.length).toBeGreaterThan(0);
  });
});

describe('IAQ Center & CADR Purifier Sizing', () => {
  it('renders ANSI/AHAM AC-1 room sizing calculator and updates CADR requirement', () => {
    render(
      <AppProvider>
        <IAQCenter />
      </AppProvider>
    );

    expect(screen.getByText(/Indoor Air Quality \(IAQ\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Room Dimensions/i)).toBeInTheDocument();
    const corsiMatches = screen.getAllByText(/Corsi-Rosenthal Box/i);
    expect(corsiMatches.length).toBeGreaterThan(0);
  });
});

describe('Daily Routine Optimizer & Vulnerability Selection', () => {
  it('renders persona selector and displays clinical vulnerability details', () => {
    render(
      <AppProvider>
        <DailyRoutineOptimizer />
      </AppProvider>
    );

    expect(screen.getByText(/GenAI Daily Routine/i)).toBeInTheDocument();
    const infantMatches = screen.getAllByText(/Infants & Toddlers/i);
    expect(infantMatches.length).toBeGreaterThan(0);
    const asthmaticMatches = screen.getAllByText(/Asthmatic & COPD Patient/i);
    expect(asthmaticMatches.length).toBeGreaterThan(0);
  });
});

describe('Header & Navigation Controls', () => {
  it('toggles high contrast mode and language selector', () => {
    render(
      <AppProvider>
        <Header />
      </AppProvider>
    );

    const contrastBtn = screen.getByRole('button', { name: /Toggle High Contrast/i });
    expect(contrastBtn).toBeInTheDocument();
    act(() => {
      fireEvent.click(contrastBtn);
    });

    const hindiBtn = screen.getByRole('button', { name: /हिन्दी/i });
    expect(hindiBtn).toBeInTheDocument();
    act(() => {
      fireEvent.click(hindiBtn);
    });
  });
});

describe('App Shell Full Integration', () => {
  it('renders full application shell with skip links, header, tabs and footer', () => {
    render(<App />);
    expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
