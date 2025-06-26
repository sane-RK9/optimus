import { AgentMessageContent } from './agentmessagecontent';
import type { Message } from './messagelist';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white ${isUser ? 'bg-blue-600' : 'bg-green-600'}`}>
        {isUser ? 'U' : 'A'}
      </div>
      <div className={`max-w-2xl rounded-lg px-4 py-3 shadow-sm ${isUser ? 'bg-blue-100' : 'bg-gray-100'}`}>
        {isUser ? (
          <p className="text-gray-800">{message.content}</p>
        ) : (
          <AgentMessageContent message={message} />
        )}
      </div>
    </div>
  );
};