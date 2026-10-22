import rules from '../../docs/prompts/recommended.en.txt';
import { LayoutEnvelope } from '../../services/intelligent-layout/envelope.js';
import { installDeepSeekSendBridge, type PageWindow } from '../../services/adapters/deepseek-send-bridge.js';

// Declarative MAIN-world entry at document_start. No extension APIs or credential access.
installDeepSeekSendBridge(window as PageWindow, new LayoutEnvelope(rules));
