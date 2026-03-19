import { Component } from "react";
import { AlertTriangleIcon } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#1a1b1e] min-h-screen w-full flex items-center justify-center p-4">
          <div className="bg-[#2b2d31] rounded-2xl p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangleIcon className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-white text-xl font-bold mb-2">
              Something went wrong
            </h1>
            <p className="text-[#949ba4] text-sm mb-6">
              Please refresh the page to continue
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
