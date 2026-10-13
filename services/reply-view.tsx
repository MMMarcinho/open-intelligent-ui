import React from 'react';
import { createRoot } from 'react-dom/client';
import { Runtime, type Document as ProtocolDocument } from '../protocol/index.js';
import { ThemeProvider } from '../ui/theme/index.js';
import { UIRenderer } from '../ui/renderer/Renderer.js';
import type { CreateReplyView } from './reply-coordinator.js';

/** One React root and one protocol runtime for the life of a mounted reply. */
export function createReactReplyView(styles: string): CreateReplyView {
  return (host: HTMLElement, document: ProtocolDocument) => {
    const shadow = host.attachShadow({ mode: 'open' });
    const css = `${styles}\n:host{display:block;min-width:0}.iui-theme{min-height:0}`;
    const mount = host.ownerDocument.createElement('div');
    const Sheet = host.ownerDocument.defaultView?.CSSStyleSheet;
    let adopted = false;
    if (Sheet && 'adoptedStyleSheets' in shadow && typeof Sheet.prototype.replaceSync === 'function') {
      try {
        const sheet = new Sheet();
        sheet.replaceSync(css);
        shadow.adoptedStyleSheets = [sheet];
        adopted = true;
      } catch { /* Fall back to a regular style node. */ }
    }
    if (!adopted) {
      const style = host.ownerDocument.createElement('style');
      style.textContent = css;
      shadow.append(style);
    }
    shadow.append(mount);
    const root = createRoot(mount);
    const runtime = new Runtime(document); // No host actions or arbitrary AppBlock authorization in a chat page.
    const render = () => root.render(<ThemeProvider name="studio" mode="light"><UIRenderer runtime={runtime} /></ThemeProvider>);
    render();
    return {
      update(next: ProtocolDocument) { runtime.update(next); render(); },
      dispose() { root.unmount(); },
    };
  };
}
