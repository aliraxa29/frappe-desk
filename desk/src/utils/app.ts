import { __, get_languages } from "./translate";

export function initializeGlobals() {
    if (!window.desk) window.desk = {};
    window.get_languages = get_languages

    ;(globalThis as any).__ = __

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
}