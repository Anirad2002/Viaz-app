import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { mockScans, mockReports, mockChartData } from '../data/mock.js'

export const useAppStore = defineStore('app', () => {
  const onboardingDone = ref(false)
  const scans = ref([...mockScans])
  const reports = ref([...mockReports])
  const chartData = ref({ ...mockChartData })
  const darkMode = ref(true)

  // KPI — zawsze obliczane z rzeczywistych danych
  const kpis = computed(() => ({
    totalScans: scans.value.length,
    activeScans: scans.value.filter(s => s.status === 'running').length,
    totalItems: scans.value.filter(s => s.status === 'completed').reduce((a, s) => a + (s.itemsFound || 0), 0),
    highRiskItems: scans.value.filter(s => s.status === 'completed').reduce((a, s) => {
      return a + (s.results || []).filter(r => r.risk === 'high').reduce((b, r) => b + r.count, 0)
    }, 0),
    sourcesConnected: new Set(scans.value.map(s => s.source)).size,
    reportsGenerated: reports.value.length,
  }))

  // Ostatnia aktywność — generowana z rzeczywistych skanów i raportów
  const activity = computed(() => {
    const events = []

    scans.value.slice(0, 10).forEach(s => {
      if (s.status === 'completed') {
        events.push({ id: 'sc-' + s.id, type: 'scan_completed', text: s.name + ' zakończony', time: formatRelative(s.completedAt || s.createdAt), ts: new Date(s.completedAt || s.createdAt).getTime() })
      } else if (s.status === 'running') {
        events.push({ id: 'sr-' + s.id, type: 'scan_started', text: s.name + ' — skan w toku', time: formatRelative(s.createdAt), ts: new Date(s.createdAt).getTime() })
      } else if (s.status === 'error') {
        events.push({ id: 'se-' + s.id, type: 'scan_error', text: s.name + ' — błąd skanu', time: formatRelative(s.createdAt), ts: new Date(s.createdAt).getTime() })
      }
    })

    reports.value.slice(0, 5).forEach(r => {
      events.push({ id: 'rg-' + r.id, type: 'report_generated', text: r.title + ' — raport wygenerowany', time: formatRelative(r.createdAt), ts: new Date(r.createdAt).getTime() })
    })

    return events.sort((a, b) => b.ts - a.ts).slice(0, 8)
  })

  function formatRelative(iso) {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const min = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (min < 2) return 'Przed chwilą'
    if (min < 60) return `${min} min temu`
    if (h < 24) return `${h} godz. temu`
    if (d === 1) return 'Wczoraj'
    if (d < 7) return `${d} dni temu`
    return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
  }

  function completeOnboarding() {
    onboardingDone.value = true
  }

  function addScan(scan) {
    scans.value.unshift(scan)
  }

  function addReport(report) {
    reports.value.unshift(report)
  }

  function getScan(id) {
    return scans.value.find(s => s.id === id)
  }

  function getReport(id) {
    return reports.value.find(r => r.id === id)
  }

  function toggleDark() {
    darkMode.value = !darkMode.value
  }

  return { onboardingDone, scans, reports, kpis, chartData, activity, darkMode, completeOnboarding, addScan, addReport, getScan, getReport, toggleDark }
})
