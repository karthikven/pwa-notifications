import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageForm from './MessageForm';

function MessageBoard() {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const response = await fetch('http://localhost:8000/messages/');
    const data = await response.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-light text-zinc-900 text-center tracking-tight">message board</h1>
      <MessageForm onMessagePosted={fetchMessages} />
      <MessageList messages={messages} />
    </div>
  );
}

export default MessageBoard;