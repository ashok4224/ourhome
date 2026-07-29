/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ErrorBoundary — Catches rendering errors in child components and shows
 * a graceful fallback UI instead of white-screening the entire app.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onNavigateHome?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // In production, this would send to an error reporting service (e.g., Sentry)
    console.error('[ErrorBoundary] Caught rendering error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallbackTitle = 'Something went wrong', onNavigateHome } = this.props;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-xl p-8 text-center space-y-5">
            
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 border border-rose-200/60">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{fallbackTitle}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                An unexpected error occurred while rendering this section. 
                The rest of the application is unaffected.
              </p>
            </div>

            {/* Error Details (dev only) */}
            {this.state.error && process.env.NODE_ENV !== 'production' && (
              <details className="text-left bg-slate-50 border border-slate-200 rounded-xl p-3">
                <summary className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-[10px] font-mono text-rose-600 overflow-x-auto whitespace-pre-wrap break-words">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-md shadow-emerald-500/15 hover:shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              {onNavigateHome && (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 font-semibold py-2.5 px-5 rounded-xl text-sm border border-slate-200 hover:bg-slate-200 transition-all"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
