import { Tabs } from '../ui/tabs';
import { CodeBlock } from '../ui/codeblock';
import type { Message } from './messagelist';

export const AgentMessageContent: React.FC<{ message: Message }> = ({ message }) => {
  const tabs = [
    { label: 'Summary', content: <p className="text-gray-800">{message.content}</p> },
    ...(message.plan ? [{ label: 'Plan', content: <ul className="space-y-1 list-decimal list-inside text-sm text-gray-700"> {message.plan.map((step, i) => <li key={i}>{step}</li>)} </ul> }] : []),
    ...(message.generatedCode ? [{ label: 'Code', content: <CodeBlock code={message.generatedCode} /> }] : []),
    ...(message.logs ? [{ label: 'Log', content: <pre className="whitespace-pre-wrap rounded-md bg-gray-900 p-3 text-xs text-white">{message.logs}</pre> }] : []),
  ];

  return <Tabs tabs={tabs.filter(Boolean)} />; // Filter out any empty tabs
};