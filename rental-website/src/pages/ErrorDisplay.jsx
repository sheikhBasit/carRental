import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex h-screen items-center justify-center bg-red-50">
    <div className="text-center">
      <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
      <h2 className="text-2xl font-bold text-red-700">Dashboard Error</h2>
      <p className="text-red-500">{error}</p>
      <button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

export default ErrorDisplay;