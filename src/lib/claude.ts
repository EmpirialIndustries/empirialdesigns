// Claude API utility — all calls go through the Vite proxy at /api/claude
// which forwards to https://api.anthropic.com/v1/messages

export const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
export const LS_API_KEY = 'empirial_claude_key';

export function getSavedApiKey(): string {
  return localStorage.getItem(LS_API_KEY) || '';
}

export function saveApiKey(key: string) {
  localStorage.setItem(LS_API_KEY, key.trim());
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are an expert web developer. When generating or editing code, you MUST output every file wrapped in XML tags:

<file path="/App.js">
// full file contents here
</file>

<file path="/styles.css">
/* full file contents here */
</file>

Rules:
- Always produce complete, working files — never truncated or partial
- Use React with functional components and hooks
- Use inline styles or a single styles.css file — no Tailwind, no external CSS frameworks
- Make the UI beautiful: clean layout, good typography, good use of color
- Every response must include ALL files needed to run the app, even unchanged ones
- If the user asks to edit something specific, include the full edited file AND all other files unchanged
- Default entry point is /App.js which exports a default React component`;

export async function callClaude(
  apiKey: string,
  messages: ClaudeMessage[],
  userSystemExtra?: string
): Promise<string> {
  const system = userSystemExtra
    ? `${SYSTEM_PROMPT}\n\n${userSystemExtra}`
    : SYSTEM_PROMPT;

  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as any)?.error?.message || `Claude API error: ${response.status}`
    );
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? '';
}

/**
 * Parse <file path="...">...</file> blocks out of a Claude response.
 * Returns a Sandpack-compatible VFS: { '/App.js': '...', '/styles.css': '...' }
 */
export function parseFiles(response: string): Record<string, string> {
  const files: Record<string, string> = {};
  const regex = /<file\s+path="([^"]+)">([\s\S]*?)<\/file>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(response)) !== null) {
    const filePath = match[1].startsWith('/') ? match[1] : `/${match[1]}`;
    files[filePath] = match[2].trim();
  }

  return files;
}

/**
 * Serialize current VFS into a string to give as context to Claude
 */
export function serializeVfs(files: Record<string, string>): string {
  return Object.entries(files)
    .map(([path, content]) => `<file path="${path}">\n${content}\n</file>`)
    .join('\n\n');
}
