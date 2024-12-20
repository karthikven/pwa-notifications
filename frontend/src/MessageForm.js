import React, { useState } from 'react';

function MessageForm({ onMessagePosted }) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await fetch('http://localhost:8000/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, author }),
      });
      
      setContent('');
      onMessagePosted();
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
          required
        />
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <textarea
          placeholder="Your message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent min-h-[120px]"
          required
        />
      </div>
      <div className="flex justify-center">
        <button 
          type="submit"
          className="max-w-full ml-2/3 text-center items-center bg-zinc-900 text-white py-2 px-4 rounded-lg hover:bg-zinc-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
        >
          Post Message
        </button>
      </div>
    </form>
  );
}

export default MessageForm;