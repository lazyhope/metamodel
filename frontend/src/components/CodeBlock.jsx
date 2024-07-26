import React, { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { solarizedLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

import { MAX_CODE_LINE_LENGTH } from '@/utils/constants';

SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('python', python);

const CodeBlock = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Function to truncate long lines
    const truncateLine = (line) => {
        return line.length > MAX_CODE_LINE_LENGTH ? line.slice(0, MAX_CODE_LINE_LENGTH) + '...' : line;
    };

    return (
        <div className="relative">
            <Button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 z-10"
                size="sm"
                variant="outline"
            >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy'}
            </Button>
            <SyntaxHighlighter
                language={language}
                style={solarizedLight}
                customStyle={{
                    padding: '1rem',
                    paddingTop: '3rem',  // Make room for the copy button
                    borderRadius: '0.5rem',
                    maxHeight: '500px',
                    overflow: 'auto'
                }}
                showLineNumbers={true}
                wrapLines={true}
                lineProps={{ style: { whiteSpace: 'pre-wrap', overflowWrap: 'break-word' } }}
            >
                {code.split('\n').map(truncateLine).join('\n')}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;