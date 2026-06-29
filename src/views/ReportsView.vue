<template>
  <div class="reports-page">
    <div class="page-toolbar">
      <input v-model="search" class="search-input" placeholder="Szukaj raportów…" />
      <button class="btn-primary" @click="showGenModal = true">+ Generuj raport</button>
    </div>

    <!-- Generate modal -->
    <div v-if="showGenModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal modal--wide">
        <h3 class="modal-title">{{ step === 1 ? 'Generuj raport' : 'Edytuj sekcje' }}</h3>

        <!-- Step 1: choose scan + title -->
        <template v-if="step === 1">
          <div class="form-row">
            <label>Skan źródłowy</label>
            <select class="field-input" v-model="selectedScanId" @change="prefillSections">
              <option value="">Wybierz skan…</option>
              <option v-for="s in completedScans" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label>Tytuł raportu</label>
            <input class="field-input" v-model="reportTitle" placeholder="np. Raport zgodności Q2" />
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="closeModal">Anuluj</button>
            <button class="btn-primary" @click="step = 2" :disabled="!selectedScanId">Dalej: edytuj sekcje →</button>
          </div>
        </template>

        <!-- Step 2: edit sections -->
        <template v-else>
          <div class="sections-editor">
            <div class="section-edit" v-for="(sec, i) in editableSections" :key="i">
              <div class="section-edit-header">
                <input class="field-input section-title-input" v-model="sec.title" placeholder="Tytuł sekcji" />
                <button class="btn-remove" @click="editableSections.splice(i, 1)" title="Usuń sekcję">✕</button>
              </div>
              <textarea class="field-textarea" v-model="sec.content" rows="4" :placeholder="'Treść sekcji ' + (i+1) + '…'"></textarea>
            </div>
            <button class="btn-add-section" @click="editableSections.push({ title: '', content: '' })">+ Dodaj sekcję</button>
          </div>
          <div v-if="generating" class="gen-progress">
            <div class="gen-bar"><div class="gen-fill" :style="{ width: genPct + '%' }"></div></div>
            <span class="gen-label">Zapisywanie… {{ genPct }}%</span>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="step = 1">← Wstecz</button>
            <button class="btn-primary" @click="generateReport" :disabled="generating">
              {{ generating ? 'Zapisywanie…' : 'Zapisz raport' }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Reports grid -->
    <div v-if="filteredReports.length === 0" class="empty-state">
      <div class="empty-icon">📄</div>
      <div class="empty-title">Brak raportów</div>
      <div class="empty-sub">Wygeneruj raport z zakończonego skanu, aby zobaczyć go tutaj.</div>
    </div>

    <div class="reports-grid">
      <RouterLink
        v-for="report in filteredReports"
        :key="report.id"
        :to="'/reports/' + report.id"
        class="report-card"
      >
        <div class="rc-header">
          <div class="rc-icon">📄</div>
          <div class="rc-status" :class="report.status">
            {{ report.status === 'ready' ? '✓ Gotowy' : '⟳ Generowanie' }}
          </div>
        </div>
        <h3 class="rc-title">{{ report.title }}</h3>
        <p class="rc-meta">
          {{ report.scanName }} · {{ report.pages }} pages · {{ formatDate(report.createdAt) }}
        </p>
        <p class="rc-summary">{{ report.summary }}</p>
        <div class="rc-footer">
          <span class="rc-link">Czytaj raport →</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app.js'

const store = useAppStore()
const search = ref('')
const showGenModal = ref(false)
const selectedScanId = ref('')
const reportTitle = ref('')
const generating = ref(false)
const genPct = ref(0)
const step = ref(1)
const editableSections = ref([])

const filteredReports = computed(() => {
  const q = search.value.toLowerCase()
  return store.reports.filter(r => !q || r.title.toLowerCase().includes(q))
})

const completedScans = computed(() => store.scans.filter(s => s.status === 'completed'))

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function closeModal() {
  showGenModal.value = false
  step.value = 1
  selectedScanId.value = ''
  reportTitle.value = ''
  editableSections.value = []
}

function prefillSections() {
  const scan = store.scans.find(s => s.id === selectedScanId.value)
  if (!scan) return
  const highRisk = scan.results?.filter(r => r.risk === 'high') || []
  const medRisk = scan.results?.filter(r => r.risk === 'medium') || []
  const totalItems = scan.itemsFound || 0
  const cats = scan.categories?.join(', ') || 'różne kategorie'

  const sections = [
    {
      title: 'Streszczenie wykonawcze',
      content: 'Skan zasobu ' + scan.name + ' zidentyfikował ' + totalItems.toLocaleString() + ' wrażliwych elementów w ' + cats + '. ' +
        (highRisk.length > 0
          ? 'Zalecane jest natychmiastowe działanie dla ' + highRisk.reduce((a, b) => a + b.count, 0).toLocaleString() + ' elementów wysokiego ryzyka.'
          : 'Nie wykryto elementów wysokiego ryzyka.')
    }
  ]
  if (highRisk.length > 0) {
    sections.push({
      title: 'Wyniki wysokiego ryzyka',
      content: 'Następujące pola zawierają dane wysokiego ryzyka: ' + highRisk.map(r => r.name + ' (' + r.count.toLocaleString() + ' records, ' + r.category + ')').join('; ') + '. Należy je priorytetowo przejrzeć i naprawić.'
    })
  }
  if (medRisk.length > 0) {
    sections.push({
      title: 'Wyniki średniego ryzyka',
      content: 'Dane średniego ryzyka znaleziono w: ' + medRisk.map(r => r.name + ' (' + r.count.toLocaleString() + ' records)').join('; ') + '. Rozważ zastosowanie kontroli dostępu lub szyfrowania.'
    })
  }
  sections.push({
    title: 'Zalecenia',
    content: 'Na podstawie wyników skanu zalecamy: (1) Szyfrowanie wszystkich pól z danymi osobowymi, (2) Wdrożenie kontroli dostępu na poziomie kolumn dla danych finansowych, (3) Skonfigurowanie automatycznych alertów przy masowym eksporcie, (4) Regularne skany monitorujące wzrost danych.'
  })
  editableSections.value = sections
  if (!reportTitle.value) reportTitle.value = scan.name + ' Report'
}

function generateReport() {
  generating.value = true
  genPct.value = 0
  const scan = store.scans.find(s => s.id === selectedScanId.value)
  const interval = setInterval(() => {
    genPct.value += Math.round(Math.random() * 15 + 5)
    if (genPct.value >= 100) {
      genPct.value = 100
      clearInterval(interval)
      const sections = editableSections.value.filter(s => s.title || s.content)
      const totalItems = scan?.itemsFound || 0

      const newReport = {
        id: 'r-' + Date.now(),
        title: reportTitle.value || ((scan?.name || 'Scan') + ' Report'),
        scanId: selectedScanId.value,
        scanName: scan?.name || '',
        createdAt: new Date().toISOString(),
        status: 'ready',
        pages: Math.max(sections.length * 2, 5),
        summary: 'Raport podsumowuje wyniki skanu "' + (scan?.name || '') + '". Łącznie zidentyfikowano ' + totalItems.toLocaleString() + ' wrażliwych elementów danych w ' + (scan?.categories?.length || 0) + ' kategoriach.',
        sections,
      }
      store.addReport(newReport)
      generating.value = false
      closeModal()
    }
  }, 250)
}
</script>

<style scoped>
.reports-page { display: flex; flex-direction: column; gap: 20px; }

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 9px 14px;
  font-size: 14px;
  color: var(--color-text);
  font-family: var(--font-sans);
  outline: none;
  max-width: 320px;
}

.search-input:focus { border-color: var(--color-primary); }

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) { background: #5558e3; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.report-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.15s;
}

.report-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.rc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rc-icon { font-size: 24px; }

.rc-status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.rc-status.ready { background: rgba(16,185,129,0.15); color: #6ee7b7; }
.rc-status.generating { background: rgba(99,102,241,0.15); color: #a5b4fc; }

.rc-title { font-size: 16px; font-weight: 700; line-height: 1.3; }
.rc-meta { font-size: 12px; color: var(--color-text-muted); }
.rc-summary { font-size: 13px; color: var(--color-text-muted); line-height: 1.5; flex: 1; }
.rc-footer { margin-top: 4px; }
.rc-link { font-size: 13px; color: var(--color-primary); font-weight: 500; }

.empty-state { text-align: center; padding: 60px; }
.empty-icon { font-size: 36px; margin-bottom: 12px; }
.empty-title { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.empty-sub { font-size: 14px; color: var(--color-text-muted); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
  backdrop-filter: blur(2px);
}

.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  width: 440px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
}

.modal-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }

.form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-row label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

.field-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 14px;
  color: var(--color-text);
  font-family: var(--font-sans);
  outline: none;
}

.gen-progress { margin-bottom: 12px; }

.gen-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.gen-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s;
}

.gen-label { font-size: 12px; color: var(--color-text-muted); font-family: var(--font-mono); }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-ghost {
  background: none; border: none;
  color: var(--color-text-muted);
  padding: 9px 14px;
  cursor: pointer; font-size: 14px;
  font-family: var(--font-sans);
}

.modal--wide { width: 600px; max-height: 80vh; overflow-y: auto; }

.sections-editor { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }

.section-edit {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-edit-header { display: flex; gap: 8px; align-items: center; }
.section-title-input { flex: 1; font-weight: 600; }

.btn-remove {
  background: none; border: 1px solid var(--color-border);
  color: var(--color-text-muted); border-radius: var(--radius);
  width: 28px; height: 28px; cursor: pointer;
  font-size: 12px; flex-shrink: 0;
}

.btn-remove:hover { border-color: var(--color-danger); color: var(--color-danger); }

.field-textarea {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--color-text);
  font-family: var(--font-sans);
  outline: none;
  resize: vertical;
  width: 100%;
  line-height: 1.6;
}

.field-textarea:focus { border-color: var(--color-primary); }

.btn-add-section {
  background: none;
  border: 1px dashed var(--color-border);
  color: var(--color-text-muted);
  border-radius: var(--radius);
  padding: 10px;
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-sans);
  transition: all 0.15s;
}

.btn-add-section:hover { border-color: var(--color-primary); color: var(--color-primary); }
</style>
