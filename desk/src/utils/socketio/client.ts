/**
 * Socket.IO Realtime Client
 * Mirrors Frappe's RealTimeClient implementation for Vue 3 frontend
 * Handles document updates, list updates, task progress, and notifications
 */

import { io, Socket } from 'socket.io-client'
import type { DefaultEventsMap } from 'socket.io'

export interface RealtimeEventMap {
    msgprint: (data: { message: string; title?: string; indicator?: string }) => void
    progress: (data: { percent?: number; message?: string; title?: string }) => void
    task_progress: (data: { task_id: string; percent: number; message?: string }) => void
    task_status_change: (data: { task_id: string; status: string }) => void
    doc_update: (data: { doctype: string; name: string; doc?: Record<string, any> }) => void
    list_update: (data: { doctype: string; docname?: string }) => void
    docinfo_update: (data: { doctype: string; name: string; docinfo?: Record<string, any> }) => void
    doc_viewers: (data: { doctype: string; name: string; viewers: Array<{ user: string; full_name: string }> }) => void
    open_docs: (data: { docs: Array<{ doctype: string; name: string; user: string }> }) => void
    [key: string]: any
}

export class RealTimeClient {
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null
    sitename: string = ''
    userId: string = ''
    loggedIn: boolean = false
    private handlers: Map<string, Set<Function>> = new Map()
    private taskHandlers: Map<string, Set<Function>> = new Map()
    private docHandlers: Map<string, Set<Function>> = new Map()
    private doctypeHandlers: Map<string, Set<Function>> = new Map()
    private openDocs: Map<string, Set<Function>> = new Map()
    private progressHandlers: Map<string, Set<Function>> = new Map()

    constructor() {
        this.setupEventHandlers()
    }

    /**
     * Initialize Socket.IO connection with boot data
     */
    init(bootData: any) {
        if (this.socket?.connected) return

        this.sitename = bootData.sitename || 'default'
        this.userId = bootData.user || 'Guest'
        this.loggedIn = bootData.user !== 'Guest'

        if (!this.loggedIn) {
            console.warn('[Realtime] Guest user detected, skipping Socket.IO connection')
            return
        }

        const socketUrl = this.getSocketUrl()
        const namespaceUrl = `${socketUrl}/${this.sitename}`

        try {
            this.socket = io(namespaceUrl, {
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 1000,
                withCredentials: true,
                path: bootData.socketio_path || '/socket.io',
                extraHeaders: {
                    'X-Frappe-CSRF-Token': bootData.csrf_token || '',
                },
            })

            this.setupSocketEventHandlers()
            console.log('[Realtime] Socket.IO initialized for', this.sitename)
        } catch (error) {
            console.error('[Realtime] Failed to initialize Socket.IO:', error)
        }
    }

    /**
     * Get Socket.IO connection URL based on environment
     */
    private getSocketUrl(): string {
        const bootData = (window as any).dash?.boot || {}
        const socketioPort = bootData.socketio_port || 9000
        const socketioHost = bootData.socketio_host as string | undefined

        if (typeof window !== 'undefined' && (window as any).dev_server) {
            // Development: connect to localhost
            return `http://localhost:${socketioPort}`
        }

        const protocol = window.location.protocol === 'https:' ? 'https' : 'http'

        if (socketioHost) {
            return socketioPort ? `${protocol}://${socketioHost}:${socketioPort}` : `${protocol}://${socketioHost}`
        }

        if (socketioPort && String(socketioPort) !== window.location.port) {
            return `${protocol}://${window.location.hostname}:${socketioPort}`
        }

        // Production fallback: use current origin
        return `${protocol}://${window.location.host}`
    }

    /**
     * Setup core Socket.IO event handlers (connection, disconnect, etc.)
     */
    private setupSocketEventHandlers() {
        if (!this.socket) return

        this.socket.on('connect', () => {
            console.log('[Realtime] Connected to Socket.IO server')
            this.resubscribeAll()
            this.emit('realtime:connected')
        })

        this.socket.on('disconnect', () => {
            console.log('[Realtime] Disconnected from Socket.IO server')
            this.emit('realtime:disconnected')
        })

        this.socket.on('connect_error', (error: any) => {
            console.error('[Realtime] Connection error:', error)
        })

        this.socket.on('error', (error: any) => {
            console.error('[Realtime] Socket error:', error)
        })

        // Incoming real-time events from server
        this.socket.on('msgprint', (data: any) => {
            this.callHandlers('msgprint', data)
        })

        this.socket.on('progress', (data: any) => {
            this.callHandlers('progress', data)
        })

        this.socket.on('task_progress', (data: any) => {
            this.callHandlers('task_progress', data)
            if (data.task_id && this.taskHandlers.has(data.task_id)) {
                const handlers = this.taskHandlers.get(data.task_id)
                handlers?.forEach((handler: any) => handler(data))
            }
        })

        this.socket.on('task_status_change', (data: any) => {
            this.callHandlers('task_status_change', data)
        })

        this.socket.on('doc_update', (data: any) => {
            this.callHandlers('doc_update', data)
            const docKey = `${data.doctype}:${data.name}`
            if (this.docHandlers.has(docKey)) {
                const handlers = this.docHandlers.get(docKey)
                handlers?.forEach((handler: any) => handler(data))
            }
        })

        this.socket.on('list_update', (data: any) => {
            this.callHandlers('list_update', data)
            if (this.doctypeHandlers.has(data.doctype)) {
                const handlers = this.doctypeHandlers.get(data.doctype)
                handlers?.forEach((handler: any) => handler(data))
            }
        })

        this.socket.on('docinfo_update', (data: any) => {
            this.callHandlers('docinfo_update', data)
        })

        this.socket.on('doc_viewers', (data: any) => {
            this.callHandlers('doc_viewers', data)
            const docKey = `${data.doctype}:${data.name}`
            if (this.openDocs.has(docKey)) {
                const handlers = this.openDocs.get(docKey)
                handlers?.forEach((handler: any) => handler(data))
            }
        })
    }

    /**
     * Setup event handler storage
     */
    private setupEventHandlers() {
        this.handlers = new Map()
        this.taskHandlers = new Map()
        this.docHandlers = new Map()
        this.doctypeHandlers = new Map()
        this.openDocs = new Map()
        this.progressHandlers = new Map()
    }

    /**
     * Re-subscribe to all active rooms on reconnect
     */
    private resubscribeAll() {
        if (!this.socket?.connected) return

        // Document subscriptions
        this.docHandlers.forEach((_handlers: any, docKey: any) => {
            const [doctype, docname] = docKey.split(':')
            if (doctype && docname) {
                this.emit('doc_subscribe', doctype, docname)
            }
        })

        // Doctype list subscriptions
        this.doctypeHandlers.forEach((_handlers: any, doctype: any) => {
            if (doctype) {
                this.emit('doctype_subscribe', doctype)
            }
        })

        // Task progress subscriptions
        this.taskHandlers.forEach((_handlers: any, taskId: any) => {
            if (taskId) {
                this.emit('task_subscribe', taskId)
            }
        })

        // Progress subscriptions
        this.progressHandlers.forEach((_handlers: any, progressId: any) => {
            if (progressId) {
                this.emit('progress_subscribe', progressId)
            }
        })

        // Open document viewers
        this.openDocs.forEach((_handlers: any, docKey: any) => {
            const [doctype, docname] = docKey.split(':')
            if (doctype && docname) {
                this.emit('doc_open', doctype, docname)
            }
        })
    }

    /**
     * Register global event handler
     */
    on(event: string, callback: Function) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set())
        }
        this.handlers.get(event)?.add(callback)
    }

    /**
     * Unregister global event handler
     */
    off(event: string, callback?: Function) {
        if (!callback) {
            this.handlers.delete(event)
        } else {
            this.handlers.get(event)?.delete(callback)
        }
    }

    /**
     * Emit custom event to server
     */
    emit(event: string, ...args: any[]) {
        if (this.socket?.connected) {
            this.socket.emit(event, ...args)
        } else {
            console.warn(`[Realtime] Attempted to emit '${event}' while disconnected`)
        }
    }

    /**
     * Subscribe to document updates
     */
    docSubscribe(doctype: string, docname: string, callback: Function) {
        const docKey = `${doctype}:${docname}`
        if (!this.docHandlers.has(docKey)) {
            this.docHandlers.set(docKey, new Set())
            // Emit subscription to server
            this.emit('doc_subscribe', doctype, docname)
        }
        this.docHandlers.get(docKey)?.add(callback)
    }

    /**
     * Unsubscribe from document updates
     */
    docUnsubscribe(doctype: string, docname: string, callback?: Function) {
        const docKey = `${doctype}:${docname}`
        if (!callback) {
            this.docHandlers.delete(docKey)
            this.emit('doc_unsubscribe', doctype, docname)
        } else {
            const handlers = this.docHandlers.get(docKey)
            if (handlers) {
                handlers.delete(callback)
                if (handlers.size === 0) {
                    this.docHandlers.delete(docKey)
                    this.emit('doc_unsubscribe', doctype, docname)
                }
            }
        }
    }

    /**
     * Subscribe to list updates for a doctype
     */
    doctypeSubscribe(doctype: string, callback: Function) {
        if (!this.doctypeHandlers.has(doctype)) {
            this.doctypeHandlers.set(doctype, new Set())
            this.emit('doctype_subscribe', doctype)
        }
        this.doctypeHandlers.get(doctype)?.add(callback)
    }

    /**
     * Unsubscribe from list updates
     */
    doctypeUnsubscribe(doctype: string, callback?: Function) {
        if (!callback) {
            this.doctypeHandlers.delete(doctype)
            this.emit('doctype_unsubscribe', doctype)
        } else {
            const handlers = this.doctypeHandlers.get(doctype)
            if (handlers) {
                handlers.delete(callback)
                if (handlers.size === 0) {
                    this.doctypeHandlers.delete(doctype)
                    this.emit('doctype_unsubscribe', doctype)
                }
            }
        }
    }

    /**
     * Open a document (track viewers)
     */
    docOpen(doctype: string, docname: string, callback?: Function) {
        const docKey = `${doctype}:${docname}`
        if (callback) {
            if (!this.openDocs.has(docKey)) {
                this.openDocs.set(docKey, new Set())
            }
            this.openDocs.get(docKey)?.add(callback)
        }
        this.emit('doc_open', doctype, docname)
    }

    /**
     * Close a document (stop tracking viewers)
     */
    docClose(doctype: string, docname: string, callback?: Function) {
        const docKey = `${doctype}:${docname}`
        if (callback) {
            const handlers = this.openDocs.get(docKey)
            if (handlers) {
                handlers.delete(callback)
                if (handlers.size === 0) {
                    this.openDocs.delete(docKey)
                    this.emit('doc_close', doctype, docname)
                }
            }
        } else {
            this.openDocs.delete(docKey)
            this.emit('doc_close', doctype, docname)
        }
    }

    /**
     * Subscribe to task progress
     */
    taskSubscribe(taskId: string, callback: Function) {
        if (!this.taskHandlers.has(taskId)) {
            this.taskHandlers.set(taskId, new Set())
            this.emit('task_subscribe', taskId)
        }
        this.taskHandlers.get(taskId)?.add(callback)
    }

    /**
     * Unsubscribe from task progress
     */
    taskUnsubscribe(taskId: string, callback?: Function) {
        if (!callback) {
            this.taskHandlers.delete(taskId)
            this.emit('task_unsubscribe', taskId)
        } else {
            const handlers = this.taskHandlers.get(taskId)
            if (handlers) {
                handlers.delete(callback)
                if (handlers.size === 0) {
                    this.taskHandlers.delete(taskId)
                    this.emit('task_unsubscribe', taskId)
                }
            }
        }
    }

    /**
     * Subscribe to progress updates
     */
    progressSubscribe(progressId: string, callback: Function) {
        if (!this.progressHandlers.has(progressId)) {
            this.progressHandlers.set(progressId, new Set())
            this.emit('progress_subscribe', progressId)
        }
        this.progressHandlers.get(progressId)?.add(callback)
    }

    /**
     * Unsubscribe from progress updates
     */
    progressUnsubscribe(progressId: string, callback?: Function) {
        if (!callback) {
            this.progressHandlers.delete(progressId)
            this.emit('progress_unsubscribe', progressId)
        } else {
            const handlers = this.progressHandlers.get(progressId)
            if (handlers) {
                handlers.delete(callback)
                if (handlers.size === 0) {
                    this.progressHandlers.delete(progressId)
                    this.emit('progress_unsubscribe', progressId)
                }
            }
        }
    }

    /**
     * Call all registered handlers for an event
     */
    private callHandlers(event: string, data: any) {
        const handlers = this.handlers.get(event)
        if (handlers) {
            handlers.forEach((handler: any) => {
                try {
                    handler(data)
                } catch (error) {
                    console.error(`[Realtime] Error in handler for '${event}':`, error)
                }
            })
        }
    }

    /**
     * Disconnect from Socket.IO server
     */
    disconnect() {
        if (this.socket?.connected) {
            this.socket.disconnect()
            this.socket = null
        }
    }

    /**
     * Get connection status
     */
    isConnected(): boolean {
        return this.socket?.connected || false
    }
}

// Export singleton instance
export const realtime = new RealTimeClient()
