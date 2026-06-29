<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
            <rect x="14" y="2" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
            <rect x="2" y="14" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
            <rect x="14" y="14" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
          </svg>
        </div>
        <span class="brand-name">viaz</span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/dashboard" class="nav-item" :class="{ active: route.path === '/dashboard' }">
          <span class="nav-icon">⬛</span>
          <span class="nav-label">Panel główny</span>
        </RouterLink>
        <RouterLink to="/scans" class="nav-item" :class="{ active: route.path.startsWith('/scans') }">
          <span class="nav-icon">🔍</span>
          <span class="nav-label">Skany</span>
        </RouterLink>
        <RouterLink to="/reports" class="nav-item" :class="{ active: route.path.startsWith('/reports') }">
          <span class="nav-icon">📄</span>
          <span class="nav-label">Raporty</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item settings-btn" @click="$router.push('/onboarding')">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">Uruchom konfigurację</span>
        </button>
      </div>
    </aside>

    <div class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <button class="icon-btn" @click="store.toggleDark()" :title="store.darkMode ? 'Tryb jasny' : 'Tryb ciemny'">
            {{ store.darkMode ? '☀️' : '🌙' }}
          </button>
          <div class="user-badge">
            <div class="avatar">O</div>
            <span class="user-name">Operator</span>
          </div>
        </div>
      </header>

      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app.js'

const store = useAppStore()
const route = useRoute()

const pageTitle = computed(() => {
  if (route.path === '/dashboard') return 'Panel główny'
  if (route.path === '/scans') return 'Skany'
  if (route.path === '/reports') return 'Raporty'
  if (route.path.startsWith('/scans/')) {
    const scan = store.getScan(route.params.id)
    return scan ? scan.name : 'Szczegóły skanu'
  }
  if (route.path.startsWith('/reports/')) {
    const report = store.getReport(route.params.id)
    return report ? report.title : 'Szczegóły raportu'
  }
  return 'Viaz'
})
</script>

<style scoped>
.app-layout { display: flex; min-height: 100vh; background: var(--color-bg); }

.sidebar {
  width: 220px; min-height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex; flex-direction: column;
  position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
}

.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--color-border);
}

.brand-icon { color: var(--color-primary); display: flex; align-items: center; }
.brand-name { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: var(--color-text); }

.sidebar-nav { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 2px; }

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius);
  color: var(--color-text-muted); text-decoration: none;
  font-size: 14px; font-weight: 500; transition: all 0.15s;
  border: none; background: none; cursor: pointer; width: 100%; text-align: left;
}

.nav-item:hover { background: var(--color-surface-2); color: var(--color-text); }
.nav-item.active { background: var(--color-primary-glow); color: var(--color-primary); }
.nav-icon { font-size: 16px; width: 20px; text-align: center; }

.sidebar-footer { padding: 12px; border-top: 1px solid var(--color-border); }
.settings-btn { color: var(--color-text-muted); }

.main-area { flex: 1; margin-left: 220px; display: flex; flex-direction: column; min-height: 100vh; }

.topbar {
  height: 60px; background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 28px; position: sticky; top: 0; z-index: 99;
}

.page-title { font-size: 17px; font-weight: 600; color: var(--color-text); }
.topbar-right { display: flex; align-items: center; gap: 12px; }

.icon-btn {
  background: none; border: 1px solid var(--color-border);
  border-radius: var(--radius); width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 16px; transition: background 0.15s;
}
.icon-btn:hover { background: var(--color-surface-2); }

.user-badge { display: flex; align-items: center; gap: 8px; }
.avatar {
  width: 32px; height: 32px; background: var(--color-primary);
  color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
}
.user-name { font-size: 14px; font-weight: 500; color: var(--color-text); }
.page-content { flex: 1; padding: 32px 28px; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-area { margin-left: 0; }
  .user-name { display: none; }
}
</style>
