export interface Utils {
  formatDate(date: Date): string | undefined;
  parseDate(dateString: string): Date;
}

export const utils: Utils = {
  formatDate(date: Date): string | undefined {
    if (!date) return undefined;
    return date.toISOString().split("T")[0];
  },

  parseDate(dateString: string): Date {
    return new Date(dateString);
  },
};

/**
 * Generate a unique hash/id for new documents.
 * Similar to Frappe's `frappe.get_new_docid` or `new-xxxxx`
 *
 * @param prefix Optional prefix (default "new")
 * @returns string unique hash/id
 */
export function generateHash(prefix = "new"): string {
  const randomStr = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `${prefix}-${timestamp}-${randomStr}`;
}
