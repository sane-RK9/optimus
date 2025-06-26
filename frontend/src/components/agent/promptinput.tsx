import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '../ui/button';

interface PromptInputProps {
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (!prompt.trim() || disabled) return;
    
    onSendMessage?.(prompt.trim());
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4">
      <div className="relative flex items-end gap-3 rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <TextareaAutosize
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the agent to do something..."
          className="flex-1 resize-none border-0 bg-transparent p-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
          maxRows={6}
          minRows={1}
          disabled={disabled}
        />
        <div className="p-2">
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || disabled}
            className="!p-2 !bg-blue-600 hover:!bg-blue-700 disabled:!bg-gray-300"
            title="Send message"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};