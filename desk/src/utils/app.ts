import { __, get_languages } from "./translate";

export function initializeGlobals() {
  if (!window.desk) window.desk = {};
  window.get_languages = get_languages;
  (globalThis as any).__ = __;

  window.desk.provide = function (namespace: string) {
    // docs: create a namespace //
    var nsl = namespace.split(".");
    var parent = window;
    for (var i = 0; i < nsl.length; i++) {
      var n = nsl[i];
      if (!parent[n]) {
        parent[n] = {};
      }
      parent = parent[n];
    }
    return parent;
  };

  window.desk.provide("locals");
  window.desk.provide("desk.flags");
  window.desk.provide("desk.settings");
  window.desk.provide("desk.utils");
  window.desk.provide("desk.ui.form");
  window.desk.provide("desk.modules");
  window.desk.provide("desk.templates");
  window.desk.provide("desk.test_data");
  window.desk.provide("desk.utils");
  window.desk.provide("desk.model");
  window.desk.provide("desk.user");
  window.desk.provide("desk.session");
  // Don't provide these - they come from HTML boot data
  // window.desk.provide("desk._messages");
  window.desk.provide("locals.DocType");

  // for listviews
  window.desk.provide("desk.listview_settings");
  window.desk.provide("desk.tour");
  window.desk.provide("desk.listview_parent_route");

  // Bridge boot data: window.dash.boot → window.desk.boot
  // This makes boot data available to model.ts, formatters.ts, etc.
  // which reference desk.boot.user, desk.boot.sysdefaults, etc.
  const boot = (window as any).dash?.boot;
  if (boot) {
    window.desk.boot = boot;
    window.desk._messages =
      (window as any).dash?._messages || boot.__messages || {};

    // Set up commonly accessed boot properties as top-level desk properties
    // so model.ts references like desk.session.user, desk.user_roles work
    window.desk.session = {
      user: boot.user?.name || "Guest",
      user_email: boot.user?.email || "",
      user_fullname: boot.user?.first_name || "",
    };
    window.desk.user_roles = boot.user?.roles || [];
    window.desk.sys_defaults = boot.sysdefaults || {};
    window.desk.user_info = boot.user_info || {};
  }
}
