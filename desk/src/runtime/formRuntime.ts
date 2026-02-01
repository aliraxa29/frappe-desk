import { registry } from './registry'

export function defineForm(doctype: string, handlers: any) {
  registry.forms[doctype] ??= []
  registry.forms[doctype].push(handlers)
}


export function triggerFormEvent(
  doctype: string,
  event: string,
  ctx: any
) {
  const handlers = registry.forms[doctype] || []

  for (const h of handlers) {
    if (typeof h[event] === 'function') {
      h[event](ctx)
    }
  }
}