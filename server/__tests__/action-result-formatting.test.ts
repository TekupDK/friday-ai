/**
 * Unit Tests: formatActionResultForAI
 * 
 * Tests that action results are formatted cleanly for AI without raw JSON
 */

import { describe, it, expect } from 'vitest';

// Mock the ActionResult type
interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Extract the formatting function (inline copy for testing)
const formatActionResultForAI = (result: ActionResult): string => {
  let content = `[Handling Udført] ${result.success ? "✅ Succes" : "❌ Fejl"}: ${result.message}`;
  
  if (result.data) {
    // Format data based on type instead of raw JSON
    if (Array.isArray(result.data)) {
      content += `\n\nResultater (${result.data.length} elementer):`;
      result.data.slice(0, 3).forEach((item, i) => {
        if (item.summary) content += `\n${i + 1}. ${item.summary}`;
        else if (item.title) content += `\n${i + 1}. ${item.title}`;
        else if (item.subject) content += `\n${i + 1}. ${item.subject}`;
      });
      if (result.data.length > 3) content += `\n... og ${result.data.length - 3} flere`;
    } else if (typeof result.data === 'object') {
      // Extract key info without showing full JSON
      const keys = Object.keys(result.data);
      if (keys.length <= 5) {
        content += `\n\nDetaljer: ${keys.map(k => `${k}: ${result.data[k]}`).join(', ')}`;
      } else {
        content += `\n\nData modtaget (${keys.length} felter)`;
      }
    }
  }
  
  if (result.error) {
    content += `\n\n⚠️ Teknisk fejl: ${result.error}`;
  }
  
  content += `\n\n💡 Præsenter nu resultatet naturligt til brugeren på dansk uden at vise tekniske detaljer eller JSON.`;
  return content;
};

describe('formatActionResultForAI', () => {
  it('should format success result without data', () => {
    const result: ActionResult = {
      success: true,
      message: 'Opgave oprettet',
    };

    const formatted = formatActionResultForAI(result);

    expect(formatted).toContain('✅ Succes');
    expect(formatted).toContain('Opgave oprettet');
    expect(formatted).toContain('💡 Præsenter nu resultatet');
    // Should not contain JSON structure (but the word "JSON" in instruction is OK)
    expect(formatted).not.toContain('{"');
    expect(formatted).not.toContain('":')
  });

  it('should format failure result with error', () => {
    const result: ActionResult = {
      success: false,
      message: 'Kunne ikke oprette faktura',
      error: 'Billy API returned 401 Unauthorized',
    };

    const formatted = formatActionResultForAI(result);

    expect(formatted).toContain('❌ Fejl');
    expect(formatted).toContain('Kunne ikke oprette faktura');
    expect(formatted).toContain('⚠️ Teknisk fejl');
    expect(formatted).toContain('Billy API returned 401 Unauthorized');
    expect(formatted).not.toContain('{');
  });

  it('should format array data with summaries', () => {
    const result: ActionResult = {
      success: true,
      message: 'Fundet 3 leads',
      data: [
        { summary: 'Flytterengøring - København', id: 1 },
        { summary: 'Vinduespudsning - Aarhus', id: 2 },
        { summary: 'Kontorrengøring - Odense', id: 3 },
      ],
    };

    const formatted = formatActionResultForAI(result);

    expect(formatted).toContain('Resultater (3 elementer)');
    expect(formatted).toContain('1. Flytterengøring - København');
    expect(formatted).toContain('2. Vinduespudsning - Aarhus');
    expect(formatted).toContain('3. Kontorrengøring - Odense');
    expect(formatted).not.toContain('"id"');
    expect(formatted).not.toContain('{');
  });

  it('should truncate long arrays', () => {
    const result: ActionResult = {
      success: true,
      message: 'Fundet 10 leads',
      data: Array.from({ length: 10 }, (_, i) => ({
        summary: `Lead ${i + 1}`,
      })),
    };

    const formatted = formatActionResultForAI(result);

    expect(formatted).toContain('Resultater (10 elementer)');
    expect(formatted).toContain('1. Lead 1');
    expect(formatted).toContain('2. Lead 2');
    expect(formatted).toContain('3. Lead 3');
    expect(formatted).toContain('... og 7 flere');
    expect(formatted).not.toContain('Lead 4');
  });

  it('should format calendar events with titles', () => {
    const result: ActionResult = {
      success: true,
      message: 'Du har 2 aftaler i dag',
      data: [
        { 
          title: 'Møde med kunde',
          start: '2025-11-08T10:00:00',
          id: 'evt1' 
        },
        { 
          title: 'Rengøring - Nørrebro',
          start: '2025-11-08T14:00:00',
          id: 'evt2' 
        },
      ],
    };

    const formatted = formatActionResultForAI(result);

    expect(formatted).toContain('Resultater (2 elementer)');
    expect(formatted).toContain('1. Møde med kunde');
    expect(formatted).toContain('2. Rengøring - Nørrebro');
    expect(formatted).not.toContain('"start"');
    expect(formatted).not.toContain('"id"');
  });

  it('should format email threads with subjects', () => {
    const result: ActionResult = {
      success: true,
      message: 'Fundet 2 emails',
      data: [
        { subject: 'Tilbud på flytterengøring', threadId: 't1' },
        { subject: 'Opfølgning på sidste møde', threadId: 't2' },
      ],
    };

    const formatted = formatActionResultForAI(result);

    expect(formatted).toContain('1. Tilbud på flytterengøring');
    expect(formatted).toContain('2. Opfølgning på sidste møde');
    expect(formatted).not.toContain('threadId');
  });

  it('should format simple object data', () => {
    const result: ActionResult = {
      success: true,
      message: 'Faktura oprettet',
      data: {
        invoiceNumber: 'INV-2025-001',
        amount: 5000,
        customer: 'Test Kunde',
        dueDate: '2025-12-08',
      },
    };

    const formatted = formatActionResultForAI(result);

    expect(formatted).toContain('Detaljer:');
    expect(formatted).toContain('invoiceNumber: INV-2025-001');
    expect(formatted).toContain('amount: 5000');
    expect(formatted).not.toContain('{');
    expect(formatted).not.toContain('"');
  });

  it('should summarize large objects', () => {
    const result: ActionResult = {
      success: true,
      message: 'Data hentet',
      data: {
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'value4',
        field5: 'value5',
        field6: 'value6',
        field7: 'value7',
      },
    };

    const formatted = formatActionResultForAI(result);

    expect(formatted).toContain('Data modtaget (7 felter)');
    expect(formatted).not.toContain('field1');
    expect(formatted).not.toContain('field2');
  });

  it('should never output raw JSON structure', () => {
    const testCases: ActionResult[] = [
      { success: true, message: 'Test 1' },
      { success: false, message: 'Test 2', error: 'Some error' },
      { success: true, message: 'Test 3', data: [{ summary: 'Item' }] },
      { success: true, message: 'Test 4', data: { key: 'value' } },
    ];

    testCases.forEach((result, i) => {
      const formatted = formatActionResultForAI(result);
      
      // Should not contain JSON-like structures
      expect(formatted).not.toMatch(/\{\s*"/); // No opening brace with quote
      expect(formatted).not.toMatch(/"\s*:\s*"/); // No key:value pairs
      expect(formatted).not.toMatch(/\[\s*\{/); // No array of objects
      
      // Should contain instruction
      expect(formatted).toContain('💡 Præsenter nu resultatet');
    });
  });

  it('should handle null/undefined data gracefully', () => {
    const result1: ActionResult = {
      success: true,
      message: 'Test',
      data: null,
    };

    const result2: ActionResult = {
      success: true,
      message: 'Test',
      data: undefined,
    };

    const formatted1 = formatActionResultForAI(result1);
    const formatted2 = formatActionResultForAI(result2);

    expect(formatted1).not.toContain('null');
    expect(formatted2).not.toContain('undefined');
    expect(formatted1).toContain('💡 Præsenter');
    expect(formatted2).toContain('💡 Præsenter');
  });
});
