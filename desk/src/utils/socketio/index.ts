/**
 * Vue 3 Composable for Socket.IO realtime operations
 * Provides hooks for document/list subscriptions with automatic cleanup
 */

import { onMounted, onUnmounted, watch } from 'vue'
import { realtime } from './client'

/**
 * Hook into document changes
 */
export function useDocRealtime(
    doctype: () => string,
    docname: () => string,
    onUpdate: (data: any) => void
) {
    const handleUpdate = (data: any) => {
        onUpdate(data)
    }

    onMounted(() => {
        if (doctype() && docname()) {
            realtime.docSubscribe(doctype(), docname(), handleUpdate)
            realtime.docOpen(doctype(), docname())
        }
    })

    onUnmounted(() => {
        if (doctype() && docname()) {
            realtime.docClose(doctype(), docname(), handleUpdate)
            realtime.docUnsubscribe(doctype(), docname(), handleUpdate)
        }
    })

    // Watch for doctype/docname changes
    watch([doctype, docname], ([newDoctype, newDocname], [oldDoctype, oldDocname]) => {
        if (oldDoctype && oldDocname) {
            realtime.docClose(oldDoctype, oldDocname, handleUpdate)
            realtime.docUnsubscribe(oldDoctype, oldDocname, handleUpdate)
        }

        if (newDoctype && newDocname) {
            realtime.docSubscribe(newDoctype, newDocname, handleUpdate)
            realtime.docOpen(newDoctype, newDocname)
        }
    })
}

/**
 * Hook into list changes
 */
export function useListRealtime(
    doctype: () => string,
    onUpdate: (data: any) => void
) {
    const handleUpdate = (data: any) => {
        onUpdate(data)
    }

    onMounted(() => {
        if (doctype()) {
            realtime.doctypeSubscribe(doctype(), handleUpdate)
        }
    })

    onUnmounted(() => {
        if (doctype()) {
            realtime.doctypeUnsubscribe(doctype(), handleUpdate)
        }
    })

    // Watch for doctype changes
    watch(doctype, (newDoctype, oldDoctype) => {
        if (oldDoctype) {
            realtime.doctypeUnsubscribe(oldDoctype, handleUpdate)
        }
        if (newDoctype) {
            realtime.doctypeSubscribe(newDoctype, handleUpdate)
        }
    })
}

/**
 * Hook into document viewers
 */
export function useDocViewers(
    doctype: () => string,
    docname: () => string,
    onViewersUpdate: (viewers: Array<{ user: string; full_name: string }>) => void
) {
    const handleViewersUpdate = (data: any) => {
        onViewersUpdate(data.viewers || [])
    }

    onMounted(() => {
        if (doctype() && docname()) {
            realtime.docOpen(doctype(), docname(), handleViewersUpdate)
        }
    })

    onUnmounted(() => {
        if (doctype() && docname()) {
            realtime.docClose(doctype(), docname(), handleViewersUpdate)
        }
    })

    watch([doctype, docname], ([newDoctype, newDocname], [oldDoctype, oldDocname]) => {
        if (oldDoctype && oldDocname) {
            realtime.docClose(oldDoctype, oldDocname, handleViewersUpdate)
        }
        if (newDoctype && newDocname) {
            realtime.docOpen(newDoctype, newDocname, handleViewersUpdate)
        }
    })
}

/**
 * Hook into task progress
 */
export function useTaskProgress(
    taskId: () => string,
    onProgress: (data: any) => void
) {
    const handleProgress = (data: any) => {
        onProgress(data)
    }

    onMounted(() => {
        if (taskId()) {
            realtime.taskSubscribe(taskId(), handleProgress)
        }
    })

    onUnmounted(() => {
        if (taskId()) {
            realtime.taskUnsubscribe(taskId(), handleProgress)
        }
    })

    watch(taskId, (newTaskId, oldTaskId) => {
        if (oldTaskId) {
            realtime.taskUnsubscribe(oldTaskId, handleProgress)
        }
        if (newTaskId) {
            realtime.taskSubscribe(newTaskId, handleProgress)
        }
    })
}

/**
 * Register global event listener
 */
export function useRealtimeEvent(
    event: string,
    onEvent: (data: any) => void
) {
    onMounted(() => {
        realtime.on(event, onEvent)
    })

    onUnmounted(() => {
        realtime.off(event, onEvent)
    })
}
