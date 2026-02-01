import "./style.css"

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initializeGlobals } from './utils/app'
import './utils/index'
initializeGlobals()


const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')