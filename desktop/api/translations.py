"""Translation API endpoints for Desktop app."""

import frappe
from frappe.translate import get_all_translations


@frappe.whitelist(allow_guest=True)
def get_translations(lang: str = None):
    """Get all translations for a language.
    
    Args:
        lang: Language code (e.g., 'en', 'es', 'fr'). If not provided, uses current user language.
    
    Returns:
        Dictionary of translations
    """
    if not lang:
        lang = frappe.local.lang or 'en'
    
    try:
        translations = get_all_translations(lang)
        return {
            'lang': lang,
            'messages': translations
        }
    except Exception as e:
        frappe.log_error(f"Failed to load translations for {lang}: {str(e)}")
        return {
            'lang': lang,
            'messages': {}
        }


@frappe.whitelist(allow_guest=True)
def get_languages():
    """Get list of available languages.
    
    Returns:
        List of language dictionaries with 'label' and 'value'
    """
    from frappe.translate import get_lang_dict
    
    try:
        lang_dict = get_lang_dict()
        languages = []
        
        for lang in lang_dict.get('array', []):
            languages.append({
                'label': lang.get('label', lang.get('value')),
                'value': lang.get('value'),
                'language_name': lang.get('language_name', lang.get('label'))
            })
        
        return sorted(languages, key=lambda x: x['label'])
    except Exception as e:
        frappe.log_error(f"Failed to load languages: {str(e)}")
        return [{'label': 'English', 'value': 'en', 'language_name': 'English'}]
