/// <reference types="node" />
import { readFileSync } from 'node:fs';
import type { Context } from '@deepseek-ai/cordis';
import type { Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type {} from '@deepseek-ai/dsh-system-prompt';

export const inject = ['systemPrompt'];
export interface Config { enabled: Volatile<boolean> }
export const Config = z.object({ enabled: z.boolean().default(false).volatile() });

/** The prompt is installed through dsh's actual system-prompt registry. */
export function apply(ctx: Context, config: Config): void {
  const text = readFileSync(new URL('../prompt.txt', import.meta.url), 'utf8');
  ctx.systemPrompt.section({
    name: 'open-intelligent-ui:v0.1',
    order: ctx.systemPrompt.getSectionOrder('WEB_SURFACE') + 1,
    // A volatile setting is read for every assembly, including the first turn after a toggle.
    text: () => config.enabled.get() ? text : '',
    interpolate: false,
  });
}
