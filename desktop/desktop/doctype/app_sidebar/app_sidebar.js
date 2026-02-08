// Copyright (c) 2026, Ali Raza and contributors
// For license information, please see license.txt

frappe.ui.form.on("App Sidebar", {
	refresh(frm) {
		frappe.xcall("desktop.api.apps.get_installed_apps").then((r) => {
			let apps = r?.map((r) => r.name) || [];
			frm.set_df_property("app", "options", [...apps]);
		});
	},
});
