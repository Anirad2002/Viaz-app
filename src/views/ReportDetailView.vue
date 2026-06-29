<template>
  <div v-if="report" class="report-detail">
    <div class="back-nav">
      <RouterLink to="/reports" class="back-link">← Wszystkie raporty</RouterLink>
    </div>

    <div class="report-doc">
      <div class="doc-header">
        <div class="doc-meta-top">
          <span class="doc-badge">Raport zgodności</span>
          <span class="doc-date">{{ formatDate(report.createdAt) }}</span>
        </div>
        <h1 class="doc-title">{{ report.title }}</h1>
        <p class="doc-subtitle">Na podstawie skanu: <strong>{{ report.scanName }}</strong></p>

        <div class="doc-stats">
          <div class="doc-stat">
            <div class="ds-val">{{ report.pages }}</div>
            <div class="ds-lbl">strony</div>
          </div>
          <div class="stat-divider"></div>
          <div class="doc-stat">
            <div class="ds-val">{{ report.sections.length }}</div>
            <div class="ds-lbl">sekcje</div>
          </div>
          <div class="stat-divider"></div>
          <div class="doc-stat">
            <div class="ds-val ready">Gotowy</div>
            <div class="ds-lbl">status</div>
          </div>
        </div>

        <div class="doc-actions">
          <button class="btn-primary" @click="downloadReport">⬇ Pobierz PDF</button>
          <button class="btn-outline" @click="shareReport">Udostępnij →</button>
        </div>
        <Transition name="toast">
          <div v-if="toast" class="toast-msg">{{ toast }}</div>
        </Transition>
      </div>

      <div class="doc-divider"></div>

      <div class="doc-summary">
        <p class="summary-text">{{ report.summary }}</p>
      </div>

      <div class="doc-body">
        <div class="doc-section" v-for="(section, i) in report.sections" :key="i">
          <div class="section-num">{{ String(i + 1).padStart(2, '0') }}</div>
          <div class="section-content">
            <h2 class="section-heading">{{ section.title }}</h2>
            <p class="section-body">{{ section.content }}</p>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <div class="footer-logo">viaz</div>
        <div class="footer-meta">Wygenerowano przez Viaz Data Intelligence Platform · {{ formatDate(report.createdAt) }}</div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    Raport nie został znaleziony. <RouterLink to="/reports">Wróć do raportów</RouterLink>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app.js'

const route = useRoute()
const store = useAppStore()
const report = computed(() => store.getReport(route.params.id))
const toast = ref('')

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => toast.value = '', 3000)
}

function downloadReport() {
  showToast('Eksport PDF uruchomiony (symulacja — plik nie zostanie pobrany)')
}

function shareReport() {
  navigator.clipboard.writeText(window.location.href).catch(() => {})
  showToast('Link skopiowany do schowka')
}
</script>

<style scoped>
.report-detail { display: flex; flex-direction: column; gap: 20px; max-width: 800px; margin: 0 auto; }
.back-link { font-size: 14px; color: var(--color-text-muted); text-decoration: none; }
.back-link:hover { color: var(--color-primary); }
.report-doc { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.doc-header { padding: 40px 48px; }
.doc-meta-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.doc-badge { background: var(--color-primary-glow); border: 1px solid rgba(99,102,241,0.3); color: var(--color-primary); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; }
.doc-date { font-size: 13px; color: var(--color-text-muted); }
.doc-title { font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 1.2; margin-bottom: 8px; }
.doc-subtitle { font-size: 15px; color: var(--color-text-muted); margin-bottom: 24px; }
.doc-subtitle strong { color: var(--color-text); }
.doc-stats { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.doc-stat { text-align: center; }
.ds-val { font-size: 20px; font-weight: 700; font-family: var(--font-mono); }
.ds-val.ready { color: var(--color-success); font-size: 16px; }
.ds-lbl { font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
.stat-divider { width: 1px; height: 32px; background: var(--color-border); }
.doc-actions { display: flex; gap: 12px; }
.btn-primary { background: var(--color-primary); color: white; border: none; padding: 10px 20px; border-radius: var(--radius); font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font-sans); }
.btn-primary:hover { background: #5558e3; }
.btn-outline { background: none; border: 1px solid var(--color-border); color: var(--color-text); padding: 10px 20px; border-radius: var(--radius); font-size: 14px; cursor: pointer; font-family: var(--font-sans); }
.btn-outline:hover { border-color: var(--color-primary); color: var(--color-primary); }
.toast-msg { margin-top: 12px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; padding: 10px 16px; border-radius: var(--radius); font-size: 13px; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-6px); }
.doc-divider { height: 1px; background: var(--color-border); }
.doc-summary { padding: 28px 48px; background: var(--color-surface-2); border-bottom: 1px solid var(--color-border); }
.summary-text { font-size: 15px; line-height: 1.7; color: var(--color-text-muted); font-style: italic; }
.doc-body { padding: 8px 0; }
.doc-section { display: flex; gap: 24px; padding: 28px 48px; border-bottom: 1px solid var(--color-border); }
.doc-section:last-child { border-bottom: none; }
.section-num { font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--color-primary); opacity: 0.6; flex-shrink: 0; margin-top: 4px; }
.section-content { flex: 1; }
.section-heading { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 12px; }
.section-body { font-size: 15px; line-height: 1.75; color: var(--color-text-muted); }
.doc-footer { padding: 20px 48px; border-top: 1px solid var(--color-border); background: var(--color-surface-2); display: flex; align-items: center; justify-content: space-between; }
.footer-logo { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: var(--color-text-muted); }
.footer-meta { font-size: 12px; color: var(--color-text-muted); }
.not-found { padding: 60px; text-align: center; color: var(--color-text-muted); }
.not-found a { color: var(--color-primary); }
@media (max-width: 640px) { .doc-header, .doc-summary, .doc-section, .doc-footer { padding: 24px; } .doc-title { font-size: 22px; } .doc-section { flex-direction: column; gap: 8px; } }
</style>
