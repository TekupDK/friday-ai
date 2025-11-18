import DOMPurify from 'dompurify';

/**
 * Configuration options for HTML sanitization
 */
export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
}

/**
 * Sanitizes HTML to prevent XSS attacks
 * Allows safe HTML tags while removing dangerous content
 *
 * @param dirty - The potentially unsafe HTML string
 * @param options - Configuration for allowed tags and attributes
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```tsx
 * const clean = sanitizeHtml('<p>Hello</p><script>alert("XSS")</script>');
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(
  dirty: string,
  options: SanitizeOptions = {}
): string {
  const config = {
    ALLOWED_TAGS: options.allowedTags || [
      'b',
      'i',
      'em',
      'strong',
      'a',
      'p',
      'br',
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
    ],
    ALLOWED_ATTR: options.allowedAttributes || ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  };

  return DOMPurify.sanitize(dirty, config) as string;
}

/**
 * Sanitizes text to plain text only (strips all HTML)
 * Use this when you want to display user input as text without any formatting
 *
 * @param dirty - The potentially unsafe string
 * @returns Plain text with all HTML removed
 *
 * @example
 * ```tsx
 * const clean = sanitizeText('<b>Bold</b> text');
 * // Returns: 'Bold text'
 * ```
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * React component for safe HTML rendering
 * Use this when you need to render sanitized HTML in a React component
 *
 * @example
 * ```tsx
 * <SafeHtml
 *   html={userGeneratedContent}
 *   className="prose"
 *   allowedTags={['p', 'b', 'i']}
 * />
 * ```
 */
export function SafeHtml({
  html,
  className,
  allowedTags,
  allowedAttributes,
}: {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
}) {
  const clean = sanitizeHtml(html, { allowedTags, allowedAttributes });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

/**
 * Sanitize a URL to prevent javascript: and data: protocols
 * Use this when rendering user-provided URLs
 *
 * @param url - The potentially unsafe URL
 * @returns Sanitized URL or empty string if unsafe
 *
 * @example
 * ```tsx
 * const safeUrl = sanitizeUrl(userUrl);
 * <a href={safeUrl}>Link</a>
 * ```
 */
export function sanitizeUrl(url: string): string {
  const clean = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  // Additional check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = clean.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  return clean;
}
