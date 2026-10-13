import type { HostAdapter } from '../protocol/index.js';
export type SiteMessage = { id:string; conversationId:string; text:string; revision:string };
export interface SiteAdapter {
  readonly siteId:string;
  observeMessages(onMessage:(message:SiteMessage)=>void):()=>void;
  host:HostAdapter;
}
export const siteIntegrationStatus = { chromeExtension:'not-implemented', requestInterception:'not-implemented', liveAccounts:'not-connected' } as const;
