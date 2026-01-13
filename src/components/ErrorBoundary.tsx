import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Log to error reporting service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Reload the page to reset state
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-container">
            <div className="error-boundary-content">
              <div className="error-icon">😞</div>
              
              <h1 className="error-title">Oops! Something went wrong</h1>
              
              <p className="error-message">
                We're sorry for the inconvenience. The application encountered an unexpected error.
                Please try refreshing the page or return to the homepage.
              </p>

              {/* Show error details only in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-details">
                  <summary className="error-details-summary">
                    🔍 Error Details (Development Only)
                  </summary>
                  <div className="error-details-content">
                    <div className="error-section">
                      <h3>Error Message:</h3>
                      <pre className="error-message-pre">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    
                    {this.state.error.stack && (
                      <div className="error-section">
                        <h3>Stack Trace:</h3>
                        <pre className="error-stack-pre">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo && (
                      <div className="error-section">
                        <h3>Component Stack:</h3>
                        <pre className="error-stack-pre">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="error-actions">
                <button 
                  onClick={this.handleReset} 
                  className="error-btn error-btn-primary"
                >
                  <span className="btn-icon">🔄</span>
                  Refresh Page
                </button>
                
                <button 
                  onClick={this.handleGoHome} 
                  className="error-btn error-btn-secondary"
                >
                  <span className="btn-icon">🏠</span>
                  Go to Homepage
                </button>
              </div>

              {process.env.NODE_ENV === 'production' && (
                <p className="error-support-text">
                  If this problem persists, please contact support at{' '}
                  <a href="mailto:support@maplekids.com">support@maplekids.com</a>
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
