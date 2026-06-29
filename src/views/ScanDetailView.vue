<template>
  <div v-if="scan" class="scan-detail">
    <div class="back-nav">
      <RouterLink to="/scans" class="back-link">← Wszystkie skany</RouterLink>
    </div>

    <div class="detail-header">
      <div class="dh-left">
        <h2 class="scan-title">{{ scan.name }}</h2>
        <div class="scan-meta">
          <span>{{ scan.source }}</span>
          <span class="meta-sep">·</span>
          <span>{{ formatDate(scan.createdAt) }}</span>
          <span v-if="scan.duration" class="meta-sep">·</span>
          <span v-if="scan.duration">{{ scan.duration }}</span>
        </div>
      </div>
      <span class="status-chip" :class="scan.status">
        <span class="status-pulse" v-if="scan.status === 'running'"></span>
        {{ statusLabel(scan.status) }}
      </span>
    </div>

    <div v-if="scan.status === 'running'" class="running-card">
      <div class="running-header">
        <span class="running-label">Skan w toku</span>
        <span class="running-pct">{{ scan.progress }}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: scan.progress + '%' }"></div>
      </div>
      <p class="running-note">Skanowanie tabel… {{ scan.itemsFound }} elementów znaleziono do tej pory</p>
    </div>

    <div v-if="scan.status === 'error'" class="error-card">
      <div class="error-icon">⚠️</div>
      <div>
        <div class="error-title">Skan nie powiódł się</div>
        <div class="error-msg">Nie udało się połączyć ze źródłem danych. Sprawdź dane uwierzytelniające i spróbuj ponownie.</div>
        <button class="btn-retry">Ponów skan</button>
      </div>
    </div>

    <div v-if="scan.status === 'completed'" class="stats-row">
      <div class="stat-card" v-for="stat in scanStats" :key="stat.label">
        <div class="stat-value" :class="stat.cls">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>

    <div v-if="scan.results?.length > 0" class="results-section">
      <div class="section-header">
        <h3 class="section-title">Wyniki</h3>
        <div class="filter-row">
          <button v-for="f in filterOptions" :key="f.val" class="filter-btn" :class="{ active: riskFilter === f.val }" @click="riskFilter = f.val">
            {{ f.label }}
          </button>
        </div>
      </div>
      <div class="results-table">
        <div class="rt-header">
          <span>Pole / Plik</span>
          <span>Kategoria</span>
          <span>Ryzyko</span>
          <span>Liczba</span>
        </div>
        <div class="rt-row" v-for="r in filteredResults" :key="r.id">
          <span class="rt-name">{{ r.name }}</span>
          <span class="rt-cat">{{ r.category }}</span>
          <span class="rt-risk risk-badge" :class="r.risk">{{ riskLabel(r.risk) }}</span>
          <span class="rt-count">{{ r.count.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    Skan nie został znaleziony. <RouterLink to="/scans">Wróć do skanów</RouterLink>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app.js'

const route = useRoute()
const store = useAppStore()
const scan = computed(() => store.getScan(route.params.id))
const riskFilter = ref('all')

const filterOptions = [
  { val: 'all', label: 'Wszystkie' },
  { val: 'high', label: 'Wysokie' },
  { val: 'medium', label: 'Średnie' },
  { val: 'low', label: 'Niskie' },
]

const scanStats = computed(() => {
  if (!scan.value) return []
  const high = scan.value.results.filter(r => r.risk === 'high').reduce((a, b) => a + b.count, 0)
  const med = scan.value.results.filter(r => r.risk === 'medium').reduce((a, b) => a + b.count, 0)
  return [
    { label: 'Łącznie elementów', value: scan.value.itemsFound.toLocaleString() },
    { label: 'Wysokie ryzyko', value: high.toLocaleString(), cls: 'val-danger' },
    { label: 'Średnie ryzyko', value: med.toLocaleString(), cls: 'val-warn' },
    { label: 'Kategorie', value: scan.value.categories.length },
    { label: 'Czas trwania', value: scan.value.duration || '—' },
  ]
})

const filteredResults = computed(() => {
  if (!scan.value?.results) return []
  if (riskFilter.value === 'all') return scan.value.results
  return scan.value.results.filter(r => r.risk === riskFilter.value)
})

function statusLabel(s) {
  return { completed: 'Zakończony', running: 'W trakcie', error: 'Błąd' }[s] || s
}

function riskLabel(r) {
  return { high: 'Wysokie', medium: 'Średnie', low: 'Niskie' }[r] || r
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.scan-detail { display: flex; flex-direction: column; gap: 20px; }
.back-link { font-size: 14px; color: var(--color-text-muted); text-decoration: none; }
.back-link:hover { color: var(--color-primary); }
.detail-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.scan-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.scan-meta { font-size: 14px; color: var(--color-text-muted); display: flex; gap: 6px; }
.meta-sep { color: var(--color-border); }
.status-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.status-chip.completed { background: rgba(16,185,129,0.15); color: #6ee7b7; }
.status-chip.running { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.status-chip.error { background: rgba(239,68,68,0.15); color: #fca5a5; }
.status-pulse { width: 7px; height: 7px; background: #a5b4fc; border-radius: 50%; animation: pulse 1.2s ease-in-out infinite; }
.running-card { background: var(--color-surface); border: 1px solid rgba(99,102,241,0.3); border-radius: var(--radius-lg); padding: 20px; }
.running-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
.running-label { font-weight: 600; }
.running-pct { font-family: var(--font-mono); color: var(--color-primary); }
.progress-track { height: 8px; background: var(--color-surface-2); border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), #8b5cf6); border-radius: 4px; transition: width 0.5s; }
.running-note { font-size: 13px; color: var(--color-text-muted); }
.error-card { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--radius-lg); padding: 20px; display: flex; gap: 16px; }
.error-icon { font-size: 24px; }
.error-title { font-weight: 700; margin-bottom: 4px; }
.error-msg { font-size: 14px; color: var(--color-text-muted); margin-bottom: 12px; }
.btn-retry { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; padding: 8px 16px; border-radius: var(--radius); font-size: 13px; cursor: pointer; font-family: var(--font-sans); }
.stats-row { display: flex; gap: 14px; }
.stat-card { flex: 1; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 16px 20px; text-align: center; }
.stat-value { font-size: 22px; font-weight: 700; font-family: var(--font-mono); }
.stat-label { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
.val-danger { color: #fca5a5; }
.val-warn { color: #fcd34d; }
.results-section { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.section-title { font-size: 14px; font-weight: 600; }
.filter-row { display: flex; gap: 4px; }
.filter-btn { padding: 5px 12px; border-radius: 20px; border: 1px solid var(--color-border); background: none; color: var(--color-text-muted); font-size: 12px; cursor: pointer; font-family: var(--font-sans); transition: all 0.15s; }
.filter-btn.active { background: var(--color-primary); border-color: var(--color-primary); color: white; }
.rt-header { display: grid; grid-template-columns: 2fr 1fr 100px 80px; padding: 10px 20px; background: var(--color-surface-2); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--color-text-muted); }
.rt-row { display: grid; grid-template-columns: 2fr 1fr 100px 80px; padding: 14px 20px; border-bottom: 1px solid var(--color-border); font-size: 14px; align-items: center; }
.rt-row:last-child { border-bottom: none; }
.rt-name { font-family: var(--font-mono); font-size: 13px; }
.rt-cat { color: var(--color-text-muted); font-size: 13px; }
.risk-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.risk-badge.high { background: rgba(239,68,68,0.15); color: #fca5a5; }
.risk-badge.medium { background: rgba(245,158,11,0.15); color: #fcd34d; }
.risk-badge.low { background: rgba(16,185,129,0.15); color: #6ee7b7; }
.rt-count { font-family: var(--font-mono); font-size: 13px; color: var(--color-text-muted); }
.not-found { padding: 60px; text-align: center; color: var(--color-text-muted); }
.not-found a { color: var(--color-primary); }
@media (max-width: 640px) { .stats-row { flex-wrap: wrap; } .stat-card { min-width: calc(50% - 7px); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>
