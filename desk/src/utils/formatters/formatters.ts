import { link_formatters } from "./link_formatters"

export type FormatterFn = (
    value: any,
    df?: any,
    options?: any,
    doc?: any
) => string

export const formatters: Record<string, FormatterFn> = {
    _right(value, options) {
        if (options?.inline || options?.only_value) return value
        return `<div style="text-align: right">${value}</div>`
    },

    _apply_custom_formatter(value, df) {
        if (!df) return value

        const std_df =
            window.desk.meta.docfield_map?.[df.parent]?.[df.fieldname]

        if (std_df?.formatter instanceof Function) {
            value = std_df.formatter(value, df)
        }
        return value
    },

    Data(value, df) {
        if (df?.options === "URL" && value) {
            return `<a href="${value}" target="_blank">${value}</a>`
        }

        if (df?.options === "IBAN" && value) {
            return desk.utils.get_formatted_iban(value)
        }

        value = value ?? ""
        return formatters._apply_custom_formatter(value, df)
    },

    Autocomplete(value, df) {
        return __(formatters.Data(value, df))
    },

    Select(value, df) {
        return __(formatters.Data(value, df))
    },

    Float(value, df, options, doc) {
        if (value === null) return ""

        let precision =
            df.precision ??
            cint(desk.boot.sysdefaults?.float_precision) ??
            null

        if (df.options?.trim()) {
            df.precision = precision
            return formatters.Currency(value, df, options, doc)
        }

        if (!options?.always_show_decimals && value != null) {
            const [, decimals] = cstr(value).split(".")
            if (!decimals || cint(decimals) === 0) precision = 0
        }

        return formatters._right(
            format_number(value, null, precision),
            options
        )
    },

    Int(value, df, options) {
        if (value === null) return ""

        if (cstr(df.options).trim() === "File Size") {
            return formatters.FileSize(value)
        }
        return formatters._right(cint(value), options)
    },

    Percent(value, df, options) {
        if (value === null) return ""

        const precision =
            df.precision ??
            cint(desk.boot.sysdefaults?.float_precision) ??
            2

        return formatters._right(
            format_number(value, null, precision) + "%",
            options
        )
    },

    Rating(value, df) {
        let html = ""
        const stars = cint(df.options || 5)

        value = Math.round(value * stars * 2) / 2

        for (let i = 1; i <= stars; i++) {
            html += `<svg class="icon icon-md ${i <= value ? "star-click" : ""}"></svg>`
        }

        return `<div class="rating">${html}</div>`
    },

    Currency(value, df, options, doc) {
        if (value === null) return ""

        const currency = desk.meta.get_field_currency(df, doc)
        let precision =
            typeof df.precision === "number"
                ? df.precision
                : cint(df.precision || desk.boot.sysdefaults?.currency_precision || 2)

        value = format_currency(value, currency, precision)

        return options?.only_value
            ? value
            : formatters._right(value, options)
    },

    Check(value) {
        return `<input type="checkbox" disabled class="disabled-${value ? "selected" : "deselected"
            }">`
    },

    Link(value, df, options, doc) {
        const doctype = df._options || df.options
        const original = value
        let title = desk.utils.get_link_title(doctype, value)

        if (options?.only_value || options?.for_print) {
            return title || value
        }

        if (link_formatters[doctype] && doc?.doctype !== doctype) {
            value = link_formatters[doctype](value, doc, df)
        }

        if (!value) return ""

        if (df.link_onclick) {
            return `<a href="#" onclick="${df.link_onclick};return false;">${value}</a>`
        }

        if (desk.model.can_read(doctype)) {
            return `<a href="/app/${desk.router.slug(doctype)}/${encodeURIComponent(
                original
            )}">${__(title || value)}</a>`
        }

        return title || value
    },

    Date(value) {
        if (!desk.datetime.str_to_user) return value
        return value
            ? desk.datetime.str_to_user(value, false, true) || ""
            : ""
    },

    Time(value) {
        return value ? desk.datetime.str_to_user(value, true) : ""
    },

    Text(value, df) {
        if (value && !/<(p|div|br|table)/.test(value)) {
            value = desk.utils.replace_newlines(value)
        }
        return formatters.Data(value, df)
    },

    Code(value) {
        return `<pre>${value == null ? "" : desk.utils.escape_html(value)}</pre>`
    },

    FileSize(value) {
        value = cint(value)
        if (value > 1048576) return (value / 1048576).toFixed(2) + "M"
        if (value > 1024) return (value / 1024).toFixed(2) + "K"
        return value
    },

    Color(value) {
        return value
            ? `<div><div class="selected-color" style="background:${value}"></div>${value}</div>`
            : ""
    },

    Icon(value) {
        return value
            ? `<div><div>${desk.utils.icon(value, "md")}</div>${value}</div>`
            : ""
    },

    Attach: format_attachment_url,
    AttachImage: format_attachment_url,
}

function format_attachment_url(url?: string) {
    return url ? `<a href="${url}" target="_blank">${url}</a>` : ""
}
