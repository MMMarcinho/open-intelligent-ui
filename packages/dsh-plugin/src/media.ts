import { fileMediaUrl, parseFileAddress, resolveWorkspacePath } from '@deepseek-ai/dsh-util-workspace-path';
import type { AssistantBlock } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { MessageImageLoader } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { HostAdapter, Value } from '../../../protocol/types.js';

type ImageRef = Extract<AssistantBlock, { kind: 'image' }>['attachment'];
type MediaContext = {
  base: string;
  cwd?: string;
  messageId: string;
  attachments: readonly ImageRef[];
  loadImage: MessageImageLoader;
};

const rasterFile = /\.(?:png|jpe?g|webp|gif)(?:[?#]|$)/iu;
const invalidPath = /^[\\/]{2}|[\u0000-\u001f\u007f]/u;
const scheme = /^[a-z][a-z0-9+.-]*:/iu;
const drive = /^[a-z]:[\\/]/iu;

function imageLabel(query: string): string {
  return query.split(/[?#]/u)[0].split(/[\\/]/u).at(-1)?.slice(0, 240) || '图片';
}
function resolved(src: string, alt: string, attachment?: ImageRef) {
  const value: Record<string, Value> = { src, alt };
  if (attachment) {
    value.nativeAttachment = true;
    if (typeof attachment.width === 'number' && Number.isFinite(attachment.width)) value.width = attachment.width;
    if (typeof attachment.height === 'number' && Number.isFinite(attachment.height)) value.height = attachment.height;
  }
  return { ok: true, value };
}

/** Only explicit image locations and references already present in this assistant node. */
export function createDshMediaAdapter({ base, cwd, messageId, attachments, loadImage }: MediaContext): HostAdapter {
  const currentImages = new Map(attachments.map(attachment => [String(attachment.attachmentId), attachment]));
  return { async resolveResource(request) {
    if (request.kind !== 'AsyncImage' || request.messageId !== messageId || typeof request.query !== 'string' || !request.query.trim())
      return { ok: false, message: '图片需要当前消息中的明确路径或引用' };
    const query = request.query.trim();
    if (query.startsWith('attachment:')) {
      const attachment = currentImages.get(query.slice('attachment:'.length));
      if (!attachment) return { ok: false, message: '当前消息没有该图片附件' };
      try {
        const src = await loadImage(attachment); // DSH's session-authorized, lifetime-scoped loader.
        return resolved(src, String(attachment.name || '图片附件').slice(0, 240), attachment);
      } catch { return { ok: false, message: '图片附件不可用' }; }
    }
    if (/^https?:\/\//iu.test(query)) {
      try {
        const url = new URL(query);
        if (!url.username && !url.password) return resolved(url.href, imageLabel(query));
      } catch { /* Invalid URLs remain unavailable. */ }
      return { ok: false, message: '图片 URL 无效' };
    }
    let path = query;
    if (query.startsWith('dsh-resource:')) {
      const address = parseFileAddress(query);
      // A session-scoped address cannot be checked here: this slot supplies cwd, not sessionId.
      if (!address || address.scope !== 'absolute') return { ok: false, message: '图片文件引用无法在当前会话验证' };
      path = address.path;
    } else {
      try { path = decodeURIComponent(query.split(/[?#]/u)[0] || ''); }
      catch { return { ok: false, message: '图片路径编码无效' }; }
    }
    if (!path || invalidPath.test(path) || (scheme.test(path) && !drive.test(path)) || !rasterFile.test(path))
      return { ok: false, message: '请提供 PNG、JPEG、WebP 或 GIF 文件路径；未接入图片搜索' };
    const src = fileMediaUrl(base, resolveWorkspacePath(cwd, path));
    return src ? resolved(src, imageLabel(path)) : { ok: false, message: '图片路径无法解析，或会话工作目录尚未就绪' };
  } };
}
