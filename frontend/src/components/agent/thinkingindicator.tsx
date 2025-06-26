import React from 'react'; 

const Dot = () => <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>;

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white">A</div>
      <div className="flex items-center space-x-1.5 rounded-lg bg-gray-100 px-4 py-3 shadow-sm">
        <Dot />
        <Dot style={{ animationDelay: '0.1s' }} />
        <Dot style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
};