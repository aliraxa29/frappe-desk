import { Form } from "@/metadata/form";
import { __ } from "./translate";

/**
 * Build a simple HTML anchor linking to a form route.
 */
function get_form_link(doctype: string, name: string, text?: string): string {
  const slug = doctype.toLowerCase().replace(/ /g, "-");
  const label = desk.utils.escape_html(text || name);
  return `<a href="/app/${encodeURIComponent(slug)}/${encodeURIComponent(
    name,
  )}">${label}</a>`;
}

export function get_version_timeline_content(version_doc: any, frm: Form) {
  if (!version_doc.data) return [];
  const data = JSON.parse(version_doc.data);

  // comment
  if (data.comment) {
    return [get_version_comment(version_doc, data.comment)];
  }

  let out = [];

  let updater_reference_link = null;
  let updater_reference = data.updater_reference;
  if (Object.keys(updater_reference).length !== 0) {
    let label =
      updater_reference.label || __("via {0}", [updater_reference.doctype]);
    let { doctype, docname } = updater_reference;
    if (doctype && docname) {
      updater_reference_link = get_form_link(doctype, docname, label);
    } else {
      updater_reference_link = label;
    }
  }

  // value changed in parent
  if (data.changed && data.changed.length) {
    const parts: any[] = [];
    data.changed.every(function (p: any) {
      if (p[0] === "docstatus") {
        if (p[2] === 1) {
          let message = updater_reference_link
            ? get_user_message(
                version_doc.owner,
                __(
                  "You submitted this document {0}",
                  [updater_reference_link],
                  "Form timeline",
                ),
                __(
                  "{0} submitted this document {1}",
                  [get_user_link(version_doc.owner), updater_reference_link],
                  "Form timeline",
                ),
              )
            : get_user_message(
                version_doc.owner,
                __("You submitted this document", undefined, "Form timeline"),
                __(
                  "{0} submitted this document",
                  [get_user_link(version_doc.owner)],
                  "Form timeline",
                ),
              );

          out.push(get_version_comment(version_doc, message));
        } else if (p[2] === 2) {
          let message = updater_reference_link
            ? get_user_message(
                version_doc.owner,
                __(
                  "You cancelled this document {1}",
                  [updater_reference_link],
                  "Form timeline",
                ),
                __(
                  "{0} cancelled this document {1}",
                  [get_user_link(version_doc.owner), updater_reference_link],
                  "Form timeline",
                ),
              )
            : get_user_message(
                version_doc.owner,
                __("You cancelled this document", undefined, "Form timeline"),
                __(
                  "{0} cancelled this document",
                  [get_user_link(version_doc.owner)],
                  "Form timeline",
                ),
              );

          out.push(get_version_comment(version_doc, message));
        }
      } else {
        const df = desk.meta.get_docfield(frm.doctype, p[0], frm.docname);
        if (df && (!df.hidden || df.show_on_timeline)) {
          const field_display_status = desk.perm.get_field_display_status(
            df,
            null,
            frm.perm,
          );
          if (
            field_display_status === "Read" ||
            field_display_status === "Write" ||
            (df.hidden && df.show_on_timeline)
          ) {
            parts.push(
              __("{0} from {1} to {2}", [
                __(df.label, undefined, df.parent),
                format_content_for_timeline(p[1]),
                format_content_for_timeline(p[2]),
              ]),
            );
          }
        }
      }
      return parts.length < 3;
    });
    if (parts.length) {
      let message = updater_reference_link
        ? get_user_message(
            version_doc.owner,
            __("You changed the value of {0} {1}", [
              parts.join(", "),
              updater_reference_link,
            ]),
            __("{0} changed the value of {1} {2}", [
              get_user_link(version_doc.owner),
              parts.join(", "),
              updater_reference_link,
            ]),
          )
        : get_user_message(
            version_doc.owner,
            __("You changed the value of {0}", [parts.join(", ")]),
            __("{0} changed the value of {1}", [
              get_user_link(version_doc.owner),
              parts.join(", "),
            ]),
          );

      out.push(get_version_comment(version_doc, message));
    }
  }

  // value changed in table field
  if (data.row_changed && data.row_changed.length) {
    let parts: any[] = [];
    data.row_changed.every(function (row: any) {
      row[3].every(function (p: any) {
        var df =
          frm.fields_dict[row[0]] &&
          desk.meta.get_docfield(
            frm.fields_dict[row[0]].grid.doctype,
            p[0],
            frm.docname,
          );

        if (df && (!df.hidden || df.show_on_timeline)) {
          var field_display_status = desk.perm.get_field_display_status(
            df,
            null,
            frm.perm,
          );

          if (
            field_display_status === "Read" ||
            field_display_status === "Write" ||
            (df.hidden && df.show_on_timeline)
          ) {
            parts.push(
              __("{0} from {1} to {2} in row #{3}", [
                __(desk.meta.get_label(frm.doctype, p[0], frm.docname)),
                format_content_for_timeline(p[1]),
                format_content_for_timeline(p[2]),
                row[1] + 1,
              ]),
            );
          }
        }
        return parts.length < 3;
      });
      return parts.length < 3;
    });
    if (parts.length) {
      let message = updater_reference_link
        ? get_user_message(
            version_doc.owner,
            __("You changed the values for {0} {1}", [
              parts.join(", "),
              updater_reference_link,
            ]),
            __("{0} changed the values for {1} {2}", [
              get_user_link(version_doc.owner),
              parts.join(", "),
              updater_reference_link,
            ]),
          )
        : get_user_message(
            version_doc.owner,
            __("You changed the values for {0}", [parts.join(", ")]),
            __("{0} changed the values for {1}", [
              get_user_link(version_doc.owner),
              parts.join(", "),
            ]),
          );

      out.push(get_version_comment(version_doc, message));
    }
  }

  // rows added / removed
  // __('added'), __('removed') # for translation, don't remove
  ["added", "removed"].forEach(function (key) {
    if (data[key] && data[key].length) {
      let parts = (data[key] || []).map(function (p: any) {
        var df = desk.meta.get_docfield(frm.doctype, p[0], frm.docname);

        if (df && (!df.hidden || df.show_on_timeline)) {
          var field_display_status = desk.perm.get_field_display_status(
            df,
            null,
            frm.perm,
          );

          if (
            field_display_status === "Read" ||
            field_display_status === "Write" ||
            (df.hidden && df.show_on_timeline)
          ) {
            return __(desk.meta.get_label(frm.doctype, p[0], frm.docname));
          }
        }
      });
      parts = parts.filter(function (p: any) {
        return p;
      });
      if (parts.length) {
        let messages = [];

        const countMap = parts.reduce(
          (acc: Record<string, number>, item: string) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
          },
          {},
        );

        let isFirst = true;
        for (let [table_name, count] of Object.entries(countMap)) {
          const _count = Number(count);
          if (key === "added") {
            if (_count > 1) {
              if (isFirst) {
                messages.push(
                  get_user_message(
                    version_doc.owner,
                    __("You added {0} rows to {1}", [_count, table_name]),
                    __("{0} added {1} rows to {2}", [
                      get_user_link(version_doc.owner),
                      _count,
                      table_name,
                    ]),
                  ),
                );
              } else {
                messages.push(
                  __(
                    "{0} rows to {1}",
                    [_count, table_name],
                    "User added rows to child table",
                  ),
                );
              }
            } else {
              if (isFirst) {
                messages.push(
                  get_user_message(
                    version_doc.owner,
                    __("You added 1 row to {0}", [table_name]),
                    __("{0} added 1 row to {1}", [
                      get_user_link(version_doc.owner),
                      table_name,
                    ]),
                  ),
                );
              } else {
                messages.push(
                  __(
                    "1 row to {0}",
                    [table_name],
                    "User added row to child table",
                  ),
                );
              }
            }
          } else {
            if (_count > 1) {
              if (isFirst) {
                messages.push(
                  get_user_message(
                    version_doc.owner,
                    __("You removed {0} rows from {1}", [_count, table_name]),
                    __("{0} removed {1} rows from {2}", [
                      get_user_link(version_doc.owner),
                      _count,
                      table_name,
                    ]),
                  ),
                );
              } else {
                messages.push(
                  __(
                    "{0} rows from {1}",
                    [_count, table_name],
                    "User removed rows from child table",
                  ),
                );
              }
            } else {
              if (isFirst) {
                messages.push(
                  get_user_message(
                    version_doc.owner,
                    __("You removed 1 row from {0}", [table_name]),
                    __("{0} removed 1 row from {1}", [
                      get_user_link(version_doc.owner),
                      table_name,
                    ]),
                  ),
                );
              } else {
                messages.push(
                  __(
                    "1 row from {0}",
                    [table_name],
                    "User removed row from child table",
                  ),
                );
              }
            }
          }
          isFirst = false;
        }

        out.push(
          get_version_comment(version_doc, desk.utils.comma_and(messages)),
        );
      }
    }
  });

  if (data.created_by && updater_reference) {
    let message = get_user_message(
      version_doc.owner,
      __(
        "You created this document {0}",
        [updater_reference_link],
        "Form timeline",
      ),
      __(
        "{0} created this document {1}",
        [get_user_link(version_doc.owner), updater_reference_link],
        "Form timeline",
      ),
    );
    out.push(get_version_comment(version_doc, message));
  }
  const impersonated_by = data.impersonated_by;

  if (impersonated_by) {
    const impersonated_msg = __("Impersonated by {0}", [
      get_user_link(impersonated_by),
    ]);
    out = out.map((message) => `${message} · ${impersonated_msg.bold()}`);
  }

  const audit_user = data.audit_user;
  if (audit_user) {
    const audit_msg = __("[Action taken by {0}]", [get_user_link(audit_user)]);
    out = out.map((message) => `${message} · ${audit_msg.bold()}`);
  }
  return out;
}

function get_version_comment(version_doc: any, text: string) {
  // TODO: Replace with a better solution
  if (text.includes("<a")) {
    // if text already has linked content in it
    // then just add a version link to unlinked content
    let version_comment = "";
    let unlinked_content = "";

    try {
      text += "</>";
      Array.from($(text)).forEach((element) => {
        if ($(element).is("a")) {
          version_comment += unlinked_content
            ? get_form_link("Version", version_doc.name, unlinked_content)
            : "";
          unlinked_content = "";
          version_comment += element.outerHTML;
        } else {
          unlinked_content += element.outerHTML || element.textContent;
        }
      });
      if (unlinked_content) {
        version_comment += get_form_link(
          "Version",
          version_doc.name,
          unlinked_content,
        );
      }
      return version_comment;
    } catch (e) {
      // pass
    }
  }
  return get_form_link("Version", version_doc.name, text);
}

function format_content_for_timeline(content) {
  // text to HTML
  // limits content to 40 characters
  // escapes HTML
  // and makes it bold
  content = desk.utils.html2text(content);
  content = content.length > 40 ? content.substring(0, 40) + "…" : content;
  content = content || '""';
  content = desk.utils.escape_html(content);
  return content.bold();
}

function get_user_link(user: string) {
  const user_display_text = desk.user_info(user).fullname || user;
  return get_form_link("User", user, desk.utils.escape_html(user_display_text));
}

function get_user_message(
  user: string,
  message_self: string,
  message_other: string,
) {
  return desk.utils.is_current_user(user) ? message_self : message_other;
}
