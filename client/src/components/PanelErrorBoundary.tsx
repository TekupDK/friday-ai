import { AlertTriangle } from "lucide-react";
import { Component, ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for panel components
 * Prevents a crash in one panel from breaking the entire app
 */
export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Panel-level logging for debugging and monitoring
    const logData = {
      panelName: this.props.name,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console with structured data
    console.error(`[${this.props.name} Panel Error]`, logData);

    // Panel-level breadcrumb tracking (stub for future Sentry integration)
    const breadcrumb = {
      message: `Panel ${this.props.name} encountered an error`,
      category: "panel",
      level: "error",
      data: logData,
    };
    console.info("[Panel Breadcrumb]", breadcrumb);

    // Send to Sentry error tracking service (async, non-blocking)
    import("@sentry/react")
      .then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            panel: {
              name: this.props.name,
              errorInfo,
              timestamp: logData.timestamp,
            },
          },
          tags: {
            component: "panel",
            panel_name: this.props.name,
          },
        });
      })
      .catch(sentryError => {
        // Sentry not available or failed to import - ignore
        console.warn(
          "[PanelErrorBoundary] Failed to send error to Sentry:",
          sentryError
        );
      });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-muted/5">
          <div className="text-center space-y-4 max-w-sm">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                {this.props.name} Panel Error
              </h3>
              <p className="text-sm text-muted-foreground">
                This panel encountered an error. Other panels continue to work
                normally.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                    {this.state.error.message}
                    {"\n\n"}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleReset} variant="outline" size="sm">
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()} size="sm">
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
