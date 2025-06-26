import { Tabs } from '../ui/tabs';
import { CodeBlock } from '../ui/codeblock';
import type { Message } from './messagelist';

export const AgentMessageContent: React.FC<{ message: Message }> = ({ message }) => {
  const tabs = [
    { 
      label: 'Summary', 
      content: (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 leading-relaxed">{message.content}</p>
        </div>
      )
    },
    ...(message.plan ? [{ 
      label: 'Plan', 
      content: (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-2">Execution Plan:</h4>
          <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700">
            {message.plan.map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
        </div>
      )
    }] : []),
    ...(message.generatedCode ? [{ 
      label: 'Code', 
      content: (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Generated Code:</h4>
          <CodeBlock code={message.generatedCode} />
        </div>
      )
    }] : []),
    ...(message.logs ? [{ 
      label: 'Logs', 
      content: (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Execution Log:</h4>
          <pre className="whitespace-pre-wrap rounded-md bg-gray-900 p-3 text-xs text-green-400 font-mono overflow-x-auto">
            {message.logs}
          </pre>
        </div>
      )
    }] : []),
  ];

  const validTabs = tabs.filter(Boolean);

  // If only summary tab, don't show tabs UI
  if (validTabs.length === 1) {
    return <div>{validTabs[0].content}</div>;
  }

  return <Tabs tabs={validTabs} />;
};