import React, { useState } from 'react';
import { MessageList } from '../components/agent/messagelist';
import { PromptInput } from '../components/agent/promptinput';
import { ThinkingIndicator } from '../components/agent/thinkingindicator';
import { ConsentModal } from '../components/agent/consentmodel';
import type { Message } from '../components/agent/messagelist';

// Mock data with proper structure
const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Fetch the top story from Hacker News and save its title to a file named hn_title.txt',
  },
  {
    id: '2',
    role: 'agent',
    content: 'I will help you fetch the top story from Hacker News and save its title to a file.',
    plan: [
      'Make a request to the Hacker News API to get the top story ID',
      'Fetch the story details using that ID',
      'Extract the title from the response',
      'Write the title to a file named hn_title.txt'
    ],
    generatedCode: `import requests
import json

# Get top story ID from Hacker News API
response = requests.get('https://hacker-news.firebaseio.com/v0/topstories.json')
top_story_id = response.json()[0]

# Fetch story details
story_response = requests.get(f'https://hacker-news.firebaseio.com/v0/item/{top_story_id}.json')
story_data = story_response.json()

# Extract title
title = story_data['title']

# Save to file
with open('hn_title.txt', 'w', encoding='utf-8') as f:
    f.write(title)

print(f"Title saved: {title}")`,
    logs: `✅ Connected to Hacker News API
✅ Fetched top story ID: 39847291
✅ Retrieved story details
✅ Extracted title: "Show HN: I built a tool to visualize Git repositories"
✅ Saved title to hn_title.txt

The file has been created successfully with the current top story title from Hacker News.`
  }
];

export const AgentView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const handleSendMessage = (content: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I'll help you with: ${content}`,
        plan: ['Analyze the request', 'Generate appropriate response', 'Execute if needed'],
      };
      
      setMessages(prev => [...prev, agentResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleConsentApprove = () => {
    setShowConsentModal(false);
    setPendingAction(null);
    // Execute the approved action
  };

  const handleConsentDeny = () => {
    setShowConsentModal(false);
    setPendingAction(null);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm">
            A
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Agent Chat</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-600">Online</span>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-6 py-4">
          <MessageList messages={messages} />
          {isLoading && (
            <div className="mt-4">
              <ThinkingIndicator />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-gray-200 bg-white">
        <PromptInput onSendMessage={handleSendMessage} />
      </div>

      {/* Consent Modal */}
      {showConsentModal && pendingAction && (
        <ConsentModal
          isOpen={showConsentModal}
          onApprove={handleConsentApprove}
          onDeny={handleConsentDeny}
          actionDetails={pendingAction}
        />
      )}
    </div>
  );
};