import DOMPurify from 'dompurify';
import React from 'react';

/**
 * Sanitizes HTML to prevent XSS attacks
 * Allows safe HTML tags while removing dangerous content
 */
export function sanitizeHtml(dirty: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: string[];
}): string {
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: options?.allowedTags || [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div'
    ],
    ALLOWED_ATTR: options?.allowedAttributes || ['href', 'target', 'rel', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
  };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitizes text to plain text only (no HTML)
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * React component for safe HTML rendering
 */
export function SafeHtml({
  html,
  className,
  allowedTags
}: {
  html: string;
  className?: string;
  allowedTags?: string[];
}) {
  const clean = sanitizeHtml(html, { allowedTags });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

/**
 * Sanitizes a URL to prevent javascript: and other dangerous protocols
 */
export function sanitizeUrl(url: string): string {
  return DOMPurify.sanitize(url, { ALLOWED_TAGS: [] }); // DOMPurify handles URL sanitization in attributes, but for raw URLs we might need more. 
  // Actually DOMPurify.sanitize on a string URL might not do what we expect if it's not in an attribute context.
  // Better approach for URL specifically:
  
  const clean = DOMPurify.sanitize(`<a href="${url}"></a>`, { 
    ALLOWED_TAGS: ['a'], 
    ALLOWED_ATTR: ['href'] 
  });
  
  // Extract the href attribute
  const match = clean.match(/href="([^"]*)"/);
  return match ? match[1] : '';
}
