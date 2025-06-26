// frontend/src/components/agent/PromptInput.tsx
import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '../ui/button';

export const PromptInput: React.FC = () => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    console.log("Submitting prompt:", prompt);
    // In Phase 3, this will call the API
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
      <div className="relative rounded-lg border border-gray-300 shadow-sm">
        <TextareaAutosize
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the agent to do something..."
          className="w-full resize-none border-0 bg-transparent p-3 pr-16 text-gray-800 focus:ring-0"
          maxRows={5}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button onClick={handleSubmit} className="!p-2">
            <PaperAirplaneIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};