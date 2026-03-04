import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app=createApp(App)
app.config.devtools=true
app.use(router)

app.mount('#app')

