import React from 'react';
import { createRoot } from 'react-dom/client';
import './code-blocks.css';
import { Button } from './ui/button';

const actions = document.querySelector<HTMLElement>('.lab-actions');
if (actions) {
  const render = (value: number, message: string) => {
    document.getElementById('actual')!.textContent = String(value);
    document.getElementById('status')!.textContent = message;
  };
  createRoot(actions).render(<>
    <Button id="drift" type="button" onClick={() => render(2, 'Dérive · 2 observés, 3 souhaités.')}>Simuler une dérive</Button>
    <Button id="reconcile" type="button" onClick={() => render(3, 'Réconcilié · le modèle rejoint l’intention.')}>Réconcilier</Button>
    <Button id="reset" type="button" onClick={() => render(3, 'Aligné · l’état observé correspond à l’intention.')}>Recommencer</Button>
  </>);
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
