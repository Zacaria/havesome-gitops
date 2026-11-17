import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import './code-blocks.css';
import { Button } from './ui/button';

// Replace only the controls; the story and its state remain owned by lab.js.
const actions = document.querySelector<HTMLElement>('.lab-actions');
if (actions) {
  flushSync(() => createRoot(actions).render(<>
    <Button id="play" type="button">Jouer le scénario <span aria-hidden="true">▶</span></Button>
    <Button id="pause" type="button" disabled>Mettre en pause</Button>
    <Button id="reset" type="button">Recommencer</Button>
  </>));
  await import('../lab.js');
}

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
