import React from 'react';

const Dot: React.FC<{ delay?: string }> = ({ delay = '0s' }) => (
  <div 
    className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" 
    style={{ animationDelay: delay }}
  />
);

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-sm font-semibold">
        A
      </div>
      <div className="flex items-center space-x-1.5 rounded-lg bg-white border border-gray-200 px-4 py-3 shadow-sm">
        <Dot />
        <Dot delay="0.1s" />
        <Dot delay="0.2s" />
        <span className="ml-2 text-sm text-gray-600">Agent is thinking...</span>
      </div>
    </div>
  );
};