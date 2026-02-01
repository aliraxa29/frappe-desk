import type { ListContext } from '@/types'

export const listRegistry = {
  lists: {} as Record<string, any[]>
}

export function defineList(doctype: string, handlers: any) {
  if (!listRegistry.lists[doctype]) {
    listRegistry.lists[doctype] = []
  }
  listRegistry.lists[doctype].push(handlers)
}

export function triggerListEvent(
  doctype: string,
  event: string,
  ctx: ListContext
) {
  const handlers = listRegistry.lists[doctype] || []

  for (const handler of handlers) {
    if (typeof handler[event] === 'function') {
      try {
        handler[event](ctx)
      } catch (error) {
        console.error(`Error in ${doctype}.${event}:`, error)
      }
    }
  }
}
