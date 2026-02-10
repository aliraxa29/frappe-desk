import json

import frappe
from frappe.integrations.utils import make_post_request

from desktop.constants import MARKETPLACE_URL


@frappe.whitelist()
def get_marketplace_apps(filters=None, page=1, page_size=20, sort="modified", order="desc", search=None):
	"""
	Fetch marketplace apps from marketplace app with pagination and filtering support.

	Args:
	    filters: JSON string or dict with filter criteria (e.g., {"status": "Approved"})
	    page: Page number (1-indexed, default 1)
	    page_size: Number of items per page (default 20)
	    sort: Field to sort by (default "modified")
	    order: Sort order - "asc" or "desc" (default "desc")
	    search: Search text to filter by title, app_name, description, or tags

	Returns:
	    Dict containing:
	        - data: List of marketplace app documents
	        - total: Total count of all documents matching filters
	        - page: Current page number
	        - page_size: Items per page
	        - total_pages: Total number of pages
	"""
	try:
		# Build request parameters
		params = {"page": page, "page_size": page_size, "sort": sort, "order": order}

		# Add filters if provided
		if filters:
			if isinstance(filters, str):
				params["filters"] = filters
			else:
				params["filters"] = json.dumps(filters)

		# Add search if provided
		if search:
			params["search"] = search

		response = make_post_request(MARKETPLACE_URL + "/api/method/marketplace.api.get_apps", params=params)
		if response.get("message"):
			return response.get("message")
	except Exception as e:
		frappe.log_error(f"Error fetching marketplace apps: {e!s}")

	return {"data": [], "total": 0, "page": 1, "page_size": page_size, "total_pages": 0}
