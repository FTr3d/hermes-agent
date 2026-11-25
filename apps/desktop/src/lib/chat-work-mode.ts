/**
 * Chat-vs-Work session split (session-scoped, set at create — NOT a mid-session toggle).
 *
 * Chat and Work are separate session types on the SAME profile:
 *  - Chat creates a session with a stripped toolset (`[]` now; later `["web","skills",…]`).
 *  - Work omits `toolsets`, inheriting the profile's full platform toolsets.
 *
 * The canonical gateway already honours a request-supplied `toolsets` at create
 * (gateway/session_policy.py CREATE_FIELDS); this module is the client-side glue.
 * "Continue in Work" opens a NEW Work session seeded with a bounded summary of
 * the Chat session plus its id, so Work can search the full conversation.
 */

export type ChatMessage = { role?: string; content?: string; text?: string }

/** Toolset set a Chat session runs with. Intentionally empty now; add e.g. 'web', 'skills' later. */
export const CHAT_TOOLSETS: readonly string[] = []

const LINK_RE = /https?:\/\/[^\s)\]>"']+/g

/** Chat create params: force the stripped toolset set. */
export function chatCreateParams(
  base: Record<string, unknown>,
  toolsets: readonly string[] = CHAT_TOOLSETS
): Record<string, unknown> {
  return { ...base, toolsets: [...toolsets] }
}

/** Work create params: omit `toolsets` so the profile's full platform set applies. */
export function workCreateParams(base: Record<string, unknown>): Record<string, unknown> {
  const { toolsets: _omit, ...rest } = base

  return rest
}

/**
 * Bounded Chat→Work handoff seed (option A): a short transcript excerpt, any
 * referenced links, and an explicit reference to the source Chat session id so
 * Work can search the full conversation. Deterministic and token-cheap.
 */
export function composeChatToWorkSeed(
  sourceId: string,
  messages: readonly ChatMessage[],
  opts: { maxMessages?: number; maxChars?: number } = {}
): string {
  const maxMessages = opts.maxMessages ?? 6
  const maxChars = opts.maxChars ?? 400
  const rows = (messages ?? []).filter((m): m is ChatMessage => Boolean(m) && typeof m === 'object')
  const textOf = (m: ChatMessage) => String(m.content ?? m.text ?? '')

  const links = [...new Set(rows.flatMap(m => textOf(m).match(LINK_RE) ?? []))].sort()

  const excerpt = rows
    .slice(-maxMessages)
    .map(m => ({ role: m.role ?? 'user', text: textOf(m).trim().replace(/\n/g, ' ') }))
    .filter(x => x.text)
    .map(x => `- ${x.role}: ${x.text.slice(0, maxChars)}`)

  let body = `Continuing from Chat session \`${sourceId}\` (search that session id for the full conversation).\n\nRecent context from the Chat session:\n${excerpt.join('\n') || '(no messages)'}`

  if (links.length) { body += `\n\nReferenced links:\n${links.map(l => `- ${l}`).join('\n')}` }

  return body
}
