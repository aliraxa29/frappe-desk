import { model } from "@/data/model";
import { resource } from "./resource";

export interface DB {
  get_list: (doctype: string, args?: any) => Promise<unknown>;
  exists: (doctype: string, name: string) => Promise<boolean>;
  get_value: (
    doctype: string,
    filters: any,
    fieldname: string,
    callback: Function,
    parent_doc?: any,
  ) => void;
  get_single_value: (doctype: string, field: string) => Promise<any>;
  set_value: (
    doctype: string,
    docname: string,
    fieldname: string,
    value: any,
    callback?: Function,
  ) => void;
  get_doc(doctype: string, name: string, filters?: any): Promise<any>;
  insert: (doc: any) => Promise<any>;
  delete_doc: (doctype: string, name: string) => Promise<any>;
  count: (doctype: string, args?: any) => Promise<number>;
  get_link_options(
    doctype: string,
    txt?: string,
    filters?: any,
  ): Promise<unknown>;
}

export const db = {
  get_list: function (doctype: string, args: any = {}) {
    if (!args) {
      args = {};
    }
    args.doctype = doctype;
    if (!args.fields) {
      args.fields = ["name"];
    }
    if (!("limit" in args)) {
      args.limit = 20;
    }
    return new Promise((resolve) => {
      resource.call({
        method: "frappe.desk.reportview.get_list",
        args: args,
        type: "GET",
        callback: function (r) {
          resolve(r.message);
        },
      });
    });
  },

  exists: function (doctype: string, name: string) {
    return new Promise<boolean>((resolve) => {
      this.get_value(doctype, { name: name }, "name", (r: any) => {
        r && r.name ? resolve(true) : resolve(false);
      });
    });
  },

  get_value: function (
    doctype: string,
    filters: any,
    fieldname: string,
    callback: Function,
    parent_doc?: any,
  ) {
    return resource.call({
      method: "frappe.client.get_value",
      type: "GET",
      args: {
        doctype: doctype,
        fieldname: fieldname,
        filters: filters,
        parent: parent_doc,
      },
      callback: function (r) {
        callback && callback(r.message);
      },
    });
  },

  get_single_value: (doctype: string, field: string) => {
    return new Promise((resolve) => {
      resource
        .call({
          method: "frappe.client.get_single_value",
          args: { doctype, field },
          type: "GET",
        })
        .then((r) => resolve(r ? r.message : null));
    });
  },

  set_value: function (
    doctype: string,
    docname: string,
    fieldname: string,
    value: any,
    callback?: Function,
  ) {
    return resource.call({
      method: "frappe.client.set_value",
      args: {
        doctype: doctype,
        name: docname,
        fieldname: fieldname,
        value: value,
      },
      callback: function (r) {
        callback && callback(r.message);
      },
    });
  },

  get_doc(doctype: string, name: string) {
    return new Promise((resolve, reject) => {
      resource.call({
        method: "frappe.desk.form.load.getdoc",
        type: "POST",
        args: { doctype, name },
        callback: (response) => {
          if (!response) {
            reject(new Error(`No record found: ${doctype} - ${name}`));
            return;
          }
          model.sync(response);
          resolve(response);
        },
        error_callback: (error) => {
          console.error(`Failed to fetch ${doctype} (${name}):`, error);
          reject(error);
        },
      });
    });
  },

  insert: function (doc: any) {
    return resource.call({ method: "frappe.client.insert", args: { doc } });
  },

  delete_doc: function (doctype: string, name: string) {
    return new Promise((resolve) => {
      resource.call({
        method: "frappe.client.delete",
        args: { doctype, name },
        callback: (r) => resolve(r.message),
      });
    });
  },

  count: function (doctype: string, args: any = {}) {
    let filters = args.filters || {};
    let limit = args.limit;

    // has a filter with childtable?
    const distinct =
      Array.isArray(filters) &&
      filters.some((filter) => {
        return filter[0] !== doctype;
      });

    return resource.call({
      method: "frappe.desk.reportview.get_count",
      args: {
        doctype,
        filters,
        distinct,
        limit,
      },
    });
  },

  get_link_options(doctype: string, txt: string = "", filters: any = {}) {
    return new Promise((resolve) => {
      resource.call({
        type: "GET",
        method: "frappe.desk.search.search_link",
        args: {
          doctype,
          txt,
          filters,
        },
        callback(r) {
          resolve(r.message);
        },
      });
    });
  },
};
