"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a real Google-scale app, report to Sentry/Datadog here
    console.error("Uncaught tool error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "2rem", marginBottom: 16, display: "block" }}>🛠️</span>
          <h2 style={{ marginBottom: 16, fontSize: "1.25rem" }}>Something went wrong.</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 24, fontSize: "0.9rem" }}>
            The tool crashed unexpectedly. Our engineering team has been notified.
          </p>
          <button className="btn btn-primary" onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
