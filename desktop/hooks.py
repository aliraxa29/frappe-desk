app_name = "desktop"
app_title = "Desktop"
app_publisher = "Ali Raza"
app_description = "A frontend that replaces the frappe desk ui"
app_email = "ar.frappe.dev@gmail.com"
app_license = "mit"
app_cover_image = "/assets/desktop/images/no-image.png"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "desktop",
# 		"logo": "/assets/desktop/logo.png",
# 		"title": "Desktop",
# 		"route": "/desktop",
# 		"has_permission": "desktop.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/desktop/css/desktop.css"
# app_include_js = "/assets/desktop/js/desktop.js"

# include js, css files in header of web template
# web_include_css = "/assets/desktop/css/desktop.css"
# web_include_js = "/assets/desktop/js/desktop.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "desktop/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "desktop/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Website Route Rules
# -------------------
# Serve the Dashboard SPA for deep links under /dashboard
website_route_rules = [
	{"from_route": "/dashboard", "to_route": "dashboard"},
	{"from_route": "/dashboard/<path:app_path>", "to_route": "dashboard"},
]

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "desktop.utils.jinja_methods",
# 	"filters": "desktop.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "desktop.install.before_install"
# after_install = "desktop.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "desktop.uninstall.before_uninstall"
# after_uninstall = "desktop.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "desktop.utils.before_app_install"
# after_app_install = "desktop.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "desktop.utils.before_app_uninstall"
# after_app_uninstall = "desktop.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "desktop.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"desktop.tasks.all"
# 	],
# 	"daily": [
# 		"desktop.tasks.daily"
# 	],
# 	"hourly": [
# 		"desktop.tasks.hourly"
# 	],
# 	"weekly": [
# 		"desktop.tasks.weekly"
# 	],
# 	"monthly": [
# 		"desktop.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "desktop.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "desktop.event.get_events"
# }

# Whitelisted methods for API endpoints
whitelisted_methods = {
	"desktop.api.apps.get_installed_apps": "desktop.api.apps.get_installed_apps",
	"desktop.api.apps.get_available_apps": "desktop.api.apps.get_available_apps",
	"desktop.api.apps.install_app": "desktop.api.apps.install_app",
	"desktop.api.apps.uninstall_app": "desktop.api.apps.uninstall_app",
	"desktop.api.apps.get_search_data": "desktop.api.apps.get_search_data",
	"desktop.api.apps.get_module_doctypes": "desktop.api.apps.get_module_doctypes",
	"desktop.api.apps.search_doctypes": "desktop.api.apps.search_doctypes",
	"desktop.api.apps.get_module_sidebar": "desktop.api.apps.get_module_sidebar",
}
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "desktop.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["desktop.utils.before_request"]
# after_request = ["desktop.utils.after_request"]

# Job Events
# ----------
# before_job = ["desktop.utils.before_job"]
# after_job = ["desktop.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"desktop.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []

