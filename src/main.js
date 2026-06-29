import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'
import router from './router'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(createVuestic({
  config: {
    colors: {
      variables: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        success: '#10b981',
        info: '#3b82f6',
        danger: '#ef4444',
        warning: '#f59e0b',
        backgroundPrimary: '#0f0f13',
        backgroundSecondary: '#16161d',
        backgroundBorder: '#2a2a38',
        textPrimary: '#f1f1f5',
        textInverted: '#0f0f13',
      }
    }
  }
}))
app.mount('#app')
