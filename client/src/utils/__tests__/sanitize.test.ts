import { describe, expect, it } from 'vitest';
import { sanitizeHtml, sanitizeText, sanitizeUrl } from '../sanitize';

describe('Sanitization Utils', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = '<p>Hello</p><script>alert("XSS")</script>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
      const dirty = '<a href="#" onclick="alert(1)">Click</a>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('onclick');
    });

    it('should strip all HTML for text sanitization', () => {
      const dirty = '<b>Bold</b> text';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('Bold text');
    });

    it('should preserve allowed tags', () => {
      const dirty = '<b>Bold</b> and <i>Italic</i>';
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe('<b>Bold</b> and <i>Italic</i>');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow safe HTTP URLs', () => {
      const url = 'https://example.com';
      const clean = sanitizeUrl(url);
      expect(clean).toBe('https://example.com');
    });

    it('should block javascript: protocol', () => {
      const url = 'javascript:alert(1)';
      const clean = sanitizeUrl(url);
      // DOMPurify might return the unsafe URL but sanitized, or empty string depending on config.
      // The implementation uses DOMPurify via an anchor tag, which should strip unsafe protocols.
      expect(clean).not.toContain('javascript:');
    });
  });
});
