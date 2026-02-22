import { provide } from "./provide";
import { __, get_languages } from "./translate";

export function initializeGlobals() {
  if (!window.desk) {
    window.desk = {} as Desk;
  }
  desk.provide = provide;
  desk.get_languages = get_languages;
  window.__ = __;

  desk.provide("desk.settings");
  desk.provide("desk.utils");
  desk.provide("desk.ui.form");
  desk.provide("desk.modules");
  desk.provide("desk.templates");
  desk.provide("desk.test_data");
  desk.provide("desk.utils");
  desk.provide("desk.model");
  desk.provide("desk.user");
  desk.provide("desk.session");
  desk.provide("locals.DocType");

  desk.provide("desk.listview_settings");
  desk.provide("desk.tour");
  desk.provide("desk.listview_parent_route");

  const boot = dash?.boot;
  if (boot) {
    dash.boot = boot;
    dash._messages = (window as any).dash?._messages || boot.__messages || {};

    // Set up commonly accessed boot properties as top-level desk properties
    // so model.ts references like desk.session.user, desk.user_roles work
    desk.session.user = dash.boot.user.name;
    desk.session.logged_in_user = dash.boot.user.name;
    desk.session.user_email = dash.boot.user.email;
    desk.session.user_fullname = desk.user.get_user_full_name();
    desk.user_defaults = dash.boot.user.defaults;
    desk.user_roles = dash.boot.user.roles;
    desk.sys_defaults = dash.boot.sysdefaults;
  }
}
