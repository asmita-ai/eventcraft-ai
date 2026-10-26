import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Secure diagnostic logging without sensitive data leakage
    console.error(
      'ErrorBoundary caught an unhandled runtime error:',
      error.message,
      errorInfo.componentStack
    );
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('eventcraft_api_key');
      localStorage.removeItem('eventcraft_active_plan');
    } catch {
      // Ignore localStorage errors
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6"
        >
          <div className="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Something went unexpected
              </h1>
              <p className="text-sm text-slate-400">
                EventCraft AI encountered an unexpected UI state. Your data is protected by
                client-side fault-isolation.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs text-red-300 font-mono overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <Home className="w-4 h-4" />
                Reset Workspace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
