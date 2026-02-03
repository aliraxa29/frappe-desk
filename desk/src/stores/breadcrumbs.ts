import { defineStore } from "pinia"

export interface BreadcrumbItem {
    label: string
    route?: string
    icon?: string
    type?: 'app' | 'doctype' | 'document' | 'page' | 'report'
}

export const useBreadcrumbStore = defineStore("breadcrumbs", {
    state: () => ({
        items: [] as BreadcrumbItem[],
    }),

    getters: {
        // Get current app from breadcrumbs
        currentApp(): string | undefined {
            const appCrumb = this.items.find(item => item.type === 'app')
            return appCrumb?.label
        },
        
        // Get current doctype from breadcrumbs
        currentDoctype(): string | undefined {
            const doctypeCrumb = this.items.find(item => item.type === 'doctype')
            return doctypeCrumb?.label
        },
        
        // Check if there are any breadcrumbs
        hasBreadcrumbs(): boolean {
            return this.items.length > 0
        }
    },

    actions: {
        set(items: BreadcrumbItem[]) {
            this.items = items
        },

        push(item: BreadcrumbItem) {
            this.items.push(item)
        },
        
        // Set breadcrumbs for app view
        setForApp(app: string, appLabel?: string) {
            this.items = [
                { label: appLabel || app, route: `/${app}`, type: 'app' }
            ]
        },
        
        // Set breadcrumbs for list view
        setForList(app: string, doctype: string, doctypeLabel?: string) {
            this.items = [
                { label: formatLabel(app), route: `/${app}`, type: 'app' },
                { label: doctypeLabel || formatLabel(doctype), route: `/${app}/${doctype}`, type: 'doctype' }
            ]
        },
        
        // Set breadcrumbs for form view
        setForForm(app: string, doctype: string, name: string | null, doctypeLabel?: string) {
            this.items = [
                { label: formatLabel(app), route: `/${app}`, type: 'app' },
                { label: doctypeLabel || formatLabel(doctype), route: `/${app}/${doctype}`, type: 'doctype' },
                { label: name || 'New', type: 'document' }
            ]
        },
        
        // Set breadcrumbs for page view
        setForPage(app: string, pageName: string, pageLabel?: string) {
            this.items = [
                { label: formatLabel(app), route: `/${app}`, type: 'app' },
                { label: pageLabel || formatLabel(pageName), type: 'page' }
            ]
        },

        clear() {
            this.items = []
        }
    }
})

// Helper to format labels
function formatLabel(str: string): string {
    if (!str) return ''
    return str
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
}
