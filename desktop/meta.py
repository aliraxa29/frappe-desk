import os
from frappe.desk.form.meta import FormMeta
from frappe.modules import get_module_path, scrub
from frappe.model.meta import get_parent_dt
from frappe.model import table_fields
import frappe

class DesktopMeta(FormMeta):
    def __init__(self, doctype, *, cached=True):
        super().__init__(doctype, cached=cached)
        self.load_form_assets()
    
    def load_form_assets(self):
        path = os.path.join(get_module_path(self.module), "doctype", scrub(self.name))
        def _get_path(fname):
            return os.path.join(path, scrub(fname))
        
        self._add_code(_get_path(self.name + ".form.ts"), "__form_ts")
        self._add_code(_get_path(self.name + ".list.ts"), "__list_ts")

    def as_dict(self, no_nulls=False):
        d = super().as_dict(no_nulls=no_nulls)
        d["__form_ts"] = self.get("__form_ts")
        d["__list_ts"] = self.get("__list_ts")
        return d


def _get_meta_bundle(doctype, cached=True):
    bundle = [DesktopMeta(doctype, cached=cached)]
    for df in bundle[0].fields:
        if df.fieldtype in table_fields and df.options:
            bundle.append(DesktopMeta(df.options, cached=cached))
    return bundle
        
        
@frappe.whitelist()
def get_meta(doctype, with_parent=False, cached=True, cached_timestamp=None):
	cached = cached and not frappe.conf.developer_mode
	parent_dt = None
	cache_key = "doctype_form_meta_bundle"
	cache_name = doctype

	if with_parent and (parent_dt := get_parent_dt(doctype)):
		cache_name = parent_dt

	if cached:
		bundle = frappe.cache.hget(cache_key, cache_name)
		if not bundle:
			bundle = _get_meta_bundle(cache_name, cached=False)
			frappe.cache.hset(cache_key, cache_name, bundle)
	else:
		bundle = _get_meta_bundle(cache_name, cached=cached)

	if cached_timestamp and bundle and bundle[0].modified == cached_timestamp:
		return "use_cache"

	response = {
		"docs": [doc.as_dict() for doc in bundle]
	}
	if parent_dt:
		response["parent_dt"] = parent_dt

	return response