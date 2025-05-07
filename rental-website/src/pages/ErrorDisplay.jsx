import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorDisplay = ({ error, onRetry }) => {
  const errorMessage = error?.message || 'An unexpected error occurred';
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-3">
        <div className="bg-red-100 p-2 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {errorMessage.includes('not found') ? (
                "You can navigate to other tabs to add the required data."
              ) : (
                "Please try refreshing the page or check your connection."
              )}
            </p>
            
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;