import "./style.css"
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initializeGlobals } from './utils/app'
import './utils/index'
import { initializeLocalsGlobal } from "./utils/locals/localsGlobal"
import desk_object from "./plugins/desk_object"

initializeGlobals()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

initializeLocalsGlobal(pinia)

app.use(router)
app.use(desk_object)
app.mount('#app')