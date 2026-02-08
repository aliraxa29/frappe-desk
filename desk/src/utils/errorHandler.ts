/**
 * Error handling utilities for Frappe API responses
 */

export interface FrappeErrorResponse {
  exception?: string;
  exc_type?: string;
  _exc_source?: string;
  exc?: string[];
  _server_messages?: string[];
  message?: string;
}

/**
 * Extract human-readable error message from Frappe error response
 * Handles various error formats returned by Frappe backend
 */
export function getErrorMessage(error: any): string {
  if (!error) {
    return "An unknown error occurred";
  }

  // If it's a string, return it directly
  if (typeof error === "string") {
    return error;
  }

  // Check for exception message (e.g., from frappe.throw)
  if (error.exception) {
    // Extract the actual error message from the exception string
    // Format: "ClassName: Error message" → "Error message"
    const exceptionStr = String(error.exception);
    const colonIndex = exceptionStr.lastIndexOf(":");
    if (colonIndex !== -1) {
      return exceptionStr.substring(colonIndex + 1).trim();
    }
    return exceptionStr;
  }

  // Check for server messages (formatted error responses)
  if (error._server_messages && Array.isArray(error._server_messages)) {
    for (const msgStr of error._server_messages) {
      try {
        const msg = JSON.parse(msgStr);
        if (msg && msg.message) {
          return msg.message;
        }
      } catch (e) {
        // If parsing fails, try using the string directly
        if (msgStr && typeof msgStr === "string") {
          return msgStr;
        }
      }
    }
  }

  // Check for message property
  if (error.message) {
    return String(error.message);
  }

  // Check for response property (from fetch errors)
  if (error.response) {
    if (typeof error.response === "string") {
      return error.response;
    }
    if (error.response.data) {
      return getErrorMessage(error.response.data);
    }
  }

  // Check for status (HTTP error)
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    const statusText =
      error.statusText || error.statusMessage || "Server Error";

    if (status === 500) {
      return "Server error occurred. Please try again or contact support.";
    } else if (status === 403) {
      return "You do not have permission to perform this action.";
    } else if (status === 404) {
      return "The requested resource was not found.";
    }
    return `HTTP Error: ${status} - ${statusText}`;
  }

  // Fallback to string representation
  return String(error);
}

/**
 * Format error for display in a user-friendly way
 * Removes technical details and cleans up formatting
 */
export function formatErrorMessage(errorText: string): string {
  // Remove common Frappe exception prefixes
  let formatted = errorText
    .replace(/^frappe\..*?\..*?Error:\s*/i, "")
    .replace(/^[A-Za-z]+Error:\s*/i, "")
    .trim();

  // Handle case where error is wrapped in quotes or has extra escaping
  if (formatted.startsWith('"') && formatted.endsWith('"')) {
    formatted = formatted.slice(1, -1);
  }

  // Decode HTML entities if present
  formatted = formatted
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  return formatted;
}

/**
 * Get detailed error information for logging
 */
export function getDetailedError(error: any): {
  message: string;
  type?: string;
  source?: string;
} {
  return {
    message: getErrorMessage(error),
    type: error.exc_type,
    source: error._exc_source,
  };
}
