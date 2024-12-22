import React from 'react';
import MessageBoard from './MessageBoard';
import useNotifications from './hooks/useNotifications';

function App() {
  const { isSupported, isSubscribed, subscribe, error } = useNotifications();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        {isSupported && (
          <div className="mb-4 text-center">
            {isSubscribed ? (
              <p className="text-sm text-zinc-600">
                ✅ Notifications enabled
              </p>
            ) : (
              <button 
                onClick={subscribe}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔔 Enable notifications
              </button>
            )}
          </div>
        )}
        <MessageBoard />
      </div>
    </div>
  );
}

export default App;