import { formatters } from "./formatters"

export function get_formatter(fieldtype?: string) {
    return (
        formatters[fieldtype?.replace(/ /g, "") || "Data"] ||
        formatters.Data
    )
}

export function format(
    value: any,
    df: any,
    options?: any,
    doc?: any
): string {
    df ??= { fieldtype: "Data" }

    if (df.fieldname === "_user_tags") {
        df = { ...df, fieldtype: "Tag" }
    }

    let fieldtype = df.fieldtype || "Data"

    if (fieldtype === "Dynamic Link") {
        fieldtype = "Link"
        df._options = doc?.[df.options]
    }

    const formatter = df.formatter || get_formatter(fieldtype)
    let output = formatter(value, df, options, doc)

    if (typeof output === "string") {
        output = desk.dom.remove_script_and_style(output)
    }

    return output
}

export function get_format_helper(doc: any) {
    return Object.assign(
        {
            get_formatted(fieldname: string) {
                const df = desk.meta.get_docfield(doc.doctype, fieldname)
                return format(doc[fieldname], df, { inline: 1 }, doc)
            },
        },
        doc
    )
}
