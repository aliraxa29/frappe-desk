"""API endpoints for installed apps and doctypes."""

import os
import re
import subprocess

import frappe
from frappe import _
from frappe.core.doctype.scheduled_job_type.scheduled_job_type import sync_jobs
from frappe.installer import install_app as _install_app
from frappe.installer import remove_app as _remove_app

from desktop.constants import IGNORE_APPS


def _get_app_metadata(app_name: str) -> dict | None:
	try:
		app_hooks = frappe.get_hooks(app_name=app_name)

		app_title = app_hooks.get("app_title", [app_name])[0] if app_hooks.get("app_title") else app_name
		app_description = (
			app_hooks.get("app_description", [""])[0] if app_hooks.get("app_description") else ""
		)

		app_image = app_hooks.get("app_cover_image", [""])[0] if app_hooks.get("app_cover_image") else ""

		app_icon = app_hooks.get("app_icon", [""])[0] if app_hooks.get("app_icon") else ""

		return {
			"name": app_name,
			"title": app_title,
			"icon": app_icon,
			"image": app_image,
			"description": app_description,
			"module": app_name.replace("_", " ").title(),
		}
	except Exception as e:
		frappe.logger().debug(f"Error loading app {app_name}: {e!s}")
		return None


@frappe.whitelist(allow_guest=False)
def get_installed_apps():
	"""Get all installed applications with their metadata.

	Returns:
	        List of installed apps with title, description, icon, etc.
	"""
	apps = []

	try:
		installed_apps = frappe.get_installed_apps()

		for app_name in installed_apps:
			if app_name in IGNORE_APPS:
				continue

			app_info = _get_app_metadata(app_name)
			if app_info:
				apps.append(app_info)

		return apps
	except Exception as e:
		frappe.logger().error(f"Error fetching installed apps: {e!s}")
		return []


@frappe.whitelist(allow_guest=False)
def get_available_apps():
	"""Get bench apps that are not installed on this site."""
	try:
		installed = set(frappe.get_installed_apps())
		all_apps = frappe.get_all_apps(with_internal_apps=True)

		available = []
		for app_name in all_apps:
			if app_name in IGNORE_APPS or app_name in installed:
				continue

			app_info = _get_app_metadata(app_name)
			if app_info:
				available.append(app_info)

		available.sort(key=lambda x: x.get("title") or x.get("name"))
		return available
	except Exception as e:
		frappe.logger().error(f"Error fetching available apps: {e!s}")
		return []


@frappe.whitelist(allow_guest=False)
def install_app(app: str):
	"""Install an app available on bench into the current site.

	This function installs the app and syncs all related resources:
	- DocTypes and permissions
	- Scheduled jobs
	- Fixtures
	- Customizations (Custom Fields, Property Setters)
	- Dashboards

	Args:
	    app: The app name to install

	Returns:
	    Dict with status and message
	"""

	if not app:
		frappe.throw(_("App name is required"))

	if app in IGNORE_APPS:
		frappe.throw(_("This app cannot be installed"))

	if app not in frappe.get_all_apps(with_internal_apps=True):
		frappe.throw(_("App {0} not found on bench").format(app))

	if app in frappe.get_installed_apps():
		return {
			"status": "already_installed",
			"message": _(f"{app} is already installed"),
		}

	try:
		frappe.setup_module_map(include_all_apps=True)
		_install_app(app, verbose=False, set_as_patched=True, force=False)
		frappe.db.commit()
		frappe.clear_cache()

		if app not in frappe.get_installed_apps():
			frappe.logger().error(f"App {app} was installed but not found in get_installed_apps()")
			frappe.throw(_("Installation verification failed. Please check server logs."))

		return {"status": "installed", "message": _(f"{app} installed successfully")}

	except Exception as e:
		frappe.db.rollback()
		frappe.logger().error(f"App installation failed for {app}: {e!s}")
		frappe.throw(_("Installation failed: {0}").format(str(e)))

	finally:
		frappe.flags.in_migrate = False
		frappe.flags.in_install_app = False


@frappe.whitelist(allow_guest=False)
def uninstall_app(app: str):
	"""Uninstall an app from the current site.

	This function removes the app and all related resources:
	- DocTypes and their data
	- Module definitions
	- Scheduled jobs related to the app
	- Workspace, Reports, Pages linked to the app's modules

	Args:
	    app: The app name to uninstall

	Returns:
	    Dict with status and message
	"""
	frappe.only_for("System Manager")

	if not app:
		frappe.throw(_("App name is required"))

	if app in IGNORE_APPS:
		frappe.throw(_("This app cannot be uninstalled"))

	if app not in frappe.get_installed_apps():
		return {"status": "not_installed", "message": _(f"{app} is not installed")}

	try:
		frappe.flags.in_uninstall = True

		_remove_app(app, yes=True, no_backup=True)

		frappe.db.commit()

		sync_jobs()
		frappe.db.commit()

		frappe.clear_cache()

		if app in frappe.get_installed_apps():
			frappe.logger().error(f"App {app} was uninstalled but still found in get_installed_apps()")
			frappe.throw(_("Uninstallation verification failed. Please check server logs."))

		return {
			"status": "uninstalled",
			"message": _(f"{app} uninstalled successfully"),
		}

	except Exception as e:
		frappe.db.rollback()
		frappe.logger().error(f"App uninstallation failed for {app}: {e!s}")
		frappe.throw(_("Uninstallation failed: {0}").format(str(e)))

	finally:
		frappe.flags.in_uninstall = False


@frappe.whitelist(allow_guest=False)
def get_search_data():
	"""Get all searchable items (doctypes, modules, pages, etc.).

	This endpoint returns all data needed for global search/command dialog,
	similar to Frappe's awesome bar search.

	Returns:
	        Dict with keys: 'doctypes', 'modules', 'pages', 'recent'
	"""
	result = {
		"doctypes": [],
		"modules": [],
		"pages": [],
		"workspace": [],
		"recent": [],
	}

	try:
		doctypes = frappe.get_list(
			"DocType",
			fields=["name", "module", "label"],
			order_by="name asc",
			limit_page_length=500,
		)

		for doctype in doctypes:
			result["doctypes"].append(
				{
					"name": doctype.name,
					"label": doctype.label or doctype.name,
					"module": doctype.module,
					"type": "doctype",
				}
			)
	except Exception as e:
		frappe.logger().error(f"Error fetching doctypes: {e!s}")

	# Get all modules - skip if Module DocType doesn't exist
	try:
		# Try to fetch modules from database
		modules = frappe.db.get_list(
			"Module",
			fields=["name", "module_label", "description"],
			order_by="name asc",
		)

		for module in modules:
			result["modules"].append(
				{
					"name": module.name,
					"title": module.get("module_label") or module.name,
					"module_name": module.name,
					"description": module.get("description") or "",
					"type": "module",
				}
			)
	except Exception as e:
		frappe.logger().debug(f"Note: Module DocType not accessible: {e!s}")
		# This is OK - Module might not exist or might not be accessible
		# We still have doctypes which is the main requirement

	return result


@frappe.whitelist(allow_guest=False)
def get_module_doctypes(module_name):
	"""Get all doctypes in a specific module.

	Args:
	        module_name: Name of the module

	Returns:
	        List of doctypes in the module
	"""
	try:
		doctypes = frappe.get_list(
			"DocType",
			fields=["name", "label", "description", "module"],
			filters={
				"module": module_name,
			},
			order_by="label asc",
		)

		result = []
		for doctype in doctypes:
			result.append(
				{
					"name": doctype.name,
					"label": doctype.label or doctype.name,
					"description": doctype.description or "",
					"module": doctype.module,
				}
			)

		return result
	except Exception as e:
		frappe.logger().error(f"Error fetching module doctypes for {module_name}: {e!s}")
		return []


@frappe.whitelist(allow_guest=False)
def search_doctypes(query):
	"""Search for doctypes by name, label or description.

	Args:
	        query: Search query string

	Returns:
	        List of matching doctypes
	"""
	if not query or len(query) < 2:
		return []

	try:
		# Get all searchable doctypes first
		doctypes = frappe.get_list(
			"DocType",
			fields=["name", "label", "description", "module"],
			filters={
				"disabled": 0,
				"issingle": 0,
				"istable": 0,
			},
			limit_page_length=500,
		)

		query_lower = query.lower()
		results = []

		for doctype in doctypes:
			# Check if query matches name, label, or description
			name_match = query_lower in doctype.name.lower()
			label_match = query_lower in (doctype.label or "").lower()
			desc_match = query_lower in (doctype.description or "").lower()

			if name_match or label_match or desc_match:
				try:
					if frappe.has_permission(doctype.name, "read"):
						# Calculate relevance score
						score = 0
						if name_match:
							score += 3
						if label_match:
							score += 2
						if desc_match:
							score += 1

						results.append(
							{
								"name": doctype.name,
								"label": doctype.label or doctype.name,
								"description": doctype.description or "",
								"module": doctype.module,
								"score": score,
							}
						)
				except frappe.PermissionError:
					continue

		# Sort by relevance score (highest first)
		results.sort(key=lambda x: (-x.get("score", 0), x.get("label", "")))

		# Remove score from results before returning
		for item in results:
			item.pop("score", None)

		return results[:20]  # Limit to 20 results
	except Exception as e:
		frappe.logger().error(f"Error searching doctypes: {e!s}")
		return []


@frappe.whitelist()
def get_module_sidebar(app):
	"""Get sidebar items for a module.

	Tries to read items from a DocType named 'App Sidebar' (if installed).
	If that DocType does not exist, falls back to modules for that app.

	Returns:
	    dict: {
	        "source": "app_sidebar" | "modules",
	        "items": list of sidebar items
	    }
	"""
	try:
		if not frappe.db.exists("DocType", "App Sidebar"):
			return

		doc = frappe.get_doc("App Sidebar", app)
		items = doc.get("items")

		if items and len(items) > 0:
			result = []
			for it in items:
				result.append(
					{
						"name": it.get("name"),
						"label": it.get("label") or it.get("name"),
						"link_type": it.get("link_type"),
						"link_to": it.get("link_to"),
						"icon": it.get("icon"),
						"type": it.get("link_type"),
					}
				)
			return {"source": "app_sidebar", "items": result}
	except frappe.DoesNotExistError:
		# App Sidebar doesn't exist, fall back to modules
		pass
	except Exception as e:
		frappe.logger().debug(f"App Sidebar not found for {app}: {e!s}")

	# Fallback: Get modules for this app as sidebar items
	return get_modules_for_app(app)


def get_modules_for_app(app_name):
	"""Get modules for a given app as sidebar items.

	Returns modules belonging to this app.
	"""
	result = []

	try:
		# Get all Module Def records for this app
		modules = frappe.get_all(
			"Module Def",
			filters={"app_name": app_name},
			fields=["name", "module_name", "app_name"],
			order_by="name asc",
		)

		# Get workspace info for each module to get icons
		for module in modules:
			# Try to find a workspace for this module to get the icon
			workspace = frappe.db.get_value(
				"Workspace", {"module": module.name, "public": 1}, ["name", "icon"], as_dict=True
			)

			icon = workspace.icon if workspace else None

			result.append(
				{
					"name": module.name,
					"label": module.module_name or module.name,
					"icon": icon,
					"link_type": "Module",
					"link_to": module.name,
					"type": "Module",
				}
			)

		return {"source": "modules", "items": result}

	except Exception as e:
		frappe.logger().error(f"Error fetching modules for {app_name}: {e!s}")
		return {"source": "modules", "items": []}


@frappe.whitelist()
def get_module_content(module_name):
	"""Get module content (shortcuts, links, reports, etc.) from workspace.

	Args:
	    module_name: Name of the module

	Returns:
	    dict with shortcuts, cards, charts, number_cards, quick_lists, doctypes
	"""
	try:
		# Find workspace for this module
		workspace_name = frappe.db.get_value("Workspace", {"module": module_name, "public": 1}, "name")

		if workspace_name:
			content = _get_workspace_content_internal(workspace_name)
		else:
			content = {
				"name": module_name,
				"label": module_name,
				"shortcuts": [],
				"cards": [],
				"charts": [],
				"number_cards": [],
				"quick_lists": [],
			}

		# Also get doctypes for this module
		doctypes = frappe.get_all(
			"DocType",
			filters={"module": module_name, "istable": 0},
			fields=["name", "description"],
			order_by="name asc",
		)

		content["doctypes"] = [
			{
				"name": dt.name,
				"label": dt.label or dt.name,
				"description": dt.description,
				"link_type": "DocType",
				"type": "DocType",
			}
			for dt in doctypes
		]

		# Get reports for this module
		reports = frappe.get_all(
			"Report",
			filters={"module": module_name, "disabled": 0},
			fields=["name", "report_name", "report_type"],
			order_by="name asc",
		)

		content["reports"] = [
			{
				"name": r.name,
				"label": r.report_name or r.name,
				"report_type": r.report_type,
				"link_type": "Report",
				"type": "Report",
			}
			for r in reports
		]

		return content

	except Exception as e:
		frappe.logger().error(f"Error fetching module content for {module_name}: {e!s}")
		return {
			"name": module_name,
			"label": module_name,
			"shortcuts": [],
			"cards": [],
			"charts": [],
			"number_cards": [],
			"quick_lists": [],
			"doctypes": [],
			"reports": [],
		}


def _get_workspace_content_internal(workspace_name):
	"""Internal function to get workspace content."""
	try:
		shortcuts = frappe.get_all(
			"Workspace Shortcut", filters={"parent": workspace_name}, fields=["*"], order_by="idx asc"
		)

		# Get shortcuts
		shortcuts_list = []
		for shortcut in shortcuts:
			shortcuts_list.append(
				{
					"name": shortcut.link_to or shortcut.label,
					"label": shortcut.label or shortcut.link_to,
					"link_type": shortcut.type,
					"link_to": shortcut.link_to,
					"icon": shortcut.icon,
					"type": shortcut.type,
					"doc_view": shortcut.doc_view,
					"color": shortcut.color,
					"format": shortcut.format,
					"stats_filter": shortcut.stats_filter,
				}
			)

		# Get cards/links grouped by card breaks
		cards = []
		current_card = {"label": "Links", "links": []}

		for link in frappe.get_all(
			"Workspace Link", filters={"parent": workspace_name}, fields=["*"], order_by="idx asc"
		):
			if link.type == "Card Break":
				if current_card["links"]:
					cards.append(current_card)
				current_card = {"label": link.label or "Links", "icon": link.icon, "links": []}
			else:
				current_card["links"].append(
					{
						"name": link.link_to or link.label,
						"label": link.label or link.link_to,
						"link_type": link.link_type,
						"link_to": link.link_to,
						"icon": link.icon,
						"type": link.link_type,
						"description": link.description,
					}
				)

		if current_card["links"]:
			cards.append(current_card)

		# Get charts
		charts = []
		for chart in frappe.get_all(
			"Workspace Chart", filters={"parent": workspace_name}, fields=["*"], order_by="idx asc"
		):
			charts.append(
				{
					"name": chart.chart_name,
					"label": chart.label or chart.chart_name,
					"chart_name": chart.chart_name,
				}
			)

		# Get number cards
		number_cards = []
		for nc in frappe.get_all(
			"Workspace Number Card", filters={"parent": workspace_name}, fields=["*"], order_by="idx asc"
		):
			number_cards.append(
				{
					"name": nc.number_card_name,
					"label": nc.label or nc.number_card_name,
				}
			)

		# Get quick lists
		quick_lists = []
		for ql in frappe.get_all(
			"Workspace Quick List", filters={"parent": workspace_name}, fields=["*"], order_by="idx asc"
		):
			quick_lists.append(
				{
					"name": ql.document_type,
					"label": ql.label or ql.document_type,
					"document_type": ql.document_type,
					"quick_list_filter": ql.quick_list_filter,
				}
			)

		return {
			"name": workspace_name,
			"label": workspace_name,
			"icon": None,
			"shortcuts": shortcuts_list,
			"cards": cards,
			"charts": charts,
			"number_cards": number_cards,
			"quick_lists": quick_lists,
		}

	except Exception as e:
		frappe.logger().error(f"Error fetching workspace content for {workspace_name}: {e!s}")
		return {
			"name": workspace_name,
			"shortcuts": [],
			"cards": [],
			"charts": [],
			"number_cards": [],
			"quick_lists": [],
		}


@frappe.whitelist()
def get_workspace_content(workspace_name):
	"""Get workspace content (shortcuts, cards, charts, etc.).

	Args:
	    workspace_name: Name of the workspace

	Returns:
	    dict with shortcuts, cards, charts, number_cards, quick_lists
	"""
	return _get_workspace_content_internal(workspace_name)


def _get_module_from_app(app_name):
	"""Get the module name from app name.

	Tries to find Module Def that belongs to this app.
	"""
	try:
		# First, try to find Module Def with matching app_name
		modules = frappe.get_all("Module Def", filters={"app_name": app_name}, fields=["name"], limit=1)

		if modules:
			return modules[0].name

		# Fallback: Convert app_name to title case (e.g., 'erpnext' -> 'ERPNext')
		# Common patterns
		app_to_module = {
			"erpnext": "ERPNext",
			"frappe": "Frappe",
			"hrms": "HRMS",
			"hr": "HR",
			"crm": "CRM",
			"assets": "Assets",
			"buying": "Buying",
			"selling": "Selling",
			"stock": "Stock",
			"accounts": "Accounts",
			"manufacturing": "Manufacturing",
			"projects": "Projects",
			"setup": "Setup",
		}

		if app_name.lower() in app_to_module:
			return app_to_module[app_name.lower()]

		# Default: Title case the app name
		return app_name.replace("_", " ").title()

	except Exception:
		return app_name.replace("_", " ").title()


@frappe.whitelist(allow_guest=False)
def install_marketplace_app(repo_url: str, app_name: str | None = None):
	"""Install an app from marketplace using GitHub repository URL.

	This function:
	1. Extracts the app name from repo URL if not provided
	2. Runs 'bench get-app <repo_url>' to clone the repository
	3. Runs 'bench install-app <app_name>' to install on site
	4. Syncs resources (doctypes, jobs, fixtures, etc.)

	Args:
	    repo_url: GitHub repository URL (e.g., https://github.com/user/app.git)
	    app_name: Optional app name. If not provided, extracted from repo URL

	Returns:
	    Dict with status and message

	Raises:
	    frappe.PermissionError: If user doesn't have permission
	    frappe.ValidationError: If URL or installation fails
	"""

	# Check permissions
	if not frappe.has_permission("Desktop", "write"):
		frappe.throw(_("You do not have permission to install apps"))

	# Validate repo URL
	if not repo_url or not isinstance(repo_url, str):
		frappe.throw(_("Valid repository URL is required"))

	repo_url = repo_url.strip()

	# Validate URL format (basic HTTP/HTTPS GitHub validation)
	if not (repo_url.startswith("http://") or repo_url.startswith("https://")):
		frappe.throw(_("Repository URL must start with http:// or https://"))

	if "github.com" not in repo_url.lower() and "gitlab.com" not in repo_url.lower():
		frappe.throw(_("Only GitHub and GitLab repositories are currently supported"))

	# Extract app name from URL if not provided
	if not app_name:
		# Extract from URL: https://github.com/user/app.git -> app
		# or https://github.com/user/app -> app
		match = re.search(r"/([a-z0-9_-]+?)(?:\.git)?/?$", repo_url.lower())
		if match:
			app_name = match.group(1)
		else:
			frappe.throw(_("Could not extract app name from repository URL. Please provide app_name"))

	# Validate app name format
	if not re.match(r"^[a-z0-9_]+$", app_name):
		frappe.throw(_("Invalid app name format. Use lowercase letters, numbers, and underscores"))

	# Check if already installed
	if app_name in IGNORE_APPS:
		frappe.throw(_("This app cannot be installed"))

	if app_name in frappe.get_installed_apps():
		return {
			"status": "already_installed",
			"message": _(f"{app_name} is already installed"),
		}

	# Get bench directory
	try:
		bench_dir = frappe.utils.get_bench_path()
	except Exception:
		frappe.throw(_("Could not determine bench directory"))

	try:
		frappe.logger().info(f"Starting marketplace app installation: {app_name} from {repo_url}")

		# Step 1: Run 'bench get-app'
		get_app_cmd = ["bench", "get-app", repo_url]
		frappe.logger().info(f"Running: {' '.join(get_app_cmd)}")

		result = subprocess.run(
			get_app_cmd,
			cwd=bench_dir,
			capture_output=True,
			text=True,
			timeout=300,  # 5 minute timeout
		)

		if result.returncode != 0:
			error_msg = result.stderr or result.stdout or "Unknown error"
			frappe.logger().error(f"bench get-app failed: {error_msg}")
			frappe.throw(_("Failed to download app: {0}").format(error_msg))

		frappe.logger().info(f"Successfully cloned app: {app_name}")

		# Step 2: Run 'bench install-app'
		install_app_cmd = ["bench", "install-app", app_name, "--site", frappe.local.site]
		frappe.logger().info(f"Running: {' '.join(install_app_cmd)}")

		result = subprocess.run(
			install_app_cmd,
			cwd=bench_dir,
			capture_output=True,
			text=True,
			timeout=300,  # 5 minute timeout
		)

		if result.returncode != 0:
			error_msg = result.stderr or result.stdout or "Unknown error"
			frappe.logger().error(f"bench install-app failed: {error_msg}")
			frappe.throw(_("Failed to install app: {0}").format(error_msg))

		frappe.logger().info(f"Successfully installed app: {app_name}")

		# Step 3: Sync jobs and clear cache
		try:
			frappe.setup_module_map(include_all_apps=True)
			sync_jobs()
			frappe.clear_cache()
		except Exception as e:
			frappe.logger().warning(f"Failed to sync jobs/cache for {app_name}: {e}")
			# Don't fail installation if sync fails

		# Verify installation
		if app_name not in frappe.get_installed_apps():
			frappe.logger().error(f"App {app_name} was installed but not found in get_installed_apps()")
			frappe.throw(_("Installation verification failed. Please check server logs."))

		return {
			"status": "installed",
			"message": _(f"{app_name} has been installed successfully from marketplace"),
		}

	except subprocess.TimeoutExpired:
		frappe.logger().error(f"Installation timeout for {app_name}")
		frappe.throw(_("Installation timed out. Please try again later."))

	except frappe.exceptions.ValidationError:
		# Re-raise Frappe validation errors
		raise

	except Exception as e:
		frappe.logger().error(f"Marketplace app installation failed for {app_name}: {frappe.get_traceback()}")
		frappe.throw(_("Installation error: {0}").format(str(e)))
