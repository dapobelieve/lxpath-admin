const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'hr',
]);

const DROP_WITH_CONTENT = /<(script|style|iframe|object|embed|svg|math)\b[\s\S]*?<\/\1\s*>/gi;
const SELF_CLOSING_DANGEROUS = /<(script|style|iframe|object|embed|svg|math|img|link|meta|base)\b[^>]*\/?>/gi;
const COMMENTS = /<!--[\s\S]*?-->/g;

/**
 * Renders AI-generated lxNote HTML safely.
 *
 * Every attribute is stripped rather than filtered, which removes event
 * handlers, javascript: URLs and external references as a class instead of
 * relying on a blocklist. Tags outside ALLOWED_TAGS are unwrapped so their
 * text survives; dangerous containers are dropped with their content.
 */
export function sanitizeNoteHtml(html?: string): string {
  if (!html) return '';

  let output = html
    .replace(COMMENTS, '')
    .replace(DROP_WITH_CONTENT, '')
    .replace(SELF_CLOSING_DANGEROUS, '');

  output = output.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g,
    (match, rawTag: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return '';
      return match.startsWith('</') ? `</${tag}>` : `<${tag}>`;
    },
  );

  return output.trim();
}
