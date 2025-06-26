import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'python' }) => {
  return (
    <div className="my-2 text-sm">
      <SyntaxHighlighter language={language} style={vscDarkPlus} showLineNumbers>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};