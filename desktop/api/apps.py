"""API endpoints for installed apps and doctypes."""

from desktop.constants import IGNORE_APPS
import frappe
from frappe import _
from frappe.installer import install_app as _install_app
from frappe.installer import remove_app as _remove_app
from frappe.core.doctype.scheduled_job_type.scheduled_job_type import sync_jobs


def _get_app_metadata(app_name: str) -> dict | None:
    try:
        app_hooks = frappe.get_hooks(app_name=app_name)

        app_title = (
            app_hooks.get("app_title", [app_name])[0]
            if app_hooks.get("app_title")
            else app_name
        )
        app_description = (
            app_hooks.get("app_description", [""])[0]
            if app_hooks.get("app_description")
            else ""
        )

        app_image = (
            app_hooks.get("app_cover_image", [""])[0]
            if app_hooks.get("app_cover_image")
            else ""
        )

        app_icon = (
            app_hooks.get("app_icon", [""])[0] if app_hooks.get("app_icon") else ""
        )

        return {
            "name": app_name,
            "title": app_title,
            "icon": app_icon,
            "image": app_image,
            "description": app_description,
            "module": app_name.replace("_", " ").title(),
        }
    except Exception as e:
        frappe.logger().debug(f"Error loading app {app_name}: {str(e)}")
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
        frappe.logger().error(f"Error fetching installed apps: {str(e)}")
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
        frappe.logger().error(f"Error fetching available apps: {str(e)}")
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
            frappe.logger().error(
                f"App {app} was installed but not found in get_installed_apps()"
            )
            frappe.throw(
                _("Installation verification failed. Please check server logs.")
            )

        return {"status": "installed", "message": _(f"{app} installed successfully")}

    except Exception as e:
        frappe.db.rollback()
        frappe.logger().error(f"App installation failed for {app}: {str(e)}")
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
            frappe.logger().error(
                f"App {app} was uninstalled but still found in get_installed_apps()"
            )
            frappe.throw(
                _("Uninstallation verification failed. Please check server logs.")
            )

        return {
            "status": "uninstalled",
            "message": _(f"{app} uninstalled successfully"),
        }

    except Exception as e:
        frappe.db.rollback()
        frappe.logger().error(f"App uninstallation failed for {app}: {str(e)}")
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
        frappe.logger().error(f"Error fetching doctypes: {str(e)}")

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
        frappe.logger().debug(f"Note: Module DocType not accessible: {str(e)}")
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
        frappe.logger().error(
            f"Error fetching module doctypes for {module_name}: {str(e)}"
        )
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
        frappe.logger().error(f"Error searching doctypes: {str(e)}")
        return []


@frappe.whitelist()
def get_module_sidebar(app):
    """Get sidebar items for a module.

    Tries to read items from a DocType named 'App Sidebar' (if installed).
    If that DocType does not exist, falls back to returning the module's doctypes
    as simple sidebar entries.
    """
    try:
        items = frappe.get_doc("App Sidebar", app).get("items")

        result = []
        for it in items:
            result.append(
                {
                    "name": it.get("name"),
                    "label": it.get("label") or it.get("name"),
                    "link_type": it.get("link_type"),
                    "link_to": it.get("link_to"),
                }
            )

        return result
    except Exception as e:
        frappe.logger().error(f"Error fetching module sidebar for {app}: {str(e)}")
        return []
