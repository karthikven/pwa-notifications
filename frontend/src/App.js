import React from 'react';
import MessageBoard from './MessageBoard';

function App() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MessageBoard />
      </div>
    </div>
  );
}

export default App;