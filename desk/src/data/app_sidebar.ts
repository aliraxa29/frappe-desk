export interface SidebarItem {
  name: string
  label: string
  link_type?: string
  link_to?: string
  istable?: boolean
  issingle?: boolean
  type?: string
  icon?: string
  route?: string
  // Workspace-specific properties
  doc_view?: string  // For DocType shortcuts: List, Report Builder, Dashboard, Tree, New, Calendar, Kanban
  ref_doctype?: string  // For Report type
  workspace?: string  // Source workspace name
  color?: string
  format?: string
  stats_filter?: string
  description?: string
}

// Workspace shortcut item
export interface WorkspaceShortcut {
  name: string
  label: string
  link_type: string
  link_to: string
  icon?: string
  type: string
  doc_view?: string
  color?: string
  format?: string
  stats_filter?: string
}

// Workspace card with links
export interface WorkspaceCard {
  label: string
  icon?: string
  links: SidebarItem[]
}

// Workspace content structure
export interface WorkspaceContent {
  name: string
  label?: string
  icon?: string
  shortcuts: WorkspaceShortcut[]
  cards: WorkspaceCard[]
  charts: { name: string; label: string; chart_name: string }[]
  number_cards: { name: string; label: string }[]
  quick_lists: { name: string; label: string; document_type: string; quick_list_filter?: string }[]
}

// Basic sidebar configuration per module. This acts like a lightweight frontend 'doctype'
// for sidebar items. Server calls can override this structure.
export const APP_SIDEBARS: Record<string, SidebarItem[]> = {
  desktop: [
    { name: 'Notes', label: 'Notes', route: '/list/Note', icon: '📝', type: 'doctype' },
    { name: 'ToDo', label: 'To Do', route: '/list/ToDo', icon: '✅', type: 'doctype' },
    { name: 'Workspace', label: 'Workspace', route: '/workspace', icon: '🧭', type: 'page' }
  ],
  desk: [
    { name: 'Task', label: 'Tasks', route: '/list/Task', icon: '📋', type: 'doctype' },
    { name: 'Project', label: 'Projects', route: '/list/Project', icon: '📁', type: 'doctype' }
  ]
}
