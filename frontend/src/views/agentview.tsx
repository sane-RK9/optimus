import React from 'react';
import { MessageList } from '../components/agent/messagelist';
import { PromptInput } from '../components/agent/promptinput';
import { ThinkingIndicator } from '../components/agent/thinkingindicator';
import { mockMessages } from '../lib/mock-data';

export const AgentView: React.FC = () => {
  const isLoading = false;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-800">Agent Chat</h2>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-600">Online</span>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <MessageList Messages={mockMessages} />
        {isLoading && <ThinkingIndicator />}
      </div>

      {/* Input Area */}
      <PromptInput />
    </div>
  );
};