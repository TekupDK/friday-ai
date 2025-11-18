/**
 * CSV Export Utilities Tests
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  arrayToCSV,
  csvEscape,
  downloadCSV,
  exportCustomersToCSV,
  exportLeadsToCSV,
  exportOpportunitiesToCSV,
} from "../csv-export";

// Mock DOM APIs
beforeEach(() => {
  // Mock document.createElement
  global.document.createElement = vi.fn((tagName: string) => {
    const element = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
    } as any;
    return element;
  });

  // Mock document.body.appendChild
  global.document.body.appendChild = vi.fn();
  global.document.body.removeChild = vi.fn();

  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("csvEscape", () => {
  it("should escape values with commas", () => {
    expect(csvEscape("test,value")).toBe('"test,value"');
  });

  it("should escape values with quotes", () => {
    expect(csvEscape('test"value')).toBe('"test""value"');
  });

  it("should escape values with newlines", () => {
    expect(csvEscape("test\nvalue")).toBe('"test\nvalue"');
  });

  it("should not escape simple values", () => {
    expect(csvEscape("test")).toBe("test");
  });

  it("should handle null and undefined", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });
});

describe("arrayToCSV", () => {
  it("should convert array to CSV", () => {
    const data = [
      { id: 1, name: "Test" },
      { id: 2, name: "Value" },
    ];
    const headers = ["ID", "Name"];
    const getRow = (item: typeof data[0]) => [item.id, item.name];

    const result = arrayToCSV(data, headers, getRow);
    expect(result).toBe("ID,Name\n1,Test\n2,Value");
  });

  it("should handle empty arrays", () => {
    const result = arrayToCSV([], ["ID"], () => []);
    expect(result).toBe("ID");
  });
});

describe("exportCustomersToCSV", () => {
  it("should export customers to CSV", () => {
    const customers = [
      {
        id: 1,
        name: "Test Customer",
        email: "test@example.com",
        phone: "12345678",
        status: "active",
        customerType: "private",
        totalInvoiced: 1000,
        totalPaid: 800,
        balance: 200,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
    ];

    exportCustomersToCSV(customers);

    // Verify downloadCSV was called (via DOM manipulation)
    expect(global.document.createElement).toHaveBeenCalledWith("a");
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.document.body.appendChild).toHaveBeenCalled();
    expect(global.document.body.removeChild).toHaveBeenCalled();
  });
});

describe("exportLeadsToCSV", () => {
  it("should export leads to CSV", () => {
    const leads = [
      {
        id: 1,
        name: "Test Lead",
        email: "lead@example.com",
        phone: "12345678",
        company: "Test Company",
        source: "website",
        status: "new",
        notes: "Test notes",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
    ];

    exportLeadsToCSV(leads);

    // Verify downloadCSV was called (via DOM manipulation)
    expect(global.document.createElement).toHaveBeenCalledWith("a");
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.document.body.appendChild).toHaveBeenCalled();
    expect(global.document.body.removeChild).toHaveBeenCalled();
  });
});

describe("exportOpportunitiesToCSV", () => {
  it("should export opportunities to CSV", () => {
    const opportunities = [
      {
        id: 1,
        title: "Test Opportunity",
        customerName: "Test Customer",
        stage: "qualified",
        value: 50000,
        probability: 75,
        expectedCloseDate: "2025-06-01T00:00:00Z",
        description: "Test description",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
    ];

    exportOpportunitiesToCSV(opportunities);

    // Verify downloadCSV was called (via DOM manipulation)
    expect(global.document.createElement).toHaveBeenCalledWith("a");
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.document.body.appendChild).toHaveBeenCalled();
    expect(global.document.body.removeChild).toHaveBeenCalled();
  });
});

