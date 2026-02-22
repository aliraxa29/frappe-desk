import { dialog } from "../stores/dialog";
import { useFreezeStore } from "../stores/freeze";
import { DeskCallOptions, DeskCallResponse } from "../types/index";
import { __ } from "./translate";

async function call(options: DeskCallOptions): Promise<any> {
  const {
    method,
    args = {},
    type = "POST",
    callback,
    error_callback,
    freeze = false,
    freeze_message = "Loading...",
  } = options;

  if (!method) {
    throw new Error("Method name is required");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Frappe-CSRF-Token": window.dash?.csrf_token || "",
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

    const statusCode: Record<number, Function> = {
      200: function (_data: any) {
        callback && callback(_data);
      },
      401: function (_data: any) {
        dialog.error(
          __("Not permitted"),
          __(
            "You do not have enough permissions to access this resource. Please contact your manager to get access.",
          ),
        );
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
      404: function (_data: any) {
        dialog.error(
          __("Not found"),
          __("The resource you are looking for is not available"),
        );
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
      403: function (_data: any) {
        dialog.error(
          __("Not permitted"),
          __(
            "You do not have enough permissions to access this resource. Please contact your manager to get access.",
          ),
        );
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
      508: function (_data: any) {
        dialog.error(
          __("Please try again"),
          __(
            "Another transaction is blocking this one. Please try again in a few seconds.",
          ),
        );
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
      413: function (_data: any) {
        dialog.error(
          __("File too big"),
          __("File size exceeded the maximum allowed size of {0} MB", [
            (window.dash.max_file_size || 5242880) / 1048576,
          ]),
        );
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
      417: function (_data: any) {
        console.error(_data.exc);
        const result = JSON.parse(
          JSON.parse(_data._server_messages || "[]")[0],
        );
        dialog.error(
          __(result.title || "Validation Failed"),
          __(
            result.message ||
              "One or more fields failed validation. Please check and try again.",
          ),
          { isHtml: true },
        );
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
      501: function (_data: any) {
        if (typeof _data === "string") _data = JSON.parse(_data);
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
      500: function (_data: any) {
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
      504: function (_data: any) {
        dialog.error(
          __("Request Timed Out"),
          __("The server took too long to respond. Please try again."),
        );
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
      502: function (_data: any) {
        dialog.error(
          __("Internal Server Error"),
          __(
            "An unexpected error occurred on the server. Please try again later.",
          ),
        );
        error_callback && error_callback(_data);
        throw JSON.parse(data.exc || "{}")[0];
      },
    };

    const exception_handlers: Record<string, Function> = {
      QueryTimeoutError: function () {
        dialog.error(
          __("Request Timeout"),
          __("Server was too busy to process this request. Please try again."),
        );
      },
      QueryDeadlockError: function () {
        dialog.error(
          __("Deadlock Occurred"),
          __(
            "Server failed to process this request because of a concurrent conflicting request. Please try again.",
          ),
        );
      },
    };

    if (response.status in statusCode) {
      statusCode[response.status](data);
    } else if (data.exc && data.exc in exception_handlers) {
      exception_handlers[data.exc]();
    } else if (!response.ok) {
      dialog.error(
        __("Error"),
        data.message || __("An unexpected error occurred. Please try again."),
      );
      error_callback && error_callback(data);
    } else if (data.exc) {
      dialog.error(
        __("Error"),
        data.message || __("An unexpected error occurred. Please try again."),
      );
      error_callback && error_callback(data);
    } else {
      callback && callback(data);
    }

    return data;
  } catch (err: any) {
    if (error_callback) {
      error_callback(err);
    }
    throw err;
  } finally {
    if (freeze && freezeStore) {
      freezeStore.unfreeze();
    }
  }
}

function buildUrl(base: string, params?: Record<string, any>): string {
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

export const resource = {
  call,
  buildUrl,
  freeze: (message?: string) => {
    const freezeStore = useFreezeStore();
    let finalMessage = message || "Loading...";
    freezeStore.freeze(__(finalMessage));
  },
  unfreeze: () => {
    const freezeStore = useFreezeStore();
    freezeStore.unfreeze();
  },
};
