import { Tabs } from '../ui/tabs';
import { CodeBlock } from '../ui/codeblock';
import type { Message } from './messagelist';

interface AgentMessageContentProps {
  message: Message;
}

export const AgentMessageContent: React.FC<AgentMessageContentProps> = ({ message }) => {
  const tabs = [
    {
      label: 'Summary',
      content: <p className="text-gray-800">{message.content}</p>,
    },
    // Conditionally add other tabs if data exists
    ...(message.plan
      ? [{
          label: 'Plan',
          content: (
            <ul className="space-y-2 list-decimal list-inside">
              {message.plan.map((step, i) => <li key={i} className="text-gray-700"><code>{step}</code></li>)}
            </ul>
          ),
        }]
      : []),
    ...(message.generatedCode
      ? [{
          label: 'Code',
          content: <CodeBlock code={message.generatedCode} />,
        }]
      : []),
    ...(message.logs
      ? [{
          label: 'Log',
          content: <pre className="p-2 text-xs text-gray-500 bg-gray-900 rounded-md whitespace-pre-wrap">{message.logs}</pre>,
        }]
      : []),
  ];

  return <Tabs tabs={tabs} />;
};