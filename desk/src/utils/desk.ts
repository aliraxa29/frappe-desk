import { useFreezeStore } from "../stores/freeze";

export interface DeskCallOptions {
  method: string;
  args?: Record<string, any>;
  type?: string;
  callback?: (response: any) => void;
  error?: (error: any) => void;
  freeze?: boolean;
  freeze_message?: string;
  async?: boolean;
  statusCode?: Record<number, (response: any) => void>;
}

export interface DeskCallResponse {
  message?: any;
  exc?: string;
  status?: number;
  _server_messages?: string[];
}

function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export async function call(options: DeskCallOptions): Promise<any> {
  const {
    method,
    args = {},
    type = "POST",
    callback,
    error: errorCallback,
    freeze = false,
    freeze_message = "Loading...",
    statusCode = {},
  } = options;

  if (!method) {
    throw new Error("Method name is required");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Frappe-CSRF-Token": getCookie("frappe_csrf_token") || "",
  };

  let freezeStore: ReturnType<typeof useFreezeStore> | null = null;
  if (freeze) {
    freezeStore = useFreezeStore();
    freezeStore.freeze(freeze_message);
  }

  try {
    const response = await fetch(`/api/method/${method}`, {
      method: type,
      headers,
      body: JSON.stringify(args),
      credentials: "same-origin",
    });

    const data: DeskCallResponse = await response.json();

    if (statusCode[response.status]) {
      statusCode[response.status](data);
      return data;
    }

    if (response.status === 401) {
      window.location.href = "/app/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = new Error(
        data.message || `HTTP Error: ${response.status}`,
      ) as any;
      error.response = {
        status: response.status,
        data: data,
      };

      if (errorCallback) {
        errorCallback(error);
      }

      throw error;
    }

    if (callback) {
      callback(data);
    }

    return data;
  } catch (err: any) {
    if (errorCallback) {
      errorCallback(err);
    }
    throw err;
  } finally {
    if (freeze && freezeStore) {
      freezeStore.unfreeze();
    }
  }
}

export async function post(
  method: string,
  args?: Record<string, any>,
): Promise<DeskCallResponse> {
  return call({ method, args });
}

export async function get(url: string): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Frappe-CSRF-Token": getCookie("frappe_csrf_token") || "",
  };

  const response = await fetch(url, {
    method: "GET",
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export function buildUrl(base: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return base;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, JSON.stringify(value));
    }
  }

  return `${base}?${searchParams.toString()}`;
}

export const desk = {
  call,
  post,
  get,
  buildUrl,
  freeze: (message?: string) => {
    const freezeStore = useFreezeStore();
    let finalMessage = message || "Loading...";

    try {
      const __ = (window as any).__;
      if (typeof __ === "function") {
        finalMessage = message || __("Loading...");
      }
    } catch (e) {}

    freezeStore.freeze(finalMessage);
  },
  unfreeze: () => {
    const freezeStore = useFreezeStore();
    freezeStore.unfreeze();
  },
};

if (typeof window !== "undefined" && window) {
  try {
    (window as any).desk = desk;
  } catch (e) {
    console.warn("Could not set global desk object:", e);
  }
}
