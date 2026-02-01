export interface SidebarItem {
  name: string
  label: string
  link_type?: string
  link_to?: string
  istable?: boolean
  type?: string
  icon?: string
  route?: string
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
