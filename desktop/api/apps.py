"""API endpoints for installed apps and doctypes."""

from desktop.constants import IGNORE_APPS
import frappe
from frappe import _


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
            try:
                if app_name in IGNORE_APPS:
                    continue

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
                
                app_icon = app_hooks.get("app_icon", [""])[0] if app_hooks.get("app_icon") else ""

                apps.append(
                    {
                        "name": app_name,
                        "title": app_title,
                        "icon": app_icon,
                        "image": app_image,
                        "description": app_description,
                        "module": app_name.replace("_", " ").title(),
                    }
                )
            except Exception as e:
                frappe.logger().debug(f"Error loading app {app_name}: {str(e)}")
                continue

        return apps
    except Exception as e:
        frappe.logger().error(f"Error fetching installed apps: {str(e)}")
        return []


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

    # Get all modules
    try:
        modules = frappe.get_list(
            "Module",
            fields=["name", "module_label", "description"],
            order_by="name asc",
        )

        for module in modules:
            result["modules"].append(
                {
                    "name": module.name,
                    "title": module.module_label or module.name,
                    "module_name": module.name,
                    "description": module.description or "",
                    "type": "module",
                }
            )
    except Exception as e:
        frappe.logger().error(f"Error fetching modules: {str(e)}")

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
