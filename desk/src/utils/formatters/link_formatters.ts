export type LinkFormatter = (
    value: string,
    doc?: Record<string, any>,
    docfield?: any
) => string

export const link_formatters: Record<string, LinkFormatter> = {}

link_formatters["User"] = function (value, doc, docfield) {
    const full_name =
        doc?.full_name || (docfield && doc?.[`${docfield.fieldname}_full_name`])
    return full_name || value
}
