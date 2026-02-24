import { resource } from "../utils/resource";
import { __ } from "../utils/translate";
import { loadScript } from "../runtime/scriptLoader";
import { getMeta } from "@/metadata";
import { Form } from "@/runtime/formContext";
import { dialog } from "@/stores/dialog";
import { Document } from "@/types";

export interface Model {
  docinfo: Record<string, any>;
  all_fieldtypes: string[];
  no_value_type: string[];
  layout_fields: string[];
  std_fields_list: string[];
  child_table_field_list: string[];
  core_doctypes_list: string[];
  restricted_fields: string[];
  html_fieldtypes: string[];
  std_fields: any[];
  numeric_fieldtypes: string[];
  std_fields_table: any[];
  table_fields: string[];
  new_names: Record<string, string>;
  events: Record<string, any>;
  user_settings: Record<string, any>;
  is_value_type: (fieldtype: string | Record<string, any>) => boolean;
  is_non_std_field: (fieldname: string) => boolean;
  get_std_field: (fieldname: string, ignore?: boolean) => any;
  get_from_localstorage: (doctype: string) => any;
  set_in_localstorage: (doctype: string, docs: any) => void;
  clear_local_storage: () => void;
  sync: (r: any) => any;
  rename_after_save: (d: any, i: number) => void;
  sync_docinfo: (r: any) => any;
  add_to_locals: (doc: any) => void;
  update_in_locals: (doc: any) => void;
  set_default_values: (
    doc: Document,
    parent_doc: Document | null,
  ) => Promise<void>;
  get_new_doc: (
    doctype: string,
    parent_doc?: Document | null,
    parentfield?: string | null,
    with_mandatory_children?: boolean,
  ) => Document;
  make_new_doc_and_get_name: (
    doctype: string,
    with_mandatory_children: boolean,
  ) => string;
  get_new_name: (doctype: string) => string;
  with_doctype: (
    doctype: string,
    callback?: ((doc: any) => void) | undefined,
    async?: boolean,
  ) => Promise<void>;
  init_doctype: (doctype: string) => void;
  with_doc: (doctype: string, name: string, callback: any) => Promise<any>;
  get_docinfo: (doctype: string, name: string) => any;
  set_docinfo: (doctype: string, name: string, key: string, value: any) => void;
  get_shared: (doctype: string, name: string) => any;
  get_server_module_name: (doctype: string) => string;
  scrub: (txt: string) => string;
  unscrub: (txt: string) => string;
  can_create: (doctype: string) => boolean;
  can_select: (doctype: string) => boolean;
  can_read: (doctype: string) => boolean;
  can_write: (doctype: string) => boolean;
  can_get_report: (doctype: string) => boolean;
  can_delete: (doctype: string) => boolean;
  can_submit: (doctype: string) => boolean;
  can_cancel: (doctype: string) => boolean;
  has_workflow: (doctype: string) => boolean;
  is_submittable: (doctype: string) => boolean;
  is_table: (doctype: string) => boolean;
  is_single: (doctype: string) => boolean;
  is_tree: (doctype: string) => boolean;
  is_fresh: (doc: Document) => boolean;
  can_import: (doctype: string, frm?: Form, meta?: any) => boolean;
  can_export: (doctype: string, frm?: Form) => boolean;
  can_print: (doctype: string, frm?: Form) => boolean;
  can_email: (doctype: string, frm?: Form) => boolean;
  can_share: (doctype: string, frm?: Form) => boolean;
  has_value: (dt: string, dn: string, fn: string) => boolean;
  get_list: (doctype: string, filters: Record<string, any>) => any[];
}

export const model: Model = {
  docinfo: {},

  all_fieldtypes: [
    "Autocomplete",
    "Attach",
    "Attach Image",
    "Barcode",
    "Button",
    "Check",
    "Code",
    "Color",
    "Currency",
    "Data",
    "Date",
    "Datetime",
    "Duration",
    "Dynamic Link",
    "Float",
    "Geolocation",
    "Heading",
    "HTML",
    "HTML Editor",
    "Icon",
    "Image",
    "Int",
    "JSON",
    "Link",
    "Long Text",
    "Markdown Editor",
    "Password",
    "Percent",
    "Phone",
    "Read Only",
    "Rating",
    "Select",
    "Signature",
    "Small Text",
    "Table",
    "Table MultiSelect",
    "Text",
    "Text Editor",
    "Time",
  ],

  no_value_type: [
    "Section Break",
    "Column Break",
    "Tab Break",
    "HTML",
    "Table",
    "Table MultiSelect",
    "Button",
    "Image",
    "Fold",
    "Heading",
  ],

  layout_fields: ["Section Break", "Column Break", "Tab Break", "Fold"],

  std_fields_list: [
    "name",
    "owner",
    "creation",
    "modified",
    "modified_by",
    "_user_tags",
    "_comments",
    "_assign",
    "_liked_by",
    "docstatus",
    "idx",
  ],

  child_table_field_list: ["parent", "parenttype", "parentfield"],

  core_doctypes_list: [
    "DocType",
    "DocField",
    "DocPerm",
    "User",
    "Role",
    "Has Role",
    "Page",
    "Module Def",
    "Print Format",
    "Report",
    "Customize Form",
    "Customize Form Field",
    "Property Setter",
    "Custom Field",
    "Client Script",
  ],

  restricted_fields: [
    "name",
    "parent",
    "creation",
    "modified",
    "modified_by",
    "parentfield",
    "parenttype",
    "file_list",
    "flags",
    "docstatus",
  ],

  html_fieldtypes: [
    "Text Editor",
    "Text",
    "Small Text",
    "Long Text",
    "HTML Editor",
    "Markdown Editor",
    "Code",
  ],

  std_fields: [
    { fieldname: "name", fieldtype: "Link", label: __("ID") },
    {
      fieldname: "owner",
      fieldtype: "Link",
      label: __("Created By"),
      options: "User",
    },
    { fieldname: "idx", fieldtype: "Int", label: __("Index") },
    { fieldname: "creation", fieldtype: "Datetime", label: __("Created On") },
    {
      fieldname: "modified",
      fieldtype: "Datetime",
      label: __("Last Updated On"),
    },
    {
      fieldname: "modified_by",
      fieldtype: "Link",
      label: __("Last Updated By"),
      options: "User",
    },
    { fieldname: "_user_tags", fieldtype: "Data", label: __("Tags") },
    { fieldname: "_liked_by", fieldtype: "Data", label: __("Liked By") },
    { fieldname: "_comments", fieldtype: "Text", label: __("Comments") },
    { fieldname: "_assign", fieldtype: "Text", label: __("Assigned To") },
    { fieldname: "docstatus", fieldtype: "Int", label: __("Document Status") },
  ],

  numeric_fieldtypes: ["Int", "Float", "Currency", "Percent", "Duration"],

  std_fields_table: [
    { fieldname: "parent", fieldtype: "Data", label: __("Parent") },
  ],

  table_fields: ["Table", "Table MultiSelect"],

  new_names: {},
  events: {},
  user_settings: {},

  is_value_type: function (fieldtype) {
    if (typeof fieldtype == "object") {
      fieldtype = fieldtype.fieldtype;
    }
    // not in no-value type
    return window.desk.model.no_value_type.indexOf(fieldtype) === -1;
  },

  is_non_std_field: function (fieldname) {
    return ![
      ...desk.model.std_fields_list,
      ...desk.model.child_table_field_list,
    ].includes(fieldname);
  },

  get_std_field: (fieldname, ignore = false) => {
    var docfield = [...model.std_fields, ...model.std_fields_table].filter(
      function (d) {
        if (d.fieldname == fieldname) return d;
      },
    );

    if (!docfield.length) {
      //Standard fields are ignored in case of adding columns as a result of groupby
      if (ignore) {
        return { fieldname: fieldname };
      } else {
        dialog.alert(__("Unknown Column: {0}", [fieldname]));
      }
    }
    return docfield[0];
  },

  get_from_localstorage: function (doctype) {
    if (localStorage["_doctype:" + doctype]) {
      return JSON.parse(localStorage["_doctype:" + doctype]);
    }
  },

  set_in_localstorage: function (doctype, docs) {
    try {
      localStorage["_doctype:" + doctype] = JSON.stringify(docs);
    } catch (e) {
      // if quota is exceeded, clear local storage and set item
      console.warn("localStorage quota exceeded, clearing doctype cache");
      window.desk.model?.clear_local_storage();
      localStorage["_doctype:" + doctype] = JSON.stringify(docs);
    }
  },

  clear_local_storage: () => {
    for (var key in localStorage) {
      if (key.startsWith("_doctype:")) {
        localStorage.removeItem(key);
      }
    }
  },

  sync: (r: any) => {
    /* docs:
      extract docs, docinfo (attachments, comments, assignments)
      from incoming request and set in `locals` and `frappe.model.docinfo`
    */
    var isPlain;
    if (!r.docs && !r.docinfo) r = { docs: r };

    isPlain = Object.prototype.toString.call(r.docs) === "[object Object]";
    if (isPlain) r.docs = [r.docs];

    if (r.docs) {
      for (var i = 0, l = r.docs.length; i < l; i++) {
        var d = r.docs[i];

        if (locals[d.doctype] && locals[d.doctype][d.name]) {
          // update values
          model.update_in_locals(d);
        } else {
          model.add_to_locals(d);
        }

        d.__last_sync_on = new Date();

        if (d.doctype === "DocType") {
          desk.meta.sync(d);
        }

        if (d.localname) {
          model.rename_after_save(d, i);
        }
      }
    }

    model.sync_docinfo(r);
    return r.docs;
  },

  rename_after_save: (d, i) => {
    model.new_names[d.localname] = d.name;
    $(document).trigger("rename", [d.doctype, d.localname, d.name]);
    delete locals[d.doctype][d.localname];

    // update docinfo to new dict keys
    if (i === 0) {
      model.docinfo[d.doctype][d.name] = model.docinfo[d.doctype][d.localname];
      model.docinfo[d.doctype][d.localname] = undefined;
    }
  },

  sync_docinfo: (r) => {
    // set docinfo (comments, assign, attachments)
    if (r.docinfo) {
      const { doctype, name } = r.docinfo;
      if (!model.docinfo[doctype]) {
        model.docinfo[doctype] = {};
      }
      model.docinfo[doctype][name] = r.docinfo;

      desk.provide("dash.boot.user_info");
      Object.assign(dash.boot.user_info, r.docinfo.user_info);
    }

    return r.docs;
  },

  add_to_locals: (doc: any) => {
    if (!locals[doc.doctype]) locals[doc.doctype] = {};

    if (!doc.name && doc.__islocal) {
      // get name (local if required)
      if (!doc.parentfield) model.clear_doc(doc);

      doc.name = model.get_new_name(doc.doctype);

      if (!doc.parentfield)
        desk.provide("desk.model.docinfo." + doc.doctype + "." + doc.name);
    }

    locals[doc.doctype][doc.name] = doc;

    let meta = desk.meta.get_meta(doc.doctype);
    let is_table = meta ? meta.istable : doc.parentfield;
    // add child docs to locals
    if (!is_table) {
      for (var i in doc) {
        var value = doc[i];

        if (Array.isArray(value)) {
          for (var x = 0, y = value.length; x < y; x++) {
            var d = value[x];

            if (typeof d == "object" && !d.parent) d.parent = doc.name;

            model.add_to_locals(d);
          }
        }
      }
    }
  },

  update_in_locals: function (doc: Document) {
    let local_doc = locals[doc.doctype ?? ""][doc.name ?? ""];
    let clear_keys = function (
      source: Record<string, any>,
      target: Record<string, any>,
    ) {
      Object.keys(target).map((key) => {
        if (source[key] == undefined) delete target[key];
      });
    };

    for (let fieldname in doc) {
      let df = desk.meta.get_field(doc.doctype, fieldname);
      if (df && desk.model.table_fields.includes(df.fieldtype)) {
        // table
        if (!(doc[fieldname] instanceof Array)) {
          doc[fieldname] = [];
        }

        if (!(local_doc[fieldname] instanceof Array)) {
          local_doc[fieldname] = [];
        }

        // child table, override each row and append new rows if required
        for (let i = 0; i < doc[fieldname].length; i++) {
          let d = doc[fieldname][i];
          let local_d = local_doc[fieldname][i];
          if (local_d) {
            // deleted and added again
            if (!locals[d.doctype]) locals[d.doctype] = {};

            if (!d.name) {
              // incoming row is new, find a new name
              d.name = desk.model.get_new_name(doc.doctype);
            }

            // if incoming row is not registered, register it
            if (!locals[d.doctype][d.name]) {
              // detach old key
              delete locals[d.doctype][local_d.name];

              // re-attach with new name
              locals[d.doctype][d.name] = local_d;
            }

            // row exists, just copy the values
            Object.assign(local_d, d);
            clear_keys(d, local_d);
          } else {
            local_doc[fieldname].push(d);
            if (!d.parent) d.parent = doc.name;
            desk.model.add_to_locals(d);
          }
        }

        // remove extra rows
        if (local_doc[fieldname].length > doc[fieldname].length) {
          for (
            let i = doc[fieldname].length;
            i < local_doc[fieldname].length;
            i++
          ) {
            // clear from local
            let d = local_doc[fieldname][i];
            if (locals[d.doctype] && locals[d.doctype][d.name]) {
              delete locals[d.doctype][d.name];
            }
          }
          local_doc[fieldname].length = doc[fieldname].length;
        }
      } else {
        // literal
        local_doc[fieldname] = doc[fieldname];
      }
    }

    if (local_doc?.on_paste_event && local_doc?.__newname) {
      doc.__newname = local_doc.__newname;
    }

    // clear keys on parent
    clear_keys(doc, local_doc);
  },

  set_default_values: async function (
    doc: Document,
    parent_doc: Document | null,
  ) {
    let doctype = doc.doctype;
    let docfields = (await getMeta(doctype ?? ""))?.fields || [];
    let updated: string[] = [];

    // Table types should be initialized
    let fieldtypes_without_default = desk.model.no_value_type.filter(
      (fieldtype) => !desk.model.table_fields.includes(fieldtype),
    );
    docfields.forEach((f) => {
      if (
        fieldtypes_without_default.includes(f.fieldtype) ||
        doc[f.fieldname] != null ||
        f.no_default
      ) {
        return;
      }

      let v: string | number | undefined = f.default;
      if (v) {
        if (["Int", "Check"].includes(f.fieldtype)) v = cint(v);
        else if (["Currency", "Float"].includes(f.fieldtype)) v = flt(v);

        doc[f.fieldname] = v;
        updated.push(f.fieldname);
      } else if (
        f.fieldtype == "Select" &&
        f.options &&
        typeof f.options === "string" &&
        !["[Select]", "Loading..."].includes(f.options)
      ) {
        doc[f.fieldname] = f.options.split("\n")[0];
      }
    });
    return updated;
  },

  get_new_doc: function (
    doctype: string,
    parent_doc: Document | null = null,
    parentfield: string | null = null,
    with_mandatory_children: boolean = false,
  ) {
    desk.provide("locals." + doctype);
    var doc: Document = {
      docstatus: 0,
      doctype: doctype,
      name: desk.model.get_new_name(doctype),
      __islocal: 1,
      __unsaved: 1,
      owner: desk.session.user,
    };
    desk.model.set_default_values(doc, parent_doc);

    if (parent_doc) {
      Object.assign(doc, {
        parent: parent_doc.name,
        parentfield: parentfield,
        parenttype: parent_doc.doctype,
      });
      if (parentfield) {
        if (!parent_doc[parentfield]) parent_doc[parentfield] = [];
        doc.idx = parent_doc[parentfield].length + 1;
        parent_doc[parentfield].push(doc);
      }
    } else {
      desk.provide("desk.model.docinfo." + doctype + "." + doc.name);
    }

    desk.model.add_to_locals(doc);

    if (with_mandatory_children) {
      desk.model.create_mandatory_children(doc);
    }

    if (!parent_doc) {
      doc.__run_link_triggers = 1;
    }

    // set the name if called from a link field
    if (desk.route_options && desk.route_options.name_field) {
      var meta = desk.get_meta(doctype);
      // set title field / name as name
      if (meta.autoname && meta.autoname.indexOf("field:") !== -1) {
        doc[meta.autoname.substr(6)] = desk.route_options.name_field;
      } else if (meta.autoname && meta.autoname === "prompt") {
        doc.__newname = desk.route_options.name_field;
      } else if (meta.title_field) {
        doc[meta.title_field] = desk.route_options.name_field;
      }

      delete desk.route_options.name_field;
    }

    // set route options
    if (desk.route_options && !doc.parent) {
      $.each(desk.route_options, function (fieldname, value) {
        var df = desk.meta.has_field(doctype, fieldname);
        if (df && !df.no_copy) {
          doc[fieldname] = value;
        }
      });
      desk.route_options = null;
    }

    return doc;
  },

  make_new_doc_and_get_name: function (
    doctype: string,
    with_mandatory_children: boolean,
  ) {
    return desk.model.get_new_doc(doctype, null, null, with_mandatory_children)
      .name;
  },

  get_new_name: function (doctype: string) {
    // random hash is added to idenity mislinked files when doc is not saved and file is uploaded.
    return desk.utils.slug(`new-${doctype}-${desk.utils.get_random(10)}`);
  },

  with_doctype: function (
    doctype: string,
    callback: ((doc: any) => void) | undefined = undefined,
    async: boolean = false,
  ) {
    if (locals.DocType[doctype]) {
      callback && callback(locals.DocType[doctype]);
      return Promise.resolve();
    } else {
      let cached_timestamp = null;
      let cached_doc = null;

      let cached_docs = desk.model.get_from_localstorage(doctype);

      if (cached_docs && !Array.isArray(cached_docs)) {
        cached_docs = [cached_docs];
      }

      if (cached_docs) {
        cached_doc = cached_docs.filter((doc: any) => doc.name === doctype)[0];
        if (cached_doc) {
          cached_timestamp = cached_doc.modified;
        }
      }

      return resource.call({
        method: "desktop.meta.get_meta",
        args: {
          doctype,
        },
        async: async,
        callback: function (r) {
          if (r.exc) {
            dialog.alert(__("Unable to load doctype {0}", [doctype]));
            throw "No doctype";
          }
          if (r.message == "use_cache") {
            model.sync(cached_doc);
          } else {
            const docs = Array.isArray(r.message?.docs)
              ? r.message.docs
              : Array.isArray(r.message)
                ? r.message
                : [r.message];

            desk.model.set_in_localstorage(doctype, docs);

            for (const doc of docs) {
              if (doc?.doctype === "DocType" && doc?.name) {
                locals.DocType[doc.name] = doc;
              }
            }

            const primaryMeta =
              docs.find((doc: any) => doc?.name === doctype) || docs[0];
            if (primaryMeta) {
              r.message = primaryMeta;
            }
          }

          if (r.message?.name) {
            locals.DocType[r.message.name] = r.message;
          }
          desk.model.init_doctype(doctype);

          if (r.user_settings) {
            // remember filters and other settings from last view
            desk.model.user_settings[doctype] = JSON.parse(r.user_settings);
            desk.model.user_settings[doctype].updated_on = Date().toString();
          }
          callback && callback(r);
        },
      });
    }
  },

  init_doctype: function (doctype) {
    var meta = locals.DocType[doctype];
    for (const asset_key of [
      "__list__js",
      "__custom_list_js",
      "__calendar_js",
      "__map_js",
      "__tree_js",
    ]) {
      if (meta[asset_key]) {
        new Function(meta[asset_key])();
      }
    }

    if (meta.__form_js) {
      loadScript(meta, "form");
    }

    if (meta.__list__js) {
      loadScript(meta, "list");
    }

    if (meta.__templates) {
      Object.assign(desk.templates, meta.__templates);
    }
  },

  with_doc: function (doctype, name, callback) {
    return new Promise((resolve) => {
      if (!name) name = doctype; // single type
      if (
        locals[doctype] &&
        locals[doctype][name] &&
        desk.model.get_docinfo(doctype, name)
      ) {
        callback && callback(name);
        resolve(desk.get_doc(doctype, name));
      } else {
        return desk.call({
          method: "frappe.desk.form.load.getdoc",
          type: "GET",
          args: {
            doctype: doctype,
            name: name,
          },
          callback: function (r) {
            callback && callback(name, r);
            resolve(desk.get_doc(doctype, name));
          },
        });
      }
    });
  },

  get_docinfo: function (doctype, name) {
    return (
      (desk.model.docinfo[doctype] && desk.model.docinfo[doctype][name]) || null
    );
  },

  set_docinfo: function (doctype, name, key, value) {
    if (desk.model.docinfo[doctype] && desk.model.docinfo[doctype][name]) {
      desk.model.docinfo[doctype][name][key] = value;
    }
  },

  get_shared: function (doctype, name) {
    return desk.model.get_docinfo(doctype, name).shared;
  },

  get_server_module_name: function (doctype) {
    var dt = desk.model.scrub(doctype);
    var module = desk.model.scrub(locals.DocType[doctype].module);
    var app = desk.boot.module_app[module];
    return app + "." + module + ".doctype." + dt + "." + dt;
  },

  scrub: function (txt) {
    return txt.replace(/ /g, "_").toLowerCase(); // use to slugify or create a slug, a "code-friendly" string
  },

  unscrub: function (txt) {
    return (txt || "")
      .replace(/-|_/g, " ")
      .replace(/\w*/g, function (keywords) {
        return (
          keywords.charAt(0).toUpperCase() + keywords.substr(1).toLowerCase()
        );
      });
  },

  can_create: function (doctype) {
    return desk.boot.user.can_create.indexOf(doctype) !== -1;
  },

  can_select: function (doctype) {
    if (desk.boot.user) {
      return desk.boot.user.can_select.indexOf(doctype) !== -1;
    }
  },

  can_read: function (doctype) {
    if (desk.boot.user) {
      return desk.boot.user.can_read.indexOf(doctype) !== -1;
    }
  },

  can_write: function (doctype) {
    return desk.boot.user.can_write.indexOf(doctype) !== -1;
  },

  can_get_report: function (doctype) {
    return desk.boot.user.can_get_report.indexOf(doctype) !== -1;
  },

  can_delete: function (doctype) {
    if (!doctype) return false;
    return desk.boot.user.can_delete.indexOf(doctype) !== -1;
  },

  can_submit: function (doctype) {
    if (!doctype) return false;
    return desk.boot.user.can_submit.indexOf(doctype) !== -1;
  },

  can_cancel: function (doctype) {
    if (!doctype) return false;
    return desk.boot.user.can_cancel.indexOf(doctype) !== -1;
  },

  has_workflow: function (doctype) {
    return desk.get_list("Workflow", { document_type: doctype, is_active: 1 })
      .length;
  },

  is_submittable: function (doctype) {
    if (!doctype) return false;
    return locals.DocType[doctype] && locals.DocType[doctype].is_submittable;
  },

  is_table: function (doctype) {
    if (!doctype) return false;
    return locals.DocType[doctype] && locals.DocType[doctype].istable;
  },

  is_single: function (doctype) {
    if (!doctype) return false;
    return dash.boot.single_types.indexOf(doctype) != -1;
  },

  is_tree: function (doctype) {
    if (!doctype) return false;
    return locals.DocType[doctype] && locals.DocType[doctype].is_tree;
  },

  is_fresh(doc) {
    // returns true if document has been recently loaded (5 seconds ago)
    return doc && doc.__last_sync_on && new Date() - doc.__last_sync_on < 5000;
  },

  can_import: (doctype: string, frm?: Form, meta: any = null) => {
    if (meta && !meta.allow_import) return false;

    // system manager can always import
    if (desk.user_roles.includes("System Manager")) return true;

    if (frm) return frm.perm[0].import === 1;
    return dash.boot.user.can_import.indexOf(doctype) !== -1;
  },

  can_export: (doctype: string, frm?: Form) => {
    // system manager can always export
    if (desk.user_roles.includes("System Manager")) return true;

    if (frm) return frm.perm[0].export === 1;
    return dash.boot.user.can_export.indexOf(doctype) !== -1;
  },

  can_print: (doctype: string, frm?: Form) => {
    if (frm) return frm.perm[0].print === 1;
    return dash.boot.user.can_print.indexOf(doctype) !== -1;
  },

  can_email: (doctype: string, frm?: Form) => {
    if (frm) return frm.perm[0].email === 1;
    return dash.boot.user.can_email.indexOf(doctype) !== -1;
  },

  can_share: (doctype: string, frm?: Form) => {
    let disable_sharing = cint(desk.sys_defaults.disable_document_sharing);

    if (disable_sharing && desk.session.user !== "Administrator") {
      return false;
    }

    if (frm) {
      return frm.perm[0].share === 1;
    }
    return dash.boot.user.can_share.indexOf(doctype) !== -1;
  },

  get_list: function (doctype, filters) {
    var docsdict = locals[doctype] || locals[":" + doctype] || {};
    if (Object.keys(docsdict).length === 0) return [];
    return desk.utils.filter_dict(docsdict, filters);
  },

  get_value: (
    doctype: string,
    filters: Record<string, any>,
    fieldname: string,
    callback?: (value: any) => void,
  ) => {
    if (callback) {
      resource.call({
        method: "frappe.client.get_value",
        args: {
          doctype: doctype,
          fieldname: fieldname,
          filters: filters,
        },
        callback: function (r) {
          if (!r.exc) {
            callback(r.message);
          }
        },
      });
    } else {
      if (
        ["number", "string"].includes(typeof filters) &&
        locals[doctype] &&
        locals[doctype][filters]
      ) {
        return locals[doctype][filters][fieldname];
      } else {
        var l = model.get_list(doctype, filters);
        return l.length && l[0] ? l[0][fieldname] : null;
      }
    }
  },

  set_value: function (
    doctype: string,
    docname: string,
    fieldname: string,
    value: any,
    fieldtype: string,
    skip_dirty_trigger = false,
  ) {
    /* help: Set a value locally (if changed) and execute triggers */

    var doc;
    if ($.isPlainObject(doctype)) {
      // first parameter is the doc, shift parameters to the left
      doc = doctype;
      fieldname = docname;
      value = fieldname;
    } else {
      doc = locals[doctype] && locals[doctype][docname];
    }

    let to_update = fieldname;
    let tasks = [];
    if (!$.isPlainObject(to_update)) {
      to_update = {};
      to_update[fieldname] = value;
    }

    $.each(to_update, (key, value) => {
      if (doc && doc[key] !== value) {
        if (doc.__unedited && !(!doc[key] && !value)) {
          // unset unedited flag for virgin rows
          doc.__unedited = false;
        }

        doc[key] = value;
        tasks.push(() =>
          desk.model.trigger(key, value, doc, skip_dirty_trigger),
        );
      } else {
        // execute link triggers (want to reselect to execute triggers)
        if (["Link", "Dynamic Link"].includes(fieldtype) && doc) {
          tasks.push(() =>
            desk.model.trigger(key, value, doc, skip_dirty_trigger),
          );
        }
      }
    });

    return desk.run_serially(tasks);
  },

  on: function (doctype, fieldname, fn) {
    /* help: Attach a trigger on change of a particular field.
        To trigger on any change in a particular doctype, use fieldname as "*"
        */
    /* example: desk.model.on("Customer", "age", function(fieldname, value, doc) {
          if(doc.age < 16) {
                  desk.msgprint("Warning, Customer must atleast be 16 years old.");
            raise "CustomerAgeError";
          }
        }) */
    desk.provide("desk.model.events." + doctype);
    if (!desk.model.events[doctype][fieldname]) {
      desk.model.events[doctype][fieldname] = [];
    }
    desk.model.events[doctype][fieldname].push(fn);
  },

  trigger: function (
    fieldname: string,
    value: any,
    doc: any,
    skip_dirty_trigger = false,
  ) {
    const tasks: any[] = [];

    function enqueue_events(events) {
      if (!events) return;

      for (const fn of events) {
        if (!fn) continue;

        tasks.push(() => {
          const return_value = fn(fieldname, value, doc, skip_dirty_trigger);

          // if the trigger returns a promise, return it,
          // or use the default promise desk.after_ajax
          if (return_value && return_value.then) {
            return return_value;
          } else {
            return desk.after_server_call();
          }
        });
      }
    }

    if (desk.model.events[doc.doctype]) {
      enqueue_events(desk.model.events[doc.doctype][fieldname]);
      enqueue_events(desk.model.events[doc.doctype]["*"]);
    }

    return desk.run_serially(tasks);
  },

  get_doc: function (doctype: string, name: string) {
    if (!name) name = doctype;
    if ($.isPlainObject(name)) {
      var doc = model.get_list(doctype, name);
      return doc && doc.length ? doc[0] : null;
    }
    return locals[doctype] ? locals[doctype][name] : null;
  },

  get_children: function (
    doctype: string,
    parent: string,
    parentfield: string,
    filters?: any,
  ) {
    let doc;
    if ($.isPlainObject(doctype)) {
      doc = doctype;
      filters = parentfield;
      parentfield = parent;
    } else {
      doc = model.get_doc(doctype, parent);
    }

    var children = doc[parentfield] || [];
    if (filters) {
      return desk.utils.filter_dict(children, filters);
    } else {
      return children;
    }
  },

  clear_table: function (doc: any, parentfield: string) {
    for (const d of doc[parentfield] || []) {
      delete locals[d.doctype][d.name];
    }
    doc[parentfield] = [];
  },

  remove_from_locals: function (doctype: string, name: string) {
    this.clear_doc(doctype, name);
    if (desk.views.formview[doctype]) {
      delete desk.views.formview[doctype].frm.opendocs[name];
    }
  },

  clear_doc: function (doctype: string, name: string) {
    var doc = locals[doctype] && locals[doctype][name];
    if (!doc) return;

    var parent = null;
    if (doc.parenttype) {
      parent = doc.parent;
      var parenttype = doc.parenttype,
        parentfield = doc.parentfield;
    }
    delete locals[doctype][name];
    if (parent) {
      var parent_doc = locals[parenttype][parent];
      var newlist = [],
        idx = 1;
      $.each(parent_doc[parentfield], function (i, d) {
        if (d.name != name) {
          newlist.push(d);
          d.idx = idx;
          idx++;
        }
        parent_doc[parentfield] = newlist;
      });
    }
  },

  get_no_copy_list: (doctype: string) => {
    var no_copy_list = [
      "name",
      "amended_from",
      "amendment_date",
      "cancel_reason",
    ];

    var docfields = model.get_doc("DocType", doctype).fields || [];
    for (var i = 0, j = docfields.length; i < j; i++) {
      var df = docfields[i];
      if (cint(df.no_copy)) no_copy_list.push(df.fieldname);
    }

    return no_copy_list;
  },

  delete_doc: async (doctype: string, docname: string, callback: Function) => {
    let title = docname;
    const title_field = await getMeta(doctype).title_field;
    if (desk.get_meta(doctype).autoname == "hash" && title_field) {
      const value = desk.model.get_value(doctype, docname, title_field);
      if (value) {
        title = `${value} (${docname})`;
      }
    }
    dialog.confirm(__("Permanently delete {0}?", [title.bold()]));
  },

  get_full_column_name: (fieldname: string, doctype: string) => {
    if (fieldname.includes("`tab")) return fieldname;
    return "`tab" + doctype + "`.`" + fieldname + "`";
  },

  is_numeric_field: (fieldtype: any) => {
    if (!fieldtype) return;
    if (typeof fieldtype === "object") {
      fieldtype = fieldtype.fieldtype;
    }
    return desk.model.numeric_fieldtypes.includes(fieldtype);
  },
};
