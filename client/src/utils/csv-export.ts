/**
 * CSV Export Utilities
 * 
 * Reusable functions for exporting data to CSV format
 */

/**
 * Escape a value for CSV format
 * Handles commas, quotes, and newlines
 */
export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers: string[],
  getRow: (item: T) => unknown[]
): string {
  const headerRow = headers.map(csvEscape).join(",");
  const dataRows = data.map(item => 
    getRow(item).map(csvEscape).join(",")
  );
  
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(
  csvContent: string,
  filename: string
): void {
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(
  customers: Array<{
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    status: string | null;
    customerType: string | null;
    totalInvoiced: number | null;
    totalPaid: number | null;
    balance: number | null;
    createdAt: string | null;
    updatedAt: string | null;
  }>
): void {
  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Status",
    "Type",
    "Total Invoiced (DKK)",
    "Total Paid (DKK)",
    "Balance (DKK)",
    "Created At",
    "Updated At",
  ];

  const csvContent = arrayToCSV(customers, headers, (customer) => [
    customer.id,
    customer.name || "",
    customer.email || "",
    customer.phone || "",
    customer.status || "",
    customer.customerType || "",
    customer.totalInvoiced || 0,
    customer.totalPaid || 0,
    customer.balance || 0,
    customer.createdAt
      ? new Date(customer.createdAt).toLocaleDateString("da-DK")
      : "",
    customer.updatedAt
      ? new Date(customer.updatedAt).toLocaleDateString("da-DK")
      : "",
  ]);

  const filename = `customers-export-${new Date().toISOString().split("T")[0]}.csv`;
  downloadCSV(csvContent, filename);
}

