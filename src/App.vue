<template>
  <va-config :theme-name="store.darkMode ? 'dark' : 'light'">
    <div :class="['app-root', store.darkMode ? 'dark' : 'light']">
      <component :is="layout">
        <router-view />
      </component>
    </div>
  </va-config>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from './stores/app.js'

const BlankLayout = defineAsyncComponent(() => import('./components/BlankLayout.vue'))
const AppLayout = defineAsyncComponent(() => import('./components/AppLayout.vue'))

const route = useRoute()
const store = useAppStore()

const layout = computed(() => route.meta.layout === 'app' ? AppLayout : BlankLayout)
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --color-bg: #0f0f13;
  --color-surface: #16161d;
  --color-surface-2: #1e1e28;
  --color-border: #2a2a38;
  --color-text: #f1f1f5;
  --color-text-muted: #7c7c96;
  --color-primary: #6366f1;
  --color-primary-glow: rgba(99,102,241,0.2);
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 10px;
  --radius-lg: 16px;
}

.app-root.light {
  --color-bg: #f8f8fc;
  --color-surface: #ffffff;
  --color-surface-2: #f1f1f7;
  --color-border: #e2e2ef;
  --color-text: #16161d;
  --color-text-muted: #6c6c88;
}

body { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); }

.app-root { min-height: 100vh; background: var(--color-bg); color: var(--color-text); transition: background 0.3s, color 0.3s; }

/* Vuestic overrides */
.va-button { border-radius: var(--radius) !important; font-family: var(--font-sans) !important; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
</style>
