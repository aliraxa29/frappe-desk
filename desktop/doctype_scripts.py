import os

import frappe


def _load_script_content(script_path):
	"""Load script file content"""
	try:
		bench_path = frappe.get_bench_path()
		full_path = os.path.join(bench_path, script_path)

		if not os.path.exists(full_path):
			return None

		with open(full_path, encoding="utf-8") as f:
			content = f.read()

		# Add source map comment for debugging
		source_map = f"\n//# sourceURL={script_path}"

		return content + source_map
	except Exception as e:
		frappe.log_error(f"Error loading script {script_path}: {e!s}")
		return None


def _discover_script_files(dt_name, context="form"):
	"""Discover script file paths from app doctype folders.

	In Frappe, doctypes are organized under modules:
	  app_path/module_name/doctype/doctype_name/

	So we must traverse all module subdirectories within each app.
	"""
	scripts = []

	try:
		installed_apps = frappe.get_installed_apps()
	except Exception:
		installed_apps = []

	bench_path = frappe.get_bench_path()

	for app in installed_apps:
		try:
			app_module = frappe.get_app_module(app)
			app_path = os.path.dirname(app_module.__file__)

			# Iterate module subdirectories within the app
			for entry in os.listdir(app_path):
				module_path = os.path.join(app_path, entry)
				if not os.path.isdir(module_path):
					continue

				# Look for doctype folder inside this module
				doctype_path = os.path.join(module_path, "doctype", dt_name)

				if not os.path.exists(doctype_path):
					continue

				# Only load context-specific scripts (not generic .js/.ts which are
				# Frappe's standard old-style client scripts using frappe.ui.form.on)
				script_names = [
					f"{dt_name}.{context}.ts",  # e.g., invoice.form.ts
					f"{dt_name}.{context}.js",  # e.g., invoice.form.js
				]

				for script in script_names:
					script_file = os.path.join(doctype_path, script)
					if os.path.exists(script_file):
						# Store relative path from bench root
						relative_path = script_file.replace(bench_path + "/", "")
						scripts.append(relative_path)
		except Exception as e:
			frappe.log_error(f"Error finding scripts for {dt_name} in {app}: {e!s}")
			continue

	return scripts


def _discover_script_hooks(hook_key, doctype):
	"""Discover script file paths registered via hooks"""
	script_paths = []

	for app_name in frappe.get_installed_apps():
		hook_scripts = frappe.get_hooks(hook_key, default={}, app_name=app_name)
		if not hook_scripts:
			continue

		files = hook_scripts.get(doctype, [])
		if not isinstance(files, list):
			files = [files] if files else []

		for file in files:
			try:
				bench_path = frappe.get_bench_path() + "/"
				path = frappe.get_app_path(app_name, *file.strip("/").split("/"))
				relative_path = path.replace(bench_path, "")
				script_paths.append(relative_path)
			except Exception as e:
				frappe.log_error(f"Error processing hook {file} in {app_name}: {e!s}")
				continue

	return script_paths


def get_scripts_content(doctype, context="form"):
	"""
	Discover TypeScript/JavaScript scripts and load their content

	Similar to Frappe's __js, returns actual script content (not paths)

	Args:
	        doctype: The doctype name
	        context: 'form', 'list', or 'child'

	Returns:
	        String containing concatenated script content with source maps
	"""
	dt_name = doctype.lower().replace(" ", "_")

	# Method 1: Discover from file system
	file_paths = _discover_script_files(dt_name, context)

	# Method 2: Discover from hooks
	hook_key = f"desk_doctype_{context}_scripts"
	hook_paths = _discover_script_hooks(hook_key, doctype)

	# Combine and deduplicate (preserve order)
	all_paths = file_paths + hook_paths
	seen = set()
	unique_paths = []
	for path in all_paths:
		if path not in seen:
			seen.add(path)
			unique_paths.append(path)

	# Load and concatenate script content
	script_contents = []
	for script_path in unique_paths:
		content = _load_script_content(script_path)
		if content:
			script_contents.append(content)

	# Combine all scripts into single content string (like Frappe's __js)
	combined = "\n\n".join(script_contents)

	return combined if combined else None


@frappe.whitelist()
def get_scripts(doctype, context="form"):
	"""
	Get available TypeScript/JavaScript script content for a DocType

	Returns actual script content (like Frappe's __js field)

	Args:
	        doctype: The doctype name
	        context: 'form', 'list', or 'child'

	Returns:
	        String containing script content
	"""
	content = get_scripts_content(doctype, context)
	return {"content": content} if content else {"content": ""}


@frappe.whitelist()
def get_doctype_with_scripts(doctype, with_parent=False, cached_timestamp=None):
	"""
	Enhanced version of Frappe's getdoctype that includes TypeScript/JavaScript scripts

	Calls Frappe's getdoctype and appends TS/JS script content to response,
	similar to how __js contains JavaScript code

	Args:
	        doctype: The doctype name
	        with_parent: Include parent doctype
	        cached_timestamp: For cache checking

	Returns:
	        Metadata with added __ts_scripts and __ts_list_scripts containing actual script content
	"""
	# Call Frappe's getdoctype to get metadata
	from frappe.desk.form.load import getdoctype as frappe_getdoctype

	frappe_getdoctype(doctype, with_parent, cached_timestamp)
	if frappe.response.get("docs"):
		# Convert Document objects to dicts so we can inject custom keys
		docs_list = frappe.response["docs"]
		converted = []
		for i, doc in enumerate(docs_list):
			d = doc.as_dict() if hasattr(doc, "as_dict") else doc
			if i == 0:
				# Only inject scripts on the primary doctype
				form_content = get_scripts_content(doctype, "form")
				list_content = get_scripts_content(doctype, "list")
				d["__form_js"] = form_content if form_content else None
				d["__list_js"] = list_content if list_content else None
			converted.append(d)
		frappe.response["docs"] = converted

	return frappe.response
