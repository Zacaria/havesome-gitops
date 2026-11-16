import React from 'react';
import { createRoot } from 'react-dom/client';

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from './ui/code-block';

// Keep the static examples as the single source of truth and as a no-JS fallback.
for (const container of document.querySelectorAll<HTMLElement>('.codepair .code')) {
  const title = container.querySelector('.code-title')?.textContent || '';
  const code = container.querySelector('code');
  if (!code) continue;
  const value = code.textContent || '';
  const tokens = Array.from(code.childNodes, (node, index) =>
    node.nodeType === Node.TEXT_NODE ? (
      node.textContent
    ) : (
      <span className="code-token" key={index}>
        {node.textContent}
      </span>
    )
  );
  createRoot(container).render(
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>{title}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={value} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>
        <CodeBlockLine>{tokens}</CodeBlockLine>
      </CodeBlockContent>
    </CodeBlock>
  );
}
