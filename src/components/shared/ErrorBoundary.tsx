// ============================================================
// src/components/shared/ErrorBoundary.tsx
// Production React Error Boundary for AeroGuard AI
// Catches render exceptions, displays accessible fallback,
// logs structured error details, and allows clean state recovery
// ============================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { logger } from '../../lib/logger';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Unhandled React component exception captured by ErrorBoundary:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="p-6 bg-rose-950/60 border border-rose-600/40 rounded-2xl text-center space-y-4 my-6 shadow-xl"
        >
          <div className="flex items-center justify-center space-x-2 text-rose-400">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
            <h2 className="text-xl font-bold">
              {this.props.fallbackTitle || 'Component Error Detected'}
            </h2>
          </div>
          <p className="text-sm text-rose-200/80 max-w-lg mx-auto">
            A temporary rendering anomaly occurred within this module. The application core remains safe and operational.
          </p>
          {this.state.error && (
            <p className="text-xs font-mono bg-slate-950/80 p-3 rounded-lg text-rose-300 border border-rose-900/40 max-w-lg mx-auto overflow-x-auto text-left">
              {this.state.error.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition-colors focus:ring-2 focus:ring-rose-400 focus:outline-none"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Recover Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
