export type WorkspaceStep =
  | 'overview'
  | 'quality'
  | 'cleaning'
  | 'eda'
  | 'recommendations'
  | 'statistical'
  | 'visualizer'
  | 'insights'
  | 'report';

export interface WorkflowStepMeta {
  id: WorkspaceStep;
  label: string;
  description: string;
  iconName: string;
}

export const WORKFLOW_STEPS: WorkflowStepMeta[] = [
  {
    id: 'overview',
    label: 'Ringkasan & Profiling',
    description: 'Struktur kolom, tipe semantik, dan ringkasan nilai',
    iconName: 'Database',
  },
  {
    id: 'quality',
    label: 'Kualitas Data',
    description: 'Deteksi duplikat, nilai kosong, inkonsistensi, dan anomali',
    iconName: 'ShieldAlert',
  },
  {
    id: 'cleaning',
    label: 'Pembersihan Data',
    description: 'Imputasi, standardisasi kategori, filter, dan histori',
    iconName: 'Sparkles',
  },
  {
    id: 'eda',
    label: 'Eksplorasi (EDA)',
    description: 'Distribusi univariat, bivariat, dan matriks korelasi',
    iconName: 'BarChart2',
  },
  {
    id: 'recommendations',
    label: 'Rekomendasi Analisis',
    description: 'Saran pertanyaan penelitian dan uji statistik relevan',
    iconName: 'Lightbulb',
  },
  {
    id: 'statistical',
    label: 'Uji Statistik',
    description: 'Uji hipotesis, cek asumsi normalitas, dan regresi',
    iconName: 'Calculator',
  },
  {
    id: 'visualizer',
    label: 'Visualisasi',
    description: 'Pembuat grafik kustom dan penjelasan visual',
    iconName: 'PieChart',
  },
  {
    id: 'insights',
    label: 'Insight Bisnis',
    description: 'Translasi statistik ke implikasi bisnis dan batasan studi',
    iconName: 'TrendingUp',
  },
  {
    id: 'report',
    label: 'Penyusun Laporan',
    description: 'Draft laporan akademis terstruktur dan ekspor dokumen',
    iconName: 'FileText',
  },
];

export interface DataQualityReport {
  totalRows: number;
  totalColumns: number;
  duplicateRows: number;
  missingValuesTotal: number;
  missingValuesPercentage: number;
  inconsistentCategories: {
    column: string;
    variants: string[];
    suggestedStandard: string;
  }[];
  outlierCount: {
    column: string;
    count: number;
    method: 'IQR' | 'Z-score';
  }[];
}

