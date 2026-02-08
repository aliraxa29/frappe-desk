# Copyright (c) 2026, Ali Raza and contributors
# For license information, please see license.txt

from json import loads

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.modules.export_file import delete_folder, export_to_files
from frappe.utils import defaultdict, strip_html


class AppSidebar(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from desktop.desktop.doctype.app_sidebar_item.app_sidebar_item import AppSidebarItem

		app: DF.Literal[None]
		is_standard: DF.Check
		items: DF.Table[AppSidebarItem]
		module: DF.Link | None
		title: DF.Data
	# end: auto-generated types

	def autoname(self):
		self.name = self.app or self.title

	def validate(self):
		self.title = strip_html(self.title)
		for item in self.items:
			if not item.label:
				item.label = item.link_to

	def clear_cache(self):
		super().clear_cache()
		frappe.cache.delete_key("bootinfo")

	def on_update(self):
		if frappe.conf.developer_mode and self.is_standard:
			if self.module:
				export_to_files(record_list=[["App Sidebar", self.name]], record_module=self.module)

			if self.has_value_changed("title") or self.has_value_changed("module"):
				previous = self.get_doc_before_save()
				if previous and previous.get("module") and previous.get("title"):
					delete_folder(previous.get("module"), "App Sidebar", previous.get("title"))

	def after_delete(self):
		if self.module and frappe.conf.developer_mode:
			delete_folder(self.module, "App Sidebar", self.title)

	@staticmethod
	def get_module_wise_workspaces():
		workspaces = frappe.get_all(
			"App Sidebar",
			fields=["name", "module"],
			order_by="creation",
		)

		module_workspaces = defaultdict(list)

		for workspace in workspaces:
			if not workspace.module:
				continue
			module_workspaces[workspace.module].append(workspace.name)

		return module_workspaces
