import { AgentMessageContent } from './agentmessagecontent';
import type { Message } from './messagelist';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar Placeholder */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${isUser ? 'bg-blue-500' : 'bg-green-600'}`}>
        {isUser ? 'U' : 'A'}
      </div>

      <div className={`p-3 rounded-lg max-w-xl ${isUser ? 'bg-blue-100' : 'bg-gray-100'}`}>
        {isUser ? (
          <p className="text-gray-800">{message.content}</p>
        ) : (
          <AgentMessageContent message={message} />
        )}
      </div>
    </div>
  );
};