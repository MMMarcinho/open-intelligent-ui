/** Anchors verified against the deployed DeepSeek composer, 2026-10-17. */
export type Composer = { editor: HTMLTextAreaElement; toolbar: HTMLElement; search: HTMLElement; send: HTMLElement };
export type SendTarget = { editor: HTMLTextAreaElement; send: HTMLElement; operation: 'send' | 'edit' };
const nativeToggleClasses = (reference: HTMLElement) => [...reference.classList]
  .filter(name => name !== 'ds-toggle-button--selected' && name !== 'ds-toggle-button--disabled');
export const deepSeekComposer = {
  createLayoutToggle(document: Document, reference: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.iuiLayoutToggle = '';
    button.className = nativeToggleClasses(reference).join(' ');
    // A native inactive DIV supplies inherited typography without copying a selected button's colors.
    const measure = document.createElement(reference.tagName);
    measure.className = button.className; measure.setAttribute('aria-hidden', 'true');
    measure.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    reference.after(measure);
    const typography = document.defaultView!.getComputedStyle(measure);
    for (const key of ['font-family','font-size','font-weight','line-height','letter-spacing']) button.style.setProperty(key, typography.getPropertyValue(key));
    measure.remove();
    const referenceIcon = reference.querySelector<HTMLElement>('.ds-icon');
    const icon = document.createElement(referenceIcon?.tagName ?? 'span');
    icon.className = referenceIcon?.className ?? 'ds-icon'; icon.setAttribute('aria-hidden','true');
    if (referenceIcon) {
      const size = document.defaultView!.getComputedStyle(referenceIcon);
      for (const key of ['font-size','width','height','line-height','flex-shrink']) icon.style.setProperty(key,size.getPropertyValue(key));
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    for (const [key,value] of Object.entries({viewBox:'0 0 24 24',width:'1em',height:'1em',fill:'none',stroke:'currentColor','stroke-width':'1.5','stroke-linecap':'round','stroke-linejoin':'round',focusable:'false'})) svg.setAttribute(key,value);
    const outline = document.createElementNS(svg.namespaceURI,'rect');
    for (const [key,value] of Object.entries({x:'3',y:'3',width:'18',height:'18',rx:'3'})) outline.setAttribute(key,value);
    const lines = document.createElementNS(svg.namespaceURI,'path'); lines.setAttribute('d','M10 3v18M10 11h11');
    svg.append(outline,lines); icon.append(svg);
    const label = document.createElement('span'); label.textContent='智能 UI'; button.append(icon,label);
    return button;
  },
  styleLayoutToggle(button: HTMLButtonElement, reference: HTMLElement, enabled: boolean): void {
    const classes = nativeToggleClasses(reference);
    if (enabled) classes.push('ds-toggle-button--selected');
    if (button.disabled) classes.push('ds-toggle-button--disabled');
    const next = classes.join(' '); if (button.className !== next) button.className=next;
  },
  find(document: Document): Composer | null {
    for (const editor of document.querySelectorAll<HTMLTextAreaElement>('textarea')) {
      if (!/DeepSeek/.test(editor.placeholder)) continue;
      let root: HTMLElement | null = editor.parentElement;
      for (let depth = 0; root && depth < 5; depth++, root = root.parentElement) {
        const toggles = [...root.querySelectorAll<HTMLElement>('.ds-toggle-button')];
        const thinking = toggles.find(e => /^(深度思考|DeepThink)(\s|$|\()/.test(e.textContent?.trim() ?? ''));
        const search = toggles.find(e => /^(智能搜索|联网搜索|Search)$/.test(e.textContent?.trim() ?? ''));
        const send = root.querySelector<HTMLElement>('[role="button"].ds-button--primary.ds-button--circle');
        if (thinking && search && send && search.parentElement === thinking.parentElement) {
          return { editor, toolbar: search.parentElement!, search, send };
        }
      }
    }
    return null;
  },
  targets(document: Document, composer: Composer | null): SendTarget[] {
    const targets: SendTarget[] = composer ? [{...composer, operation: 'send'}] : [];
    // Deployed edit component: textareaDomProps.name='user query', Cancel + Send footer buttons.
    for (const editor of document.querySelectorAll<HTMLTextAreaElement>('textarea[name="user query"]')) {
      let root: HTMLElement | null = editor.parentElement;
      for (let depth = 0; root && depth < 5; depth++, root = root.parentElement) {
        const buttons = [...root.querySelectorAll<HTMLElement>('[role="button"].ds-button, button.ds-button')];
        const cancel = buttons.find(e => /^(取消|Cancel)$/.test(e.textContent?.trim() ?? ''));
        const send = buttons.find(e => /^(发送|Send)$/.test(e.textContent?.trim() ?? ''));
        if (cancel && send && root.querySelectorAll('textarea').length === 1) { targets.push({editor, send, operation:'edit'}); break; }
      }
    }
    return targets;
  },
  prompt(target: SendTarget): string { return target.operation === 'send' ? target.editor.value.trim() : target.editor.value; },
  canSend(composer: Pick<Composer,'send'>): boolean {
    return !composer.send.hasAttribute('disabled') && !composer.send.classList.contains('ds-button--disabled') && composer.send.getAttribute('aria-disabled') !== 'true';
  },
  userBodies(document: Document): HTMLElement[] {
    return [...document.querySelectorAll<HTMLElement>('.ds-message')]
      .filter(message => !message.querySelector('.ds-assistant-message-main-content'))
      .flatMap(message => [...message.querySelectorAll<HTMLElement>('.ds-collapsible-text')]);
  },
  text(body: HTMLElement): string {
    // The observed user body uses text nodes and <br>. Preserve every character for provenance checks.
    const read = (node: Node): string => node.nodeType === 3 ? node.textContent ?? '' :
      node.nodeName === 'BR' ? '\n' : [...node.childNodes].map(read).join('');
    return read(body);
  },
};
