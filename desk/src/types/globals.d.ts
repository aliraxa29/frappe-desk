export { }

declare global {
    interface Window {
        desk?: any
        dash?: any
        
        // constants
        NEWLINE?: string
        TAB?: number
        UP_ARROW?: number
        DOWN_ARROW?: number
    }
}