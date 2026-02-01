import frappe
from frappe.sessions import get

def get_context(context):
	context.boot = get()
	context.csrf_token = frappe.session.data.csrf_token
	context.app_name = frappe.get_system_settings("app_name") or "My App"
	context.lang = frappe.local.lang
	context.layout_direction = frappe.local.lang == "ar" and "rtl" or "ltr"