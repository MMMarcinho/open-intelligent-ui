import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Button, MarkdownText, type MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives';
import type { Context } from '@deepseek-ai/cordis';
import type { AssistantBlock, ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client';
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client';
import { Runtime } from '../../../protocol/index.js';
import { UIRenderer } from '../../../ui/renderer/Renderer.js';
import { splitReply } from './segments.js';
import styles from '../../../ui/styles.css';

export const inject = ['slots', 'configForms'];
type Mode = { enabled: boolean };
const namespace = 'open-intelligent-ui';
function useMode(form: ConfigForm<Mode>) {
  const subscribe = useCallback((listener: () => void) => form.subscribe(listener), [form]);
  const snapshot = useCallback(() => form.getSnapshot(), [form]);
  return useSyncExternalStore(subscribe, snapshot);
}

const labels: MarkdownLabels = {
  code: { copyLabel: 'Copy', copiedLabel: 'Copied' },
  footnotes: 'Footnotes',
};
const shadowStyles = `${styles}\n:host{display:block;min-width:0}.iui-theme{min-height:0;background:transparent}.iui-root{white-space:normal}`;

type TargetChange = (index: number, target: HTMLElement | null) => void;

function UiTarget({ index, onTarget }: { index: number; onTarget: TargetChange }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = shadowStyles;
    const target = document.createElement('div');
    shadow.append(style, target);
    onTarget(index, target);
    return () => {
      onTarget(index, null);
      style.remove();
      target.remove();
    };
  }, [index, onTarget]);
  return <div ref={ref} data-iui-dsh-root="" />;
}

function useDshThemeMode(): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>(() =>
    document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light');
  useLayoutEffect(() => {
    const observer = new MutationObserver(() =>
      setMode(document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light'));
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
    return () => observer.disconnect();
  }, []);
  return mode;
}

function TextBlock({ text, messageId, streaming, enabled }: { text: string; messageId: string; streaming: boolean; enabled: boolean }) {
  // Keep the original message in the host Markdown path while the mode is off.
  if (!enabled) return <MarkdownText text={text} streaming={streaming} labels={labels} />;
  return <IntelligentTextBlock text={text} messageId={messageId} streaming={streaming} />;
}

function IntelligentTextBlock({ text, messageId, streaming }: { text: string; messageId: string; streaming: boolean }) {
  const candidate = useMemo(() => {
    try { return splitReply(text, messageId); } catch { return null; }
  }, [text, messageId]);
  const lastValid = useRef<{ source: string; parsed: NonNullable<typeof candidate> } | null>(null);
  if (candidate) lastValid.current = { source: text, parsed: candidate };
  const parsed = candidate ?? (streaming && lastValid.current && text.startsWith(lastValid.current.source)
    ? lastValid.current.parsed : null);
  const runtime = useRef<Runtime | null>(null);
  const [targets, setTargets] = useState<Record<number, HTMLElement>>({});
  const mode = useDshThemeMode();
  const onTarget = useCallback<TargetChange>((index, target) => {
    setTargets(previous => {
      if (previous[index] === target || (!target && !(index in previous))) return previous;
      const next = { ...previous };
      if (target) next[index] = target;
      else delete next[index];
      return next;
    });
  }, []);

  if (!parsed) return <MarkdownText text={text} streaming={streaming} labels={labels} />;
  if (!runtime.current || runtime.current.document.messageId !== messageId) {
    runtime.current = new Runtime(parsed.document); // No chat, network, or script host actions.
  } else {
    runtime.current.update(parsed.document); // Preserves DIL.useState through stream revisions.
  }
  const count = parsed.document.children.length;
  const ready = Array.from({ length: count }, (_, index) => targets[index]).every(Boolean);
  return <>
    {parsed.segments.map((segment, index) => segment.kind === 'markdown'
      ? <MarkdownText key={`md-${index}`} text={segment.text} streaming={streaming} labels={labels} />
      : <UiTarget key={`ui-${segment.index}`} index={segment.index} onTarget={onTarget} />)}
    {ready && <UIRenderer runtime={runtime.current} targets={Array.from({ length: count }, (_, index) => targets[index])} themeMode={mode} />}
  </>;
}

function AssistantNode({ node, groupPart, renderMessageImages, enabled }: ChatNodeViewProps<'assistant-step'> & Mode) {
  const { blocks, status } = node.data;
  const streaming = status === 'running';
  const showReasoning = groupPart !== 'response';
  const showResponse = groupPart !== 'reasoning';
  return <div data-iui-dsh-assistant="" data-streaming={streaming || undefined}>
    {blocks.map((block: AssistantBlock, index: number) => {
      if (block.kind === 'reasoning') return showReasoning && block.text.trim()
        ? <details key={index} data-iui-dsh-reasoning=""><summary>Thinking</summary><MarkdownText text={block.text} streaming={streaming} labels={labels} /></details>
        : null;
      if (!showResponse) return null;
      if (block.kind === 'text') return <TextBlock key={index} text={block.text} messageId={`${node.key}:${index}`} streaming={streaming} enabled={enabled} />;
      if (block.kind === 'image') return <React.Fragment key={index}>{renderMessageImages({ images: [{ attachment: block.attachment }], align: 'start' })}</React.Fragment>;
      if (block.kind === 'tool-call') return null; // Tool lifecycle has its own dsh node.
      return <pre key={index}>Unsupported assistant content block</pre>;
    })}
    {status === 'interrupted' && showResponse && <span data-iui-dsh-interrupted="">Stopped</span>}
  </div>;
}

function ModeButton({ form }: { form: ConfigForm<Mode> }) {
  const state = useMode(form);
  const enabled = state.status === 'ready' && state.value?.enabled === true;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const available = state.status === 'ready' && state.writable && state.mode === 'host';
  const toggle = async () => {
    if (!available || pending) return;
    setPending(true);
    setError(false);
    try { if (!await form.set('enabled', !enabled)) setError(true); }
    catch { setError(true); }
    finally { setPending(false); }
  };
  return <Button type="button" variant="toolbar" size="sm" data-iui-dsh-toggle=""
    aria-label="智能 UI" aria-pressed={enabled} title={error ? '智能 UI 设置保存失败' : enabled ? '智能 UI 已开启' : '智能 UI 已关闭'}
    disabled={!available || pending} onClick={() => { void toggle(); }}
    style={enabled ? { background: 'var(--dsw-alias-state-business-tertiary)', color: 'var(--dsw-alias-state-business-primary)' } : undefined}>
    智能 UI
  </Button>;
}

/** Register after ui-chat. Reusing its keyed slot selects this renderer. */
export function apply(ctx: Context): void {
  const form = ctx.configForms.get<Mode>(namespace);
  function AssistantWithMode(props: ChatNodeViewProps<'assistant-step'>) {
    const state = useMode(form);
    return <AssistantNode {...props} enabled={state.status === 'ready' && state.value?.enabled === true} />;
  }
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'assistant-step',
    locale: 'chat',
  }, AssistantWithMode));
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left', id: 'open-intelligent-ui', order: 30,
  }, () => <ModeButton form={form} />));
}
