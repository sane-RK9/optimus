import React from 'react';
import { MessageItem } from './messageitem';

// Define a type for our message structure
export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  plan?: string[];
  generatedCode?: string;
  logs?: string;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 p-4 space-y-6 overflow-y-auto">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
};