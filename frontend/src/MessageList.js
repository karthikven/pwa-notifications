import React from 'react';

function MessageList({ messages }) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className="p-6 bg-white rounded-lg shadow-sm border border-zinc-100"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-lg font-medium text-zinc-900">
                {message.author}
              </strong>
              <small className="text-zinc-500">
                {new Date(message.created_at).toLocaleString()}
              </small>
            </div>
            <p className="text-zinc-700 leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MessageList;