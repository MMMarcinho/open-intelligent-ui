/// <reference types="node" />
import { readFileSync } from 'node:fs';
import type { Context } from '@deepseek-ai/cordis';
import type {} from '@deepseek-ai/dsh-system-prompt';

export const inject = ['systemPrompt'];

/** The prompt is installed through dsh's actual system-prompt registry. */
export function apply(ctx: Context): void {
  const text = readFileSync(new URL('../prompt.txt', import.meta.url), 'utf8');
  ctx.systemPrompt.section({
    name: 'open-intelligent-ui:v0.1',
    order: ctx.systemPrompt.getSectionOrder('WEB_SURFACE') + 1,
    text,
    interpolate: false,
  });
}
