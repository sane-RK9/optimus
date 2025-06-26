import { AgentMessageContent } from './agentmessagecontent';
import type { Message } from './messagelist';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-sm font-semibold">
          A
        </div>
      )}
      
      <div className={`max-w-2xl min-w-0 ${isUser ? 'flex flex-row-reverse gap-3' : ''}`}>
        {isUser && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
            U
          </div>
        )}
        
        <div className={`rounded-lg px-4 py-3 shadow-sm ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border border-gray-200'
        }`}>
          {isUser ? (
            <p className="text-white whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <AgentMessageContent message={message} />
          )}
        </div>
      </div>
    </div>
  );
};