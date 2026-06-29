<template>
  <div class="onboarding">
    <!-- Background grid -->
    <div class="bg-grid"></div>

    <!-- Krok: Powitanie -->
    <Transition name="step" mode="out-in">
      <div v-if="step === 0" key="welcome" class="step-container">
        <div class="welcome-content">
          <div class="brand-lock">
            <div class="brand-mark">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="8" height="8" rx="2" fill="#6366f1"/>
                <rect x="14" y="2" width="8" height="8" rx="2" fill="#6366f1" opacity="0.4"/>
                <rect x="2" y="14" width="8" height="8" rx="2" fill="#6366f1" opacity="0.4"/>
                <rect x="14" y="14" width="8" height="8" rx="2" fill="#6366f1"/>
              </svg>
            </div>
            <span class="brand-wordmark">viaz</span>
          </div>

          <h1 class="welcome-headline">Znajdź wrażliwe dane<br/><span class="accent">zanim one znajdą kłopoty.</span></h1>
          <p class="welcome-sub">Podłącz swoje źródła danych, uruchom skan i sprawdź, gdzie dokładnie przechowywane są dane osobowe i finansowe. Konfiguracja zajmuje około 3 minut.</p>

          <div class="welcome-steps-preview">
            <div class="preview-step" v-for="(s, i) in stepLabels" :key="i">
              <div class="preview-num">{{ i + 1 }}</div>
              <span>{{ s }}</span>
            </div>
          </div>

          <button class="btn-primary btn-lg" @click="step = 1">Rozpocznij →</button>
          <p class="welcome-note">Masz już skonfigurowane źródła? <a href="#" @click.prevent="finishOnboarding">Przejdź do panelu</a></p>
        </div>
      </div>

      <!-- Krok: Połącz źródło -->
      <div v-else-if="step === 1" key="source" class="step-container">
        <div class="step-card">
          <StepProgress :current="1" :total="4" />
          <h2 class="step-title">Połącz źródło danych</h2>
          <p class="step-desc">Wybierz, gdzie przechowywane są Twoje dane. Przeskanujemy je w celu identyfikacji informacji wrażliwych.</p>

          <div class="source-grid">
            <button
              v-for="src in sourceTypes"
              :key="src.id"
              class="source-tile"
              :class="{ selected: selectedSource?.id === src.id }"
              @click="selectSource(src)"
            >
              <span class="source-icon">{{ src.icon }}</span>
              <span class="source-name">{{ src.label }}</span>
              <span class="source-cat">{{ src.category }}</span>
            </button>
          </div>

          <div v-if="selectedSource" class="connection-form">
            <div class="form-row">
              <label>Host / URL</label>
              <input class="field-input" v-model="connForm.host" :placeholder="connForm.hostPlaceholder" />
            </div>
            <div class="form-row-2">
              <div class="form-row">
                <label>Username</label>
                <input class="field-input" v-model="connForm.user" placeholder="np. uzytkownik_tylko_do_odczytu" />
              </div>
              <div class="form-row">
                <label>Password</label>
                <input class="field-input" type="password" v-model="connForm.pass" placeholder="••••••••" />
              </div>
            </div>

            <div class="conn-actions">
              <button class="btn-outline" @click="testConnection" :disabled="connectionState === 'connecting'">
                <span v-if="connectionState === 'idle'">Testuj połączenie</span>
                <span v-else-if="connectionState === 'connecting'" class="spinner-inline">⟳ Testowanie…</span>
                <span v-else-if="connectionState === 'success'">✓ Połączono</span>
                <span v-else>✗ Ponów</span>
              </button>

              <div class="conn-status" :class="connectionState">
                <div class="status-dot"></div>
                <span>{{ connStatusLabel }}</span>
              </div>
            </div>

            <div v-if="connectionState === 'error'" class="error-banner">
              <span>⚠️</span> Nie udało się połączyć. Sprawdź dane uwierzytelniające i sieć, a następnie spróbuj ponownie.
            </div>
          </div>

          <div class="step-footer">
            <button class="btn-ghost" @click="step = 0">← Wstecz</button>
            <button class="btn-primary" @click="step = 2" :disabled="connectionState !== 'success'">
              Dalej →
            </button>
          </div>
        </div>
      </div>

      <!-- Krok: Zakres -->
      <div v-else-if="step === 2" key="scope" class="step-container">
        <div class="step-card">
          <StepProgress :current="2" :total="4" />
          <h2 class="step-title">Skonfiguruj zakres skanu</h2>
          <p class="step-desc">Wybierz, czego szukać. Skan zidentyfikuje i sklasyfikuje pasujące dane.</p>

          <div class="scope-section">
            <h3 class="scope-label">Kategorie danych do wykrycia</h3>
            <div class="category-grid">
              <label class="cat-toggle" v-for="cat in categories" :key="cat.id">
                <input type="checkbox" v-model="selectedCats" :value="cat.id" />
                <div class="cat-card" :class="{ checked: selectedCats.includes(cat.id) }">
                  <span class="cat-icon">{{ cat.icon }}</span>
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-desc">{{ cat.desc }}</span>
                  <div class="cat-check">{{ selectedCats.includes(cat.id) ? '✓' : '' }}</div>
                </div>
              </label>
            </div>
          </div>

          <div class="scope-section">
            <h3 class="scope-label">Głębokość skanu</h3>
            <div class="depth-options">
              <label class="radio-option" v-for="d in depthOptions" :key="d.id">
                <input type="radio" v-model="scanDepth" :value="d.id" />
                <div class="radio-card" :class="{ selected: scanDepth === d.id }">
                  <div class="radio-title">{{ d.name }}</div>
                  <div class="radio-desc">{{ d.desc }}</div>
                </div>
              </label>
            </div>
          </div>

          <div class="scope-section">
            <h3 class="scope-label">Harmonogram</h3>
            <div class="schedule-options">
              <label class="radio-option" v-for="s in scheduleOptions" :key="s.id">
                <input type="radio" v-model="schedule" :value="s.id" />
                <div class="radio-card" :class="{ selected: schedule === s.id }">
                  <div class="radio-title">{{ s.name }}</div>
                </div>
              </label>
            </div>
          </div>

          <div class="step-footer">
            <button class="btn-ghost" @click="step = 1">← Wstecz</button>
            <button class="btn-primary" @click="step = 3" :disabled="selectedCats.length === 0">
              Przejrzyj i uruchom →
            </button>
          </div>
        </div>
      </div>

      <!-- Krok: Podsumowanie -->
      <div v-else-if="step === 3" key="summary" class="step-container">
        <div class="step-card">
          <StepProgress :current="3" :total="4" />
          <h2 class="step-title">Przejrzyj i uruchom skan</h2>
          <p class="step-desc">Potwierdź ustawienia. Zawsze możesz uruchomić kolejne skany później.</p>

          <div class="summary-block">
            <div class="summary-row">
              <span class="summary-key">Źródło</span>
              <span class="summary-val">{{ selectedSource?.icon }} {{ selectedSource?.label }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-key">Host</span>
              <span class="summary-val mono">{{ connForm.host || 'localhost:5432' }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-key">Kategorie</span>
              <span class="summary-val">
                <span class="tag" v-for="c in selectedCatObjects" :key="c.id">{{ c.name }}</span>
              </span>
            </div>
            <div class="summary-row">
              <span class="summary-key">Głębokość</span>
              <span class="summary-val">{{ depthOptions.find(d => d.id === scanDepth)?.name }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-key">Harmonogram</span>
              <span class="summary-val">{{ scheduleOptions.find(s => s.id === schedule)?.name }}</span>
            </div>
          </div>

          <div class="estimated-time">
            <span class="time-icon">⏱</span>
            <span>Szacowany czas skanu: <strong>8–15 minutes</strong> na podstawie wybranej głębokości</span>
          </div>

          <div class="step-footer">
            <button class="btn-ghost" @click="step = 2">← Wstecz</button>
            <button class="btn-primary btn-launch" @click="startScan">
              🚀 Uruchom skan
            </button>
          </div>
        </div>
      </div>

      <!-- Krok: Postęp -->
      <div v-else-if="step === 4" key="progress" class="step-container">
        <div class="step-card step-card--wide">
          <StepProgress :current="4" :total="4" />
          <div class="progress-header">
            <div class="scan-status-badge" :class="scanComplete ? 'done' : 'running'">
              <span class="pulse-dot" v-if="!scanComplete"></span>
              {{ scanComplete ? '✓ Skan zakończony' : 'Scanning…' }}
            </div>
            <h2 class="step-title">{{ selectedSource?.label }}  — skan</h2>
          </div>

          <div class="scan-progress-bar">
            <div class="scan-bar-track">
              <div class="scan-bar-fill" :style="{ width: scanProgress + '%' }"></div>
            </div>
            <span class="scan-pct">{{ scanProgress }}%</span>
          </div>

          <div class="scan-log">
            <div class="log-line" v-for="(line, i) in visibleLog" :key="i">
              <span class="log-time">{{ line.time }}</span>
              <span class="log-msg" :class="line.type">{{ line.msg }}</span>
            </div>
          </div>

          <div v-if="scanProgress >= 60" class="preview-results">
            <h3 class="preview-title">Wstępne wyniki</h3>
            <div class="finding-row" v-for="f in earlyFindings" :key="f.name">
              <span class="finding-name">{{ f.name }}</span>
              <span class="finding-cat">{{ f.cat }}</span>
              <span class="finding-count risk-badge" :class="f.risk">{{ f.count }} items</span>
            </div>
          </div>

          <div v-if="scanComplete" class="complete-actions">
            <div class="complete-summary">
              <div class="cs-stat">
                <div class="cs-value">1,842</div>
                <div class="cs-label">Znaleziono elementów</div>
              </div>
              <div class="cs-stat">
                <div class="cs-value risk-high">305</div>
                <div class="cs-label">Wysokie ryzyko</div>
              </div>
              <div class="cs-stat">
                <div class="cs-value">5</div>
                <div class="cs-label">Kategorie</div>
              </div>
            </div>

            <div class="complete-btns">
              <button class="btn-primary" @click="goToDashboard">Przejdź do panelu →</button>
              <button class="btn-outline" @click="goToScans">Zobacz pełne wyniki</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app.js'
import { sourceTypes } from '../data/mock.js'
import StepProgress from '../components/StepProgress.vue'

const router = useRouter()
const store = useAppStore()

const step = ref(0)
const stepLabels = ['Połącz źródło', 'Ustaw zakres', 'Przejrzyj i uruchom', 'Postęp skanu']

// Source step
const selectedSource = ref(null)
const connectionState = ref('idle') // idle | connecting | success | error
const connForm = ref({ host: '', user: '', pass: '', hostPlaceholder: 'e.g. db.company.com:5432' })

function selectSource(src) {
  selectedSource.value = src
  connectionState.value = 'idle'
  const placeholders = {
    postgresql: 'e.g. db.company.com:5432',
    mysql: 'e.g. db.company.com:3306',
    mongodb: 'mongodb://db.company.com:27017',
    'google-drive': 'OAuth — kliknij Połącz',
    'aws-s3': 's3://bucket-name',
    onedrive: 'OAuth — kliknij Połącz',
    csv: 'Upload file',
    api: 'https://api.company.com/v1',
  }
  connForm.value.hostPlaceholder = placeholders[src.id] || ''
}

const connStatusLabel = computed(() => ({
  idle: 'Nie sprawdzono',
  connecting: 'Łączenie…',
  success: 'Połączono',
  error: 'Błąd połączenia',
}[connectionState.value]))

function testConnection() {
  if (!connForm.value.host) {
    connForm.value.host = connForm.value.hostPlaceholder.replace('e.g. ', '')
  }
  connectionState.value = 'connecting'
  setTimeout(() => {
    connectionState.value = connForm.value.host.includes('error') ? 'error' : 'success'
  }, 1800)
}

// Scope step
const categories = [
  { id: 'pii', name: 'Dane osobowe', icon: '👤', desc: 'Imiona, emaile, telefony, ID' },
  { id: 'financial', name: 'Dane finansowe', icon: '💳', desc: 'Karty, konta, płatności' },
  { id: 'health', name: 'Zdrowie', icon: '🏥', desc: 'Dokumentacja medyczna, diagnozy' },
  { id: 'credentials', name: 'Poświadczenia', icon: '🔐', desc: 'Hasła, klucze API, tokeny' },
  { id: 'contracts', name: 'Umowy', icon: '📋', desc: 'Podpisane umowy, NDA' },
  { id: 'hr', name: 'Akta HR', icon: '🧑‍💼', desc: 'Wynagrodzenia, oceny, przeglądy' },
]
const selectedCats = ref(['pii', 'financial'])

const depthOptions = [
  { id: 'quick', name: 'Szybki skan', desc: 'Próbkuje 10% rekordów, wyniki w minutach' },
  { id: 'standard', name: 'Standardowy', desc: 'Pełny skan, balans między szybkością a pokryciem' },
  { id: 'deep', name: 'Głęboki skan', desc: 'Wyczerpujący — każde pole, każdy wiersz' },
]
const scanDepth = ref('standard')

const scheduleOptions = [
  { id: 'once', name: 'Jednorazowo' },
  { id: 'weekly', name: 'Co tydzień' },
  { id: 'monthly', name: 'Co miesiąc' },
]
const schedule = ref('once')

const selectedCatObjects = computed(() => categories.filter(c => selectedCats.value.includes(c.id)))

// Scan progress step
const scanProgress = ref(0)
const scanComplete = ref(false)
const scanLog = ref([])
const visibleLog = ref([])

const logMessages = [
  { time: '00:01', msg: 'Łączenie ze źródłem…', type: 'info' },
  { time: '00:03', msg: 'Połączenie ustanowione ✓', type: 'success' },
  { time: '00:05', msg: 'Enumeracja schematu — znaleziono 42 tabele', type: 'info' },
  { time: '00:12', msg: 'Uruchamianie klasyfikatora danych osobowych na tabeli klientów…', type: 'info' },
  { time: '00:18', msg: '⚠ Wykryto dane wysokiego ryzyka: customers.email (384 rekordy)', type: 'warn' },
  { time: '00:25', msg: 'Uruchamianie klasyfikatora finansowego na tabeli zamówień…', type: 'info' },
  { time: '00:31', msg: '⚠ Wykryto dane wysokiego ryzyka: orders.card_last4 (921 rekordów)', type: 'warn' },
  { time: '00:44', msg: 'Skanowanie folderu dokumentów…', type: 'info' },
  { time: '00:52', msg: '47 dokumentów umów sklasyfikowanych', type: 'success' },
  { time: '01:10', msg: 'Przetwarzanie końcowe i ocena ryzyka…', type: 'info' },
  { time: '01:22', msg: 'Generowanie raportu…', type: 'info' },
  { time: '01:30', msg: '✓ Skan zakończony — znaleziono 1 842 elementy', type: 'success' },
]

const earlyFindings = [
  { name: 'customers.email', cat: 'PII', risk: 'high', count: 384 },
  { name: 'orders.card_last4', cat: 'Financial', risk: 'high', count: 921 },
  { name: 'users.phone', cat: 'PII', risk: 'medium', count: 312 },
]

watch(() => step.value, (val) => {
  if (val === 4) {
    let pct = 0
    let logIdx = 0
    const interval = setInterval(() => {
      pct += Math.random() * 4 + 2
      if (pct >= 100) {
        pct = 100
        scanComplete.value = true
        clearInterval(interval)
      }
      scanProgress.value = Math.round(pct)

      const expectedLog = Math.floor((pct / 100) * logMessages.length)
      while (logIdx < expectedLog && logIdx < logMessages.length) {
        visibleLog.value.push(logMessages[logIdx])
        logIdx++
      }
    }, 350)
  }
})

const savedScanId = ref(null)

function startScan() {
  step.value = 4
}

watch(scanComplete, (done) => {
  if (!done) return
  const scan = {
    id: 's-onb-' + Date.now(),
    name: (selectedSource.value?.label || 'Źródło') + ' — skan konfiguracyjny',
    source: connForm.value.host || selectedSource.value?.label || 'Nieznane',
    sourceType: ['postgresql','mysql','mongodb'].includes(selectedSource.value?.id) ? 'database' : 'cloud',
    status: 'completed',
    progress: 100,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    duration: '1 min 30 s',
    itemsFound: 1842,
    categories: selectedCatObjects.value.map(c => c.name),
    results: [
      { id: 1, name: 'customers.email', category: selectedCatObjects.value[0]?.name || 'Dane osobowe', risk: 'high', count: 384 },
      { id: 2, name: 'orders.card_last4', category: selectedCatObjects.value[1]?.name || 'Dane finansowe', risk: 'high', count: 921 },
      { id: 3, name: 'users.phone', category: selectedCatObjects.value[0]?.name || 'Dane osobowe', risk: 'medium', count: 312 },
      { id: 4, name: 'contracts.pdf', category: 'Umowy', risk: 'medium', count: 47 },
      { id: 5, name: 'invoices.amount', category: selectedCatObjects.value[1]?.name || 'Dane finansowe', risk: 'low', count: 178 },
    ],
  }
  store.addScan(scan)
  savedScanId.value = scan.id
})

function goToDashboard() {
  store.completeOnboarding()
  router.push('/dashboard')
}

function goToScans() {
  store.completeOnboarding()
  router.push(savedScanId.value ? '/scans/' + savedScanId.value : '/scans')
}

function finishOnboarding() {
  store.completeOnboarding()
  router.push('/dashboard')
}
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  position: relative;
  overflow: hidden;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* Welcome */
.welcome-content {
  max-width: 540px;
  width: 100%;
  padding: 48px 24px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.brand-lock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.brand-wordmark {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
  color: var(--color-text);
}

.welcome-headline {
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.15;
  margin-bottom: 16px;
  color: var(--color-text);
}

.accent { color: var(--color-primary); }

.welcome-sub {
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 36px;
}

.welcome-steps-preview {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.preview-step {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.preview-num {
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-note {
  margin-top: 16px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.welcome-note a { color: var(--color-primary); text-decoration: none; }

/* Step card */
.step-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 16px;
  position: relative;
  z-index: 1;
}

.step-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 36px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.3);
}

.step-card--wide { max-width: 720px; }

.step-title {
  font-size: 22px;
  font-weight: 700;
  margin: 16px 0 6px;
  letter-spacing: -0.5px;
}

.step-desc { color: var(--color-text-muted); font-size: 14px; margin-bottom: 28px; }

/* Source grid */
.source-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
  margin-bottom: 24px;
}

.source-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  background: var(--color-surface-2);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
  font-size: 13px;
  color: var(--color-text);
}

.source-tile:hover { border-color: var(--color-primary); transform: translateY(-1px); }
.source-tile.selected { border-color: var(--color-primary); background: var(--color-primary-glow); }

.source-icon { font-size: 24px; }
.source-name { font-weight: 600; font-size: 13px; }
.source-cat { font-size: 11px; color: var(--color-text-muted); }

/* Connection form */
.connection-form {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 24px;
}

.form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-row label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.field-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 14px;
  color: var(--color-text);
  font-family: var(--font-mono);
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus { border-color: var(--color-primary); }

.conn-actions { display: flex; align-items: center; gap: 16px; }

.conn-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
}

.conn-status.connecting .status-dot { background: var(--color-warning); animation: pulse 1s infinite; }
.conn-status.success .status-dot { background: var(--color-success); }
.conn-status.error .status-dot { background: var(--color-danger); }
.conn-status.success { color: var(--color-success); }
.conn-status.error { color: var(--color-danger); }

.error-banner {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
  color: #fca5a5;
  margin-top: 12px;
}

/* Scope */
.scope-section { margin-bottom: 28px; }
.scope-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.cat-toggle { cursor: pointer; }
.cat-toggle input { display: none; }

.cat-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px;
  background: var(--color-surface-2);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  position: relative;
  transition: all 0.15s;
}

.cat-card:hover { border-color: var(--color-primary); }
.cat-card.checked { border-color: var(--color-primary); background: var(--color-primary-glow); }

.cat-icon { font-size: 20px; margin-bottom: 4px; }
.cat-name { font-size: 13px; font-weight: 600; }
.cat-desc { font-size: 11px; color: var(--color-text-muted); }
.cat-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.depth-options, .schedule-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.radio-option { cursor: pointer; }
.radio-option input { display: none; }

.radio-card {
  padding: 12px 16px;
  background: var(--color-surface-2);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  transition: all 0.15s;
  min-width: 150px;
}

.radio-card:hover { border-color: var(--color-primary); }
.radio-card.selected { border-color: var(--color-primary); background: var(--color-primary-glow); }
.radio-title { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.radio-desc { font-size: 12px; color: var(--color-text-muted); }

/* Summary */
.summary-block {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 4px 0;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border);
}

.summary-row:last-child { border-bottom: none; }
.summary-key { font-size: 13px; font-weight: 600; color: var(--color-text-muted); width: 90px; flex-shrink: 0; }
.summary-val { font-size: 14px; color: var(--color-text); display: flex; flex-wrap: wrap; gap: 6px; }
.mono { font-family: var(--font-mono); font-size: 13px; }

.tag {
  background: var(--color-primary-glow);
  border: 1px solid rgba(99,102,241,0.3);
  color: var(--color-primary);
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.estimated-time {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 28px;
}

.estimated-time strong { color: var(--color-text); }

/* Progress step */
.progress-header { margin-bottom: 20px; }

.scan-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
}

.scan-status-badge.running {
  background: rgba(99,102,241,0.15);
  border: 1px solid rgba(99,102,241,0.3);
  color: #a5b4fc;
}

.scan-status-badge.done {
  background: rgba(16,185,129,0.15);
  border: 1px solid rgba(16,185,129,0.3);
  color: #6ee7b7;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 1.2s ease-in-out infinite;
}

.scan-progress-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.scan-bar-track {
  flex: 1;
  height: 8px;
  background: var(--color-surface-2);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.scan-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #8b5cf6);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.scan-pct { font-size: 14px; font-weight: 700; font-family: var(--font-mono); color: var(--color-primary); min-width: 40px; }

.scan-log {
  background: #0a0a0f;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px 16px;
  font-family: var(--font-mono);
  font-size: 12px;
  max-height: 160px;
  overflow-y: auto;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-line { display: flex; gap: 12px; }
.log-time { color: var(--color-text-muted); flex-shrink: 0; }
.log-msg { color: #d1d5db; }
.log-msg.success { color: #6ee7b7; }
.log-msg.warn { color: #fcd34d; }
.log-msg.error { color: #fca5a5; }

.preview-results {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 20px;
}

.preview-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--color-text-muted); margin-bottom: 12px; }

.finding-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
}

.finding-row:last-child { border-bottom: none; }
.finding-name { font-family: var(--font-mono); flex: 1; color: var(--color-text); }
.finding-cat { color: var(--color-text-muted); font-size: 12px; }

.risk-badge { padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.risk-badge.high { background: rgba(239,68,68,0.15); color: #fca5a5; }
.risk-badge.medium { background: rgba(245,158,11,0.15); color: #fcd34d; }
.risk-badge.low { background: rgba(16,185,129,0.15); color: #6ee7b7; }

.complete-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 20px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.cs-stat { text-align: center; flex: 1; }
.cs-value { font-size: 28px; font-weight: 700; font-family: var(--font-mono); color: var(--color-text); }
.cs-value.risk-high { color: #fca5a5; }
.cs-label { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }

.complete-btns { display: flex; gap: 12px; }
.complete-actions { margin-top: 8px; }

/* Buttons */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s;
}

.btn-primary:hover:not(:disabled) { background: #5558e3; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary.btn-lg { padding: 16px 36px; font-size: 16px; }
.btn-primary.btn-launch { background: linear-gradient(135deg, var(--color-primary), #8b5cf6); }

.btn-outline {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 10px 20px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s;
}

.btn-outline:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-ghost {
  background: none;
  border: none;
  color: var(--color-text-muted);
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  font-family: var(--font-sans);
  transition: color 0.15s;
}

.btn-ghost:hover { color: var(--color-text); }

.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.spinner-inline { display: inline-block; animation: spin 1s linear infinite; }

/* Transitions */
.step-enter-active, .step-leave-active { transition: all 0.25s ease; }
.step-enter-from { opacity: 0; transform: translateX(24px); }
.step-leave-to { opacity: 0; transform: translateX(-24px); }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .step-card { padding: 24px 16px; }
  .form-row-2 { grid-template-columns: 1fr; }
  .depth-options { flex-direction: column; }
}
</style>
