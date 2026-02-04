import "./style.css"
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initializeGlobals } from './utils/app'
import './utils/index'
import { initializeLocalsGlobal } from "./utils/locals/localsGlobal"
import desk_object from "./plugins/desk_object"
import { realtime } from './utils/socketio/client'
import { initializeRealtimeNotifications } from './utils/socketio/notifications'

initializeGlobals()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

initializeLocalsGlobal(pinia)

const bootData = (window as any).dash?.boot || {}
realtime.init(bootData)

initializeRealtimeNotifications()

app.use(router)
app.use(desk_object)
app.mount('#app')