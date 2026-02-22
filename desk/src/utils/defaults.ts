import { model } from "../data/model";
import { resource } from "./resource";

export interface Defaults {
  _user_permissions: Record<string, any>;
  __defaults: any;
  get_user_default(key: string): any;
  get_user_permission_default(key: string, _defaults: any): any;
  get_user_defaults(key: string): any[];
  get_global_default(key: string): any;
  get_global_defaults(key: string): any[];
  set_user_default_local(key: string, value: any): void;
  get_default(key: string): any;
  is_a_user_permission_key(key: string): boolean;
  in_user_permission(key: string, value: any): boolean;
  get_user_permissions(): Record<string, any>;
  update_user_permissions(): void;
  load_user_permission_from_boot(): void;
}

export const defaults = {
  _user_permissions: {} as Record<string, any>,

  get __defaults(): any {
    return dash.boot.user.defaults;
  },

  get_user_default: function (key: string) {
    let _defaults = this.__defaults;
    let d = _defaults[key];
    if (!d && this.is_a_user_permission_key(key)) {
      d = _defaults[desk.model.scrub(key)];
      // Check for default user permission values
      let user_default = this.get_user_permission_default(key, _defaults);
      if (user_default) d = user_default;
    }
    if (Array.isArray(d)) d = d[0];

    if (!this.in_user_permission(key, d)) {
      return;
    }

    return d;
  },

  get_user_permission_default: function (key: string, _defaults: any) {
    let permissions = this.get_user_permissions();
    let user_default = null;
    if (permissions[key]) {
      permissions[key].forEach((item: any) => {
        if (_defaults[key] == item.doc) {
          user_default = item.doc;
        }
      });

      permissions[key].forEach((item: any) => {
        if (item.is_default) {
          user_default = item.doc;
        }
      });
    }

    return user_default;
  },

  get_user_defaults: function (key: string) {
    var _defaults = this.__defaults;
    var d = _defaults[key];

    if (this.is_a_user_permission_key(key)) {
      if (d && Array.isArray(d) && d.length === 1) {
        // Use User Permission value when only when it has a single value
        d = d[0];
      } else {
        d = _defaults[key] || _defaults[model.scrub(key)];
      }
    }
    if (!Array.isArray(d)) d = [d];

    // filter out values which are not permitted to the user
    d = d.filter((item: any) => {
      if (this.in_user_permission(key, item)) {
        return item;
      }
    });
    return d;
  },
  get_global_default: function (key: string) {
    var d = window.dash.boot.sys_defaults[key];
    if (Array.isArray(d)) d = d[0];
    return d;
  },
  get_global_defaults: function (key: string) {
    var d = window.dash.boot.sys_defaults[key];
    if (!Array.isArray(d)) d = [d];
    return d;
  },
  set_user_default_local: function (key: string, value: any) {
    window.dash.boot.user.defaults[key] = value;
  },
  get_default: function (key: string) {
    var defaults = this.__defaults;
    var value = defaults[key];
    if (this.is_a_user_permission_key(key)) {
      if (value && Array.isArray(value) && value.length === 1) {
        value = value[0];
      } else {
        value = defaults[model.scrub(key)];
      }
    }

    if (!this.in_user_permission(key, value)) {
      return;
    }

    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  },

  is_a_user_permission_key: function (key: string) {
    return key.indexOf(":") === -1 && key !== model.scrub(key);
  },

  in_user_permission: function (key: string, value: any) {
    let user_permission = this.get_user_permissions()[model.unscrub(key)];

    if (user_permission && user_permission.length) {
      return user_permission.some((perm: any) => {
        return perm.doc === value;
      });
    } else {
      // there is no user permission for this doctype
      // so we can allow this doc i.e., value
      return true;
    }
  },

  get_user_permissions: function () {
    return this._user_permissions || {};
  },

  update_user_permissions: function () {
    const method =
      "frappe.core.doctype.user_permission.user_permission.get_user_permissions";
    resource.call({ method }).then((r) => {
      if (r.message) {
        this._user_permissions = Object.assign({}, r.message);
      }
    });
  },

  load_user_permission_from_boot: function () {
    if (this.__defaults) {
      this._user_permissions = Object.assign(
        {},
        window.dash.boot.user.user_permissions,
      );
    } else {
      this.update_user_permissions();
    }
  },
};
