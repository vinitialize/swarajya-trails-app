import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleReturnHome = () => {
    // Reset error and scroll to top
    resetError();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Clear any stored state that might cause issues
    try {
      sessionStorage.removeItem('currentItinerary');
      sessionStorage.removeItem('mapState');
    } catch (e) {
      // Ignore storage errors
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        {/* Error Icon */}
        <div className="text-6xl mb-6">🚧</div>
        
        {/* Error Message */}
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Oops! Something went wrong
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {error?.message?.includes('intent') || error?.message?.includes('URL') 
            ? "We encountered an issue with the navigation link. This sometimes happens on mobile devices when trying to open external apps."
            : "An unexpected error occurred. Don't worry, you can get back to exploring Maharashtra's forts!"
          }
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleReturnHome}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            🏠 Return to Home
          </button>
          
          <button
            onClick={handleRefresh}
            className="w-full px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            🔄 Refresh Page
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            If you continue experiencing issues:
          </p>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div>• Try refreshing the page</div>
            <div>• Check your internet connection</div>
            <div>• Clear your browser cache</div>
          </div>
        </div>

        {/* Error Details (for debugging) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-700 p-3 rounded overflow-auto text-slate-700 dark:text-slate-300">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;
export { DefaultErrorFallback };
