/**
 * Field-type formatters
 *
 * Each key corresponds to a Frappe field type.  The formatter receives
 * (value, df, options?, doc?) and returns an HTML string or plain text.
 *
 * All references use the global `desk.*` API surface – **never** `frappe.*`.
 */

import dayjs from "dayjs";
import { Field } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (c) => map[c] || c);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/ /g, "-");
}

// ── Formatters ─────────────────────────────────────────────────────

export const formatters: Record<string, (...args: any[]) => any> = {
  _right(value: any, options?: any) {
    if (options && (options.inline || options.only_value)) {
      return value;
    }
    return "<div style='text-align: right'>" + value + "</div>";
  },

  _apply_custom_formatter(value: any, df: Field) {
    if (df) {
      const std_df = desk.meta.docfield_map?.[df.parent ?? ""]?.[df.fieldname];
      if (std_df?.formatter && typeof std_df.formatter === "function") {
        value = std_df.formatter(value, df);
      }
    }
    return value;
  },

  Data(value: any, df: Field) {
    if (df?.options === "URL") {
      if (!value) return "";
      return `<a href="${escapeHtml(
        String(value),
      )}" title="Open Link" target="_blank">${escapeHtml(String(value))}</a>`;
    }
    value = value == null ? "" : value;
    return formatters._apply_custom_formatter(value, df);
  },

  Autocomplete(value: any, df: Field) {
    return __(formatters.Data(value, df));
  },

  Select(value: any, df: Field) {
    return __(formatters.Data(value, df));
  },

  Float(value: any, docfield: any, options?: any, doc?: any) {
    if (value === null) return "";

    let precision: number | null =
      docfield.precision || cint(desk.sys_defaults?.float_precision) || null;

    if (docfield.options && String(docfield.options).trim()) {
      docfield.precision = precision;
      return formatters.Currency(value, docfield, options, doc);
    }

    // show 1.000000 as 1
    if (!(options || {}).always_show_decimals && !is_null(value)) {
      const temp = cstr(value).split(".");
      if (temp[1] === undefined || cint(temp[1]) === 0) {
        precision = 0;
      }
    }

    value = value == null || value === "" ? "" : value;
    return formatters._right(format_number(value, null, precision), options);
  },

  Int(value: any, docfield: any, options?: any) {
    if (value === null) return "";

    if (cstr(docfield.options).trim() === "File Size") {
      return formatters.FileSize(value);
    }
    return formatters._right(value == null ? "" : cint(value), options);
  },

  Percent(value: any, docfield: any, options?: any) {
    if (value === null) return "";

    const precision: number =
      docfield.precision || cint(desk.sys_defaults?.float_precision) || 2;
    return formatters._right(
      format_number(value, null, precision) + "%",
      options,
    );
  },

  Rating(value: any, docfield: any) {
    let rating_html = "";
    const number_of_stars = docfield.options || 5;
    value = value * number_of_stars;
    value = Math.round(value * 2) / 2;
    Array.from({ length: cint(number_of_stars) }, (_, i) => i + 1).forEach(
      (i) => {
        rating_html += `<svg class="icon icon-md" data-rating=${i} viewBox="0 0 24 24" fill="none">
				<path class="right-half ${
          i <= (value || 0) ? "star-click" : ""
        }" d="M11.9987 3.00011C12.177 3.00011 12.3554 3.09303 12.4471 3.27888L14.8213 8.09112C14.8941 8.23872 15.0349 8.34102 15.1978 8.3647L20.5069 9.13641C20.917 9.19602 21.0807 9.69992 20.7841 9.9892L16.9421 13.7354C16.8243 13.8503 16.7706 14.0157 16.7984 14.1779L17.7053 19.4674C17.7753 19.8759 17.3466 20.1874 16.9798 19.9945L12.2314 17.4973C12.1586 17.459 12.0786 17.4398 11.9987 17.4398V3.00011Z" fill="var(--star-fill)" stroke="var(--star-fill)"/>
				<path class="left-half ${
          i <= (value || 0) || i - 0.5 == value ? "star-click" : ""
        }" d="M11.9987 3.00011C11.8207 3.00011 11.6428 3.09261 11.5509 3.27762L9.15562 8.09836C9.08253 8.24546 8.94185 8.34728 8.77927 8.37075L3.42887 9.14298C3.01771 9.20233 2.85405 9.70811 3.1525 9.99707L7.01978 13.7414C7.13858 13.8564 7.19283 14.0228 7.16469 14.1857L6.25116 19.4762C6.18071 19.8842 6.6083 20.1961 6.97531 20.0045L11.7672 17.5022C11.8397 17.4643 11.9192 17.4454 11.9987 17.4454V3.00011Z" fill="var(--star-fill)" stroke="var(--star-fill)"/>
			</svg>`;
      },
    );
    return `<div class="rating">${rating_html}</div>`;
  },

  Currency(value: any, docfield: any, options?: any, doc?: any) {
    if (value === null) return "";

    const currency = desk.meta.get_field_currency(docfield, doc);

    let precision: number;
    if (typeof docfield.precision === "number") {
      precision = docfield.precision;
    } else {
      precision = cint(
        docfield.precision || desk.sys_defaults?.currency_precision || 2,
      );
    }

    // Resolve sub-unit–aware precision for > 2 decimals
    if (precision > 2) {
      const parts = cstr(value).split(".");
      const decimals = parts.length > 1 ? parts[1] : "";

      if (decimals.length < 3 || decimals.length < precision) {
        const fraction =
          desk.model.get_value?.(":Currency", currency, "fraction_units") ||
          100;

        if (decimals.length < cstr(fraction).length) {
          precision = cstr(fraction).length - 1;
        }
      }
    }

    value = value == null || value === "" ? "" : value;
    value = format_currency(value, currency, precision);

    if (options?.only_value) {
      return value;
    }
    return formatters._right(value, options);
  },

  Check(value: any) {
    return `<input type="checkbox" disabled class="disabled-${
      value ? "selected" : "deselected"
    }">`;
  },

  Link(value: any, docfield: any, options?: any, doc?: any) {
    const doctype = docfield._options || docfield.options;
    const original_value = value;

    if (value && value.match?.(/^['"].*['"]$/)) {
      value = value.replace(/^.(.*).$/, "$1");
    }

    if (options && (options.for_print || options.only_value)) {
      return value || "";
    }

    // Apply link formatters (e.g. User → full name)
    if (desk.link_formatters?.[doctype]) {
      if (doc && doctype !== doc.doctype) {
        value = desk.link_formatters[doctype](value, doc, docfield);
      }
    }

    if (!value) return "";

    if (value[0] === "'" && value[value.length - 1] === "'") {
      return value.substring(1, value.length - 1);
    }

    if (docfield?.link_onclick) {
      return repl('<a onclick="%(onclick)s" href="#">%(value)s</a>', {
        onclick:
          docfield.link_onclick.replace(/"/g, "&quot;") + "; return false;",
        value: value,
      });
    }

    if (docfield && doctype) {
      if (desk.model.can_read(doctype)) {
        const a = document.createElement("a");
        a.href = `/app/${encodeURIComponent(
          slugify(doctype),
        )}/${encodeURIComponent(original_value)}`;
        a.dataset.doctype = doctype;
        a.dataset.name = original_value;
        a.dataset.value = original_value;
        a.innerText = __(options?.label || value);
        return a.outerHTML;
      }
      return value;
    }
    return value;
  },

  Date(value: any) {
    if (value) {
      value = desk.datetime.str_to_user(value, false, true);
      if (value === "Invalid date") value = null;
    }
    return value || "";
  },

  DateRange(value: any) {
    if (Array.isArray(value)) {
      return __("{0} to {1}", [
        desk.datetime.str_to_user(value[0]),
        desk.datetime.str_to_user(value[1]),
      ]);
    }
    return value || "";
  },

  Datetime(value: any) {
    if (!value) return "";
    const converted = desk.datetime.convert_to_user_tz(value);
    const dateFmt = (
      desk.sys_defaults?.date_format || "YYYY-MM-DD"
    ).toUpperCase();
    const timeFmt = desk.sys_defaults?.time_format || "HH:mm:ss";
    return dayjs(String(converted)).format(`${dateFmt} ${timeFmt}`);
  },

  Text(value: any, df?: Field) {
    if (value) {
      const htmlTags = ["<p", "<div", "<br", "<table"];
      const hasHtml = htmlTags.some((tag) => String(value).includes(tag));
      if (!hasHtml) {
        value = desk.utils.replace_newlines(value);
      }
    }
    return formatters.Data(value, df as Field);
  },

  Time(value: any) {
    if (value) {
      value = desk.datetime.str_to_user(value, true);
    }
    return value || "";
  },

  Duration(value: any, docfield: any) {
    if (value) {
      const duration_options = desk.utils.get_duration_options(docfield);
      value = desk.utils.get_formatted_duration(value, duration_options);
    }
    return value || "0s";
  },

  LikedBy(value: any) {
    const users: string[] = JSON.parse(value || "[]");
    return users
      .filter(Boolean)
      .map(
        (v) =>
          `<span class="badge bg-light text-dark me-1">${escapeHtml(v)}</span>`,
      )
      .join("");
  },

  Tag(value: any) {
    return (value || "")
      .split(",")
      .filter(Boolean)
      .map(
        (v: string) =>
          `<span class="data-pill btn-xs align-center ellipsis" style="background-color: var(--control-bg); box-shadow: none; margin-right: 4px;" data-field="_user_tags" data-label="${escapeHtml(
            v,
          )}">${escapeHtml(v)}</span>`,
      )
      .join("");
  },

  Comment(value: any) {
    return value;
  },

  Assign(value: any) {
    const users: string[] = JSON.parse(value || "[]");
    return users
      .filter(Boolean)
      .map(
        (v) =>
          `<span class="label label-warning" style="margin-right: 7px;" data-field="_assign">${escapeHtml(
            v,
          )}</span>`,
      )
      .join("");
  },

  SmallText(value: any, df?: Field) {
    return formatters.Text(value, df);
  },

  TextEditor(value: any, df?: Field) {
    let formatted = formatters.Text(value, df);
    if (typeof formatted === "string" && !formatted.includes("ql-editor")) {
      formatted = `<div class="ql-editor read-mode">${formatted}</div>`;
    }
    return formatted;
  },

  Code(value: any) {
    return (
      "<pre>" + (value == null ? "" : escapeHtml(String(value))) + "</pre>"
    );
  },

  WorkflowState(value: any) {
    if (!value) return "";
    const ws = locals?.["Workflow State"]?.[value];
    if (ws) {
      return repl(
        "<span class='label label-%(style)s' data-workflow-state='%(value)s' style='padding-bottom: 4px; cursor: pointer;'><i class='fa fa-small fa-white fa-%(icon)s'></i> %(value)s</span>",
        {
          value,
          style: (ws.style || "default").toLowerCase(),
          icon: ws.icon || "",
        },
      );
    }
    return `<span class='label'>${escapeHtml(String(value))}</span>`;
  },

  Email(value: any) {
    if (!value) return "";
    return escapeHtml(String(value));
  },

  FileSize(value: any) {
    value = cint(value);
    if (value > 1048576) return (value / 1048576).toFixed(2) + "M";
    if (value > 1024) return (value / 1024).toFixed(2) + "K";
    return value;
  },

  TableMultiSelect(rows: any, df: any, options?: any) {
    rows = rows || [];
    const meta = desk.meta.get_meta(df.options);
    if (!meta?.fields) return "";
    const link_field = meta.fields.find((f: any) => f.fieldtype === "Link");
    if (!link_field) return "";
    return rows
      .map((row: any) => {
        const value = row[link_field.fieldname];
        return `<span class="text-nowrap">${escapeHtml(
          String(value ?? ""),
        )}</span>`;
      })
      .join(", ");
  },

  Color(value: any) {
    if (!value) return "";
    return `<div><div class="selected-color" style="background-color: ${escapeHtml(
      String(value),
    )}"></div><span class="color-value">${escapeHtml(
      String(value),
    )}</span></div>`;
  },

  Icon(value: any) {
    if (!value) return "";
    return `<div><span class="icon-value">${escapeHtml(
      String(value),
    )}</span></div>`;
  },

  Attach: format_attachment_url,
  AttachImage: format_attachment_url,
};

function format_attachment_url(url: any) {
  return url
    ? `<a href="${escapeHtml(String(url))}" target="_blank">${escapeHtml(
        String(url),
      )}</a>`
    : "";
}
