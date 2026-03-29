'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  errorStr: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorStr: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorStr: error.toString() };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary isolated an error in [${this.props.name || 'Widget'}]:`, error, errorInfo);
    // Future integration point for Sentry or Datadog
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="tv-widget flex flex-col items-center justify-center p-6 h-full w-full bg-red-950/10 border border-red-500/20 rounded-3xl" style={{ minHeight: '200px' }}>
          <span className="text-3xl mb-3 drop-shadow-lg">⚠️</span>
          <h2 className="text-white font-bold text-base mb-1 text-center text-rose-300/90 font-display">Widget Error</h2>
          <p className="text-[10px] text-white/40 text-center max-w-[80%] break-words font-mono line-clamp-2">
             {this.state.errorStr || "Render tree crashed."}
          </p>
          <button 
             className="mt-4 tv-focusable px-3 py-1.5 border border-white/10 rounded tracking-widest uppercase font-bold text-[10px] text-white/60 hover:bg-white/10 hover:text-white transition-all focus:ring-2 ring-rose-500"
             onClick={() => this.setState({ hasError: false })}
          >
             Reset State
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
