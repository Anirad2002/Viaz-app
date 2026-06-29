<template>
  <div class="scans-page">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <input v-model="search" class="search-input" placeholder="Szukaj skanów…" />
        <select v-model="statusFilter" class="filter-select">
          <option value="">Wszystkie statusy</option>
          <option value="completed">Zakończone</option>
          <option value="running">W trakcie</option>
          <option value="error">Błąd</option>
        </select>
      </div>
      <button class="btn-primary" @click="showNewScan = true">+ Nowy skan</button>
    </div>

    <div v-if="showNewScan" class="modal-overlay" @click.self="showNewScan = false">
      <div class="modal">
        <h3 class="modal-title">Szybki skan</h3>
        <p style="font-size:14px; color: var(--color-text-muted); margin-bottom: 16px;">Aby skonfigurować pełny skan z zakresem i harmonogramem, użyj kreatora konfiguracji.</p>
        <div class="form-row">
          <label>Nazwa skanu</label>
          <input class="field-input" v-model="newScanName" placeholder="np. Miesięczny audyt RODO" />
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="showNewScan = false">Anuluj</button>
          <button class="btn-primary" @click="launchQuickScan">Uruchom skan</button>
        </div>
      </div>
    </div>

    <div class="scans-table">
      <div class="table-header">
        <span class="col-name">Nazwa skanu</span>
        <span class="col-source">Źródło</span>
        <span class="col-status">Status</span>
        <span class="col-items">Elementy</span>
        <span class="col-date">Data</span>
        <span class="col-action"></span>
      </div>

      <div v-if="filteredScans.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">Nie znaleziono skanów</div>
        <div class="empty-sub">{{ search ? 'Spróbuj innego zapytania.' : 'Zacznij od podłączenia źródła i uruchomienia pierwszego skanu.' }}</div>
      </div>

      <RouterLink v-for="scan in filteredScans" :key="scan.id" :to="'/scans/' + scan.id" class="table-row">
        <span class="col-name"><span class="scan-name">{{ scan.name }}</span></span>
        <span class="col-source">
          <span class="source-type-badge">{{ sourceIcon(scan.sourceType) }}</span>
          {{ scan.source }}
        </span>
        <span class="col-status">
          <span class="status-chip" :class="scan.status">
            <span class="status-pulse" v-if="scan.status === 'running'"></span>
            {{ statusLabel(scan.status) }}
          </span>
        </span>
        <span class="col-items">
          <span v-if="scan.status === 'running'" class="shimmer-text">{{ scan.itemsFound }}…</span>
          <span v-else>{{ scan.itemsFound > 0 ? scan.itemsFound.toLocaleString() : '—' }}</span>
        </span>
        <span class="col-date">{{ formatDate(scan.createdAt) }}</span>
        <span class="col-action">
          <span v-if="scan.status === 'running'" class="progress-mini">
            <span class="pm-fill" :style="{ width: scan.progress + '%' }"></span>
          </span>
          <span v-else class="arrow">→</span>
        </span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app.js'

const store = useAppStore()
const search = ref('')
const statusFilter = ref('')
const showNewScan = ref(false)
const newScanName = ref('')

const filteredScans = computed(() => {
  return store.scans.filter(s => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.source.toLowerCase().includes(q)
    const matchStatus = !statusFilter.value || s.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

function statusLabel(s) {
  return { completed: 'Zakończony', running: 'W trakcie', error: 'Błąd', queued: 'W kolejce' }[s] || s
}

function sourceIcon(t) {
  return { database: '🐘', cloud: '☁️', upload: '📊', api: '🔌' }[t] || '📁'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function launchQuickScan() {
  const scan = {
    id: 's-' + Date.now(),
    name: newScanName.value || 'Nowy skan',
    source: 'Ręczne',
    sourceType: 'upload',
    status: 'running',
    progress: 5,
    createdAt: new Date().toISOString(),
    completedAt: null,
    itemsFound: 0,
    categories: [],
    results: [],
  }
  store.addScan(scan)
  showNewScan.value = false
  newScanName.value = ''
}
</script>

<style scoped>
.scans-page { display: flex; flex-direction: column; gap: 20px; }
.page-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.toolbar-left { display: flex; gap: 10px; flex: 1; }
.search-input, .filter-select {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 9px 14px; font-size: 14px;
  color: var(--color-text); font-family: var(--font-sans); outline: none; transition: border-color 0.15s;
}
.search-input { flex: 1; max-width: 320px; }
.search-input:focus, .filter-select:focus { border-color: var(--color-primary); }
.btn-primary { background: var(--color-primary); color: white; border: none; padding: 9px 18px; border-radius: var(--radius); font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font-sans); white-space: nowrap; }
.btn-primary:hover { background: #5558e3; }

.scans-table { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.table-header, .table-row { display: grid; grid-template-columns: 2fr 2fr 120px 80px 110px 60px; align-items: center; padding: 0 20px; gap: 16px; }
.table-header { padding: 12px 20px; background: var(--color-surface-2); border-bottom: 1px solid var(--color-border); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--color-text-muted); }
.table-row { padding: 16px 20px; border-bottom: 1px solid var(--color-border); text-decoration: none; color: var(--color-text); font-size: 14px; transition: background 0.15s; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--color-surface-2); }
.scan-name { font-weight: 500; }
.status-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status-chip.completed { background: rgba(16,185,129,0.15); color: #6ee7b7; }
.status-chip.running { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.status-chip.error { background: rgba(239,68,68,0.15); color: #fca5a5; }
.status-pulse { width: 7px; height: 7px; background: #a5b4fc; border-radius: 50%; animation: pulse 1.2s ease-in-out infinite; }
.shimmer-text { color: var(--color-text-muted); font-family: var(--font-mono); }
.progress-mini { display: block; height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden; width: 40px; }
.pm-fill { display: block; height: 100%; background: var(--color-primary); border-radius: 2px; }
.arrow { color: var(--color-text-muted); }
.col-name, .col-source { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-items { font-family: var(--font-mono); font-size: 13px; }
.col-date { font-size: 13px; color: var(--color-text-muted); }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 36px; margin-bottom: 12px; }
.empty-title { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.empty-sub { font-size: 14px; color: var(--color-text-muted); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 999; backdrop-filter: blur(2px); }
.modal { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 28px; width: 400px; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
.modal-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-row label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.field-input { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 10px 14px; font-size: 14px; color: var(--color-text); font-family: var(--font-sans); outline: none; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-ghost { background: none; border: none; color: var(--color-text-muted); padding: 9px 14px; cursor: pointer; font-size: 14px; font-family: var(--font-sans); }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@media (max-width: 768px) { .table-header, .table-row { grid-template-columns: 2fr 120px 80px 40px; } .col-source, .col-date { display: none; } }
</style>
