import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeText, sanitizeUrl } from '../sanitize';

describe('Sanitization Utils', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = '<p>Hello</p><script>alert("XSS")</script>';
      const clean = sanitizeHtml(dirty);

      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toContain('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
      const dirty = '<a href="#" onclick="alert(1)">Click</a>';
      const clean = sanitizeHtml(dirty);

      expect(clean).not.toContain('onclick');
      expect(clean).toContain('<a');
      expect(clean).toContain('href');
    });

    it('should remove javascript: URLs', () => {
      const dirty = '<a href="javascript:alert(1)">Click</a>';
      const clean = sanitizeHtml(dirty);

      expect(clean).not.toContain('javascript:');
    });

    it('should preserve safe HTML tags', () => {
      const dirty = '<p>Paragraph</p><b>Bold</b><i>Italic</i>';
      const clean = sanitizeHtml(dirty);

      expect(clean).toContain('<p>Paragraph</p>');
      expect(clean).toContain('<b>Bold</b>');
      expect(clean).toContain('<i>Italic</i>');
    });

    it('should preserve safe links', () => {
      const dirty = '<a href="https://example.com" target="_blank">Link</a>';
      const clean = sanitizeHtml(dirty);

      expect(clean).toContain('href="https://example.com"');
      expect(clean).toContain('target="_blank"');
    });

    it('should remove data: URLs', () => {
      const dirty = '<img src="data:text/html,<script>alert(1)</script>">';
      const clean = sanitizeHtml(dirty);

      expect(clean).not.toContain('data:');
      expect(clean).not.toContain('script');
    });

    it('should allow custom tags', () => {
      const dirty = '<div>Div</div><span>Span</span>';
      const clean = sanitizeHtml(dirty, {
        allowedTags: ['div', 'span'],
      });

      expect(clean).toContain('<div>Div</div>');
      expect(clean).toContain('<span>Span</span>');
    });

    it('should remove iframe tags', () => {
      const dirty = '<iframe src="evil.com"></iframe>';
      const clean = sanitizeHtml(dirty);

      expect(clean).not.toContain('<iframe');
      expect(clean).not.toContain('evil.com');
    });

    it('should handle empty strings', () => {
      const clean = sanitizeHtml('');
      expect(clean).toBe('');
    });

    it('should handle strings without HTML', () => {
      const clean = sanitizeHtml('Plain text');
      expect(clean).toBe('Plain text');
    });
  });

  describe('sanitizeText', () => {
    it('should strip all HTML tags', () => {
      const dirty = '<b>Bold</b> text';
      const clean = sanitizeText(dirty);

      expect(clean).toBe('Bold text');
      expect(clean).not.toContain('<b>');
    });

    it('should remove script tags and content', () => {
      const dirty = 'Text <script>alert("XSS")</script> more text';
      const clean = sanitizeText(dirty);

      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toContain('Text');
      expect(clean).toContain('more text');
    });

    it('should handle nested HTML', () => {
      const dirty = '<div><p><b>Nested</b></p></div>';
      const clean = sanitizeText(dirty);

      expect(clean).toBe('Nested');
    });

    it('should preserve plain text', () => {
      const dirty = 'Just plain text';
      const clean = sanitizeText(dirty);

      expect(clean).toBe('Just plain text');
    });

    it('should handle special characters', () => {
      const dirty = 'Text with & < > " characters';
      const clean = sanitizeText(dirty);

      // DOMPurify correctly escapes & to &amp; to prevent double-escaping issues
      expect(clean).toBe('Text with &amp; &lt; &gt; " characters');
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

      expect(clean).toBe('');
    });

    it('should block data: protocol', () => {
      const url = 'data:text/html,<script>alert(1)</script>';
      const clean = sanitizeUrl(url);

      expect(clean).toBe('');
    });

    it('should block vbscript: protocol', () => {
      const url = 'vbscript:msgbox("XSS")';
      const clean = sanitizeUrl(url);

      expect(clean).toBe('');
    });

    it('should block file: protocol', () => {
      const url = 'file:///etc/passwd';
      const clean = sanitizeUrl(url);

      expect(clean).toBe('');
    });

    it('should handle relative URLs', () => {
      const url = '/path/to/page';
      const clean = sanitizeUrl(url);

      expect(clean).toBe('/path/to/page');
    });

    it('should handle case-insensitive protocols', () => {
      const url = 'JAVASCRIPT:alert(1)';
      const clean = sanitizeUrl(url);

      expect(clean).toBe('');
    });
  });
});
