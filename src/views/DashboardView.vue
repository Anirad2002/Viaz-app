<template>
  <div class="dashboard">
    <div v-if="showWelcomeBanner" class="welcome-banner">
      <div>
        <div class="banner-title">🎉 Pierwszy skan zakończony!</div>
        <div class="banner-sub">Twoje dane są indeksowane. Oto co znaleźliśmy do tej pory.</div>
      </div>
      <button class="btn-ghost-sm" @click="showWelcomeBanner = false">✕</button>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label">
        <div class="kpi-icon">{{ kpi.icon }}</div>
        <div class="kpi-body">
          <div class="kpi-value" :class="kpi.valueClass">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
        <div class="kpi-trend" :class="kpi.trend > 0 ? 'up' : 'down'" v-if="kpi.trend">
          {{ kpi.trend > 0 ? '↑' : '↓' }} {{ Math.abs(kpi.trend) }}%
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card chart-card--wide">
        <div class="chart-header">
          <h3 class="chart-title">Wykryte elementy w czasie</h3>
          <div class="chart-legend">
            <span class="legend-dot" style="background:#6366f1"></span> Znalezione elementy
          </div>
        </div>
        <div class="simple-chart">
          <div class="bar-chart">
            <div v-for="point in store.chartData.scansOverTime" :key="point.month" class="bar-col">
              <div class="bar-wrap">
                <div class="bar-fill" :style="{ height: (point.items / maxItems * 100) + '%' }" :title="point.items + ' elementów'"></div>
              </div>
              <div class="bar-label">{{ point.month }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Rozkład ryzyka</h3>
        </div>
        <div class="donut-wrap">
          <svg viewBox="0 0 120 120" class="donut-svg">
            <circle cx="60" cy="60" r="42" fill="none" stroke="var(--color-surface-2)" stroke-width="18"/>
            <circle v-for="(seg, i) in donutSegments" :key="i"
              cx="60" cy="60" r="42" fill="none"
              :stroke="seg.color" stroke-width="18"
              :stroke-dasharray="`${seg.dash} ${seg.gap}`"
              :stroke-dashoffset="seg.offset"
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="56" text-anchor="middle" font-size="16" font-weight="700" fill="var(--color-text)">{{ totalItems }}</text>
            <text x="60" y="70" text-anchor="middle" font-size="9" fill="var(--color-text-muted)">elementów</text>
          </svg>
          <div class="donut-legend">
            <div class="donut-leg-row" v-for="seg in store.chartData.riskDistribution" :key="seg.name">
              <span class="leg-color" :style="{ background: seg.color }"></span>
              <span class="leg-name">{{ seg.name }}</span>
              <span class="leg-val">{{ seg.value.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Według kategorii</h3>
        </div>
        <div class="horiz-bars">
          <div class="hbar-row" v-for="cat in store.chartData.itemsByCategory" :key="cat.name">
            <span class="hbar-name">{{ cat.name }}</span>
            <div class="hbar-track">
              <div class="hbar-fill" :style="{ width: (cat.value / maxCatVal * 100) + '%' }"></div>
            </div>
            <span class="hbar-val">{{ cat.value.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="activity-card">
      <div class="card-header">
        <h3 class="card-title">Ostatnia aktywność</h3>
        <RouterLink to="/scans" class="view-all">Zobacz wszystkie skany →</RouterLink>
      </div>
      <div class="activity-list">
        <div class="act-row" v-for="item in store.activity" :key="item.id">
          <div class="act-icon" :class="item.type">
            {{ { scan_completed: '✓', report_generated: '📄', scan_started: '▶', scan_error: '⚠' }[item.type] }}
          </div>
          <div class="act-body">
            <div class="act-text">{{ item.text }}</div>
            <div class="act-time">{{ item.time }}</div>
          </div>
          <RouterLink v-if="item.type === 'scan_completed'" to="/scans" class="act-link">Pokaż →</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app.js'

const store = useAppStore()
const showWelcomeBanner = ref(store.onboardingDone)

const kpis = computed(() => [
  { label: 'Łącznie skanów', value: store.kpis.totalScans, icon: '🔍', trend: 12 },
  { label: 'Aktywne skany', value: store.kpis.activeScans, icon: '⚡', valueClass: store.kpis.activeScans > 0 ? 'val-active' : '' },
  { label: 'Znalezione elementy', value: store.kpis.totalItems.toLocaleString(), icon: '📦', trend: 8 },
  { label: 'Elementy wysokiego ryzyka', value: store.kpis.highRiskItems.toLocaleString(), icon: '🔴', valueClass: 'val-danger', trend: -3 },
  { label: 'Połączone źródła', value: store.kpis.sourcesConnected, icon: '🔌' },
  { label: 'Wygenerowane raporty', value: store.kpis.reportsGenerated, icon: '📄' },
])

const maxItems = computed(() => Math.max(...store.chartData.scansOverTime.map(p => p.items)))
const maxCatVal = computed(() => Math.max(...store.chartData.itemsByCategory.map(c => c.value)))
const totalItems = computed(() => store.chartData.riskDistribution.reduce((a, b) => a + b.value, 0).toLocaleString())

const circumference = 2 * Math.PI * 42
const donutSegments = computed(() => {
  const total = store.chartData.riskDistribution.reduce((a, b) => a + b.value, 0)
  let offset = 0
  return store.chartData.riskDistribution.map(seg => {
    const dash = (seg.value / total) * circumference
    const result = { ...seg, dash, gap: circumference - dash, offset: -offset }
    offset += dash
    return result
  })
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; }
.welcome-banner {
  background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
  border: 1px solid rgba(99,102,241,0.3); border-radius: var(--radius-lg);
  padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
}
.banner-title { font-weight: 700; font-size: 15px; margin-bottom: 2px; }
.banner-sub { font-size: 13px; color: var(--color-text-muted); }
.btn-ghost-sm { background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: 16px; }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.kpi-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 20px;
  display: flex; align-items: flex-start; gap: 14px; transition: border-color 0.15s;
}
.kpi-card:hover { border-color: var(--color-primary); }
.kpi-icon { font-size: 22px; margin-top: 2px; }
.kpi-body { flex: 1; }
.kpi-value { font-size: 24px; font-weight: 700; font-family: var(--font-mono); letter-spacing: -0.5px; }
.kpi-label { font-size: 13px; color: var(--color-text-muted); margin-top: 2px; }
.kpi-trend { font-size: 12px; font-weight: 600; margin-top: 4px; }
.kpi-trend.up { color: var(--color-success); }
.kpi-trend.down { color: var(--color-danger); }
.val-danger { color: #fca5a5; }
.val-active { color: #6ee7b7; }

.charts-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 14px; }
.chart-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 20px; }
.chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.chart-title { font-size: 14px; font-weight: 600; }
.chart-legend { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-muted); }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.simple-chart { height: 140px; }
.bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 100%; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
.bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.bar-fill { width: 100%; background: linear-gradient(180deg, var(--color-primary), rgba(99,102,241,0.4)); border-radius: 4px 4px 0 0; transition: height 0.6s ease; min-height: 4px; }
.bar-label { font-size: 11px; color: var(--color-text-muted); margin-top: 6px; }

.donut-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.donut-svg { width: 120px; height: 120px; }
.donut-legend { width: 100%; }
.donut-leg-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--color-border); font-size: 13px; }
.donut-leg-row:last-child { border-bottom: none; }
.leg-color { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.leg-name { flex: 1; color: var(--color-text-muted); }
.leg-val { font-family: var(--font-mono); font-size: 12px; font-weight: 600; }

.horiz-bars { display: flex; flex-direction: column; gap: 12px; }
.hbar-row { display: flex; align-items: center; gap: 10px; }
.hbar-name { font-size: 11px; color: var(--color-text-muted); width: 80px; flex-shrink: 0; }
.hbar-track { flex: 1; height: 6px; background: var(--color-surface-2); border-radius: 3px; overflow: hidden; }
.hbar-fill { height: 100%; background: var(--color-primary); border-radius: 3px; transition: width 0.6s ease; }
.hbar-val { font-size: 12px; font-family: var(--font-mono); color: var(--color-text-muted); min-width: 46px; text-align: right; }

.activity-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 20px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-size: 14px; font-weight: 600; }
.view-all { font-size: 13px; color: var(--color-primary); text-decoration: none; }
.activity-list { display: flex; flex-direction: column; }
.act-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--color-border); }
.act-row:last-child { border-bottom: none; }
.act-icon { width: 32px; height: 32px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; background: var(--color-surface-2); }
.act-icon.scan_completed { background: rgba(16,185,129,0.15); }
.act-icon.scan_error { background: rgba(239,68,68,0.15); }
.act-icon.scan_started { background: rgba(99,102,241,0.15); }
.act-icon.report_generated { background: rgba(59,130,246,0.15); }
.act-body { flex: 1; }
.act-text { font-size: 14px; }
.act-time { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
.act-link { font-size: 13px; color: var(--color-primary); text-decoration: none; }

@media (max-width: 1024px) { .charts-row { grid-template-columns: 1fr 1fr; } .chart-card--wide { grid-column: 1 / -1; } }
@media (max-width: 640px) { .charts-row { grid-template-columns: 1fr; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
