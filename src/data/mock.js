export const mockScans = [
  {
    id: 's-001',
    name: 'Audyt bazy danych sprzedaży Q2',
    source: 'PostgreSQL Produkcja',
    sourceType: 'database',
    status: 'completed',
    progress: 100,
    createdAt: '2026-06-20T09:14:00Z',
    completedAt: '2026-06-20T09:47:00Z',
    duration: '33 min',
    itemsFound: 1842,
    categories: ['Dane osobowe', 'Dane finansowe', 'Umowy'],
    results: [
      { id: 1, name: 'customers.email', category: 'Dane osobowe', risk: 'high', count: 384 },
      { id: 2, name: 'orders.card_last4', category: 'Dane finansowe', risk: 'high', count: 921 },
      { id: 3, name: 'contracts.pdf', category: 'Umowy', risk: 'medium', count: 47 },
      { id: 4, name: 'users.phone', category: 'Dane osobowe', risk: 'medium', count: 312 },
      { id: 5, name: 'invoices.amount', category: 'Dane finansowe', risk: 'low', count: 178 },
    ]
  },
  {
    id: 's-002',
    name: 'Skanowanie Google Drive HR',
    source: 'Google Drive — Zespół HR',
    sourceType: 'cloud',
    status: 'running',
    progress: 64,
    createdAt: '2026-06-24T08:00:00Z',
    completedAt: null,
    duration: null,
    itemsFound: 503,
    categories: ['Dane osobowe', 'Akta pracownicze'],
    results: []
  },
  {
    id: 's-003',
    name: 'Zasobnik S3 Marketing',
    source: 'AWS S3 — marketing-assets',
    sourceType: 'cloud',
    status: 'error',
    progress: 12,
    createdAt: '2026-06-23T14:30:00Z',
    completedAt: null,
    duration: null,
    itemsFound: 0,
    categories: [],
    results: []
  },
  {
    id: 's-004',
    name: 'Eksport starego CRM',
    source: 'Plik CSV',
    sourceType: 'upload',
    status: 'completed',
    progress: 100,
    createdAt: '2026-06-18T11:00:00Z',
    completedAt: '2026-06-18T11:22:00Z',
    duration: '22 min',
    itemsFound: 667,
    categories: ['Dane osobowe', 'Dane finansowe'],
    results: [
      { id: 1, name: 'contact_name', category: 'Dane osobowe', risk: 'low', count: 667 },
      { id: 2, name: 'billing_address', category: 'Dane osobowe', risk: 'medium', count: 412 },
      { id: 3, name: 'payment_token', category: 'Dane finansowe', risk: 'high', count: 89 },
    ]
  },
]

export const mockReports = [
  {
    id: 'r-001',
    title: 'Raport zgodności danych Q2',
    scanId: 's-001',
    scanName: 'Audyt bazy danych sprzedaży Q2',
    createdAt: '2026-06-21T10:00:00Z',
    status: 'ready',
    pages: 12,
    summary: 'Raport podsumowuje wyniki audytu bazy danych sprzedaży Q2 przeprowadzonego 20 czerwca 2026. Łącznie zidentyfikowano 1 842 wrażliwe elementy danych w 5 kategoriach.',
    sections: [
      { title: 'Streszczenie wykonawcze', content: 'Audyt bazy danych sprzedaży Q2 ujawnił znaczne skupiska danych osobowych (RODO) i danych finansowych w wielu tabelach. Zaleca się natychmiastowe działania w odniesieniu do 1 305 elementów wysokiego ryzyka, w szczególności adresów e-mail klientów i danych kart płatniczych.' },
      { title: 'Wyniki — dane osobowe', content: 'Dane osobowe znaleziono w 2 polach: customers.email (384 rekordy) i users.phone (312 rekordów). Pola te są przechowywane bez szyfrowania i dostępne dla 14 użytkowników bazy danych.' },
      { title: 'Dane finansowe', content: 'Wykryto rekordy finansowe, w tym częściowe numery kart (921 rekordów) i kwoty faktur (178 rekordów). Pole card_last4 stanowi szczególne ryzyko, ponieważ może być łączone z innymi danymi osobowymi w celu identyfikacji.' },
      { title: 'Zalecenia', content: 'Zalecamy: (1) Szyfrowanie wszystkich pól z danymi osobowymi metodą AES-256, (2) Wdrożenie kontroli dostępu na poziomie kolumn dla danych finansowych, (3) Skonfigurowanie automatycznych alertów przy masowym eksporcie danych, (4) Zaplanowanie kwartalnych skanów w celu monitorowania wzrostu danych.' },
    ]
  },
  {
    id: 'r-002',
    title: 'Raport migracji starego CRM',
    scanId: 's-004',
    scanName: 'Eksport starego CRM',
    createdAt: '2026-06-19T09:30:00Z',
    status: 'ready',
    pages: 7,
    summary: 'Raport gotowości migracji dla zbioru danych starego CRM. Przeanalizowano 667 rekordów kontaktowych, z których 89 tokenów płatniczych wysokiego ryzyka wymaga usunięcia przed migracją.',
    sections: [
      { title: 'Przegląd', content: 'Analiza pliku eksportu starego CRM zawierającego 667 rekordów kontaktowych. Zbiór danych obejmuje interakcje z klientami z lat 2019–2024 i jest zaplanowany do migracji na nową platformę CRM.' },
      { title: 'Ocena ryzyka', content: '89 tokenów płatniczych wykryto w surowym zbiorze danych. Tokeny te, choć nieważne już u operatora płatności, stanowią ryzyko compliance i powinny zostać usunięte przed migracją.' },
    ]
  },
]

export const mockKPIs = {
  totalScans: 24,
  activeScans: 1,
  totalItems: 18432,
  highRiskItems: 3841,
  sourcesConnected: 6,
  reportsGenerated: 11,
}

export const mockChartData = {
  itemsByCategory: [
    { name: 'Dane osobowe', value: 8234 },
    { name: 'Dane finansowe', value: 4921 },
    { name: 'Akta pracownicze', value: 2847 },
    { name: 'Umowy', value: 1563 },
    { name: 'Inne', value: 867 },
  ],
  scansOverTime: [
    { month: 'Sty', scans: 2, items: 1200 },
    { month: 'Lut', scans: 3, items: 2100 },
    { month: 'Mar', scans: 4, items: 3400 },
    { month: 'Kwi', scans: 5, items: 4800 },
    { month: 'Maj', scans: 6, items: 6200 },
    { month: 'Cze', scans: 4, items: 8432 },
  ],
  riskDistribution: [
    { name: 'Wysokie', value: 3841, color: '#ef4444' },
    { name: 'Średnie', value: 7892, color: '#f59e0b' },
    { name: 'Niskie', value: 6699, color: '#10b981' },
  ]
}

export const mockActivity = [
  { id: 1, type: 'scan_completed', text: 'Audyt bazy danych sprzedaży Q2 zakończony', time: '4 dni temu', icon: 'check_circle' },
  { id: 2, type: 'report_generated', text: 'Raport zgodności danych Q2 wygenerowany', time: '3 dni temu', icon: 'description' },
  { id: 3, type: 'scan_started', text: 'Skanowanie Google Drive HR rozpoczęte', time: 'Dziś, 08:00', icon: 'play_circle' },
  { id: 4, type: 'scan_error', text: 'Skanowanie zasobnika S3 Marketing nie powiodło się', time: 'Wczoraj, 14:30', icon: 'error' },
]

export const sourceTypes = [
  { id: 'postgresql', label: 'PostgreSQL', icon: '🐘', category: 'Baza danych' },
  { id: 'mysql', label: 'MySQL', icon: '🐬', category: 'Baza danych' },
  { id: 'mongodb', label: 'MongoDB', icon: '🍃', category: 'Baza danych' },
  { id: 'google-drive', label: 'Google Drive', icon: '📁', category: 'Chmura' },
  { id: 'aws-s3', label: 'AWS S3', icon: '🪣', category: 'Chmura' },
  { id: 'onedrive', label: 'OneDrive', icon: '☁️', category: 'Chmura' },
  { id: 'csv', label: 'CSV / Excel', icon: '📊', category: 'Plik' },
  { id: 'api', label: 'REST API', icon: '🔌', category: 'API' },
]
