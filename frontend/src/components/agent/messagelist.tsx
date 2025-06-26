import { MessageItem } from './message';

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
    <div className="flex-1 space-y-6">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
};