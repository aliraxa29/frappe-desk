/**
 * Notification handlers for Socket.IO realtime events
 * Handles msgprint, progress, task_progress, and other notifications
 */

import { realtime } from '../socketio/client'
import { useToastStore } from '../../stores/toast'
import { useDialogStore } from '../../stores/dialog'
import { ref } from 'vue'

/**
 * Initialize realtime notification handlers
 */
export function initializeRealtimeNotifications() {
    const toast = useToastStore()
    const dialog = useDialogStore()

    /**
     * Handle msgprint events - server-side messages
     */
    realtime.on('msgprint', (data: any) => {
        console.log('[Realtime] msgprint:', data)

        const message = data.message || ''
        const title = data.title || 'Notification'
        const indicator = data.indicator || 'info'

        // Determine toast type based on indicator
        let type: 'success' | 'error' | 'warning' | 'info' = 'info'
        if (indicator === 'green' || indicator === 'success') type = 'success'
        if (indicator === 'red' || indicator === 'error' || indicator === 'danger') type = 'error'
        if (indicator === 'yellow' || indicator === 'orange' || indicator === 'warning') type = 'warning'

        if (type === 'success') {
            toast.success(title, message)
        } else if (type === 'error') {
            toast.error(title, message)
        } else if (type === 'warning') {
            toast.warning(title, message)
        } else {
            toast.info(title, message)
        }
    })

    /**
     * Handle progress events - generic progress notifications
     */
    realtime.on('progress', (data: any) => {
        console.log('[Realtime] progress:', data)

        const percent = data.percent || 0
        const message = data.message || 'Processing...'
        const title = data.title || 'Progress'

        // Show progress dialog
        dialog.progress({
            title,
            message,
            percent: Math.min(percent, 100)
        })
    })

    /**
     * Handle task_progress events - background job progress
     */
    realtime.on('task_progress', (data: any) => {
        console.log('[Realtime] task_progress:', data)

        const taskId = data.task_id
        const percent = data.percent || 0
        const message = data.message || 'Processing...'

        // Update progress dialog with task-specific message
        dialog.progress({
            title: `Task ${taskId}`,
            message,
            percent: Math.min(percent, 100)
        })
    })

    /**
     * Handle task_status_change events
     */
    realtime.on('task_status_change', (data: any) => {
        console.log('[Realtime] task_status_change:', data)

        const taskId = data.task_id
        const status = data.status || 'unknown'

        // Show task status in toast
        const statusMessages: Record<string, string> = {
            'success': `Task ${taskId} completed successfully`,
            'error': `Task ${taskId} failed`,
            'cancelled': `Task ${taskId} was cancelled`,
            'pending': `Task ${taskId} is pending`,
            'running': `Task ${taskId} is running`
        }

        const message = statusMessages[status] || `Task ${taskId} status: ${status}`

        if (status === 'success') {
            toast.success(message)
        } else if (status === 'error') {
            toast.error(message)
        } else if (status === 'cancelled') {
            toast.warning(message)
        } else {
            toast.info(message)
        }
    })

    /**
     * Handle connection state changes
     */
    realtime.on('realtime:connected', () => {
        console.log('[Realtime] Connected to server')
        toast.show('Connected to server', 'success', { duration: 2000 })
    })

    realtime.on('realtime:disconnected', () => {
        console.log('[Realtime] Disconnected from server')
        toast.show('Disconnected from server', 'warning', { duration: 2000 })
    })
}

/**
 * Setup task progress tracking with callback
 */
export function useTaskProgress(taskId: string, onProgress: (percent: number) => void) {
    const progressRef = ref<number>(0)

    const handleTaskProgress = (data: any) => {
        if (data.task_id === taskId) {
            const percent = data.percent || 0
            progressRef.value = percent
            onProgress(percent)
        }
    }

    const handleTaskStatusChange = (data: any) => {
        if (data.task_id === taskId) {
            if (data.status === 'success') {
                progressRef.value = 100
                onProgress(100)
            }
        }
    }

    // Register handlers
    realtime.taskSubscribe(taskId, handleTaskProgress)
    realtime.on('task_status_change', handleTaskStatusChange)

    // Return cleanup function
    return {
        progress: progressRef,
        cleanup: () => {
            realtime.taskUnsubscribe(taskId)
            realtime.off('task_status_change', handleTaskStatusChange)
        }
    }
}

/**
 * Setup document info update tracking
 */
export function useDocInfoUpdates(
    doctype: string,
    docname: string,
    onUpdate: (data: any) => void
) {
    const handleDocInfoUpdate = (data: any) => {
        if (data.doctype === doctype && data.name === docname) {
            onUpdate(data.docinfo || {})
        }
    }

    // Register handler
    realtime.on('docinfo_update', handleDocInfoUpdate)

    // Return cleanup function
    return {
        cleanup: () => {
            realtime.off('docinfo_update', handleDocInfoUpdate)
        }
    }
}
