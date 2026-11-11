export type ProjectStatus = 'active' | 'completed' | 'archived';

export type SemanticType =
  | 'identifier'
  | 'date'
  | 'categorical'
  | 'numerical'
  | 'target'
  | 'text'
  | 'unknown';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  university: string | null;
  major: string | null;
  academic_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  analysis_type: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  project_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  row_count: number;
  column_count: number;
  file_size: number;
  current_version: number;
  uploaded_at: string;
}

export interface DatasetColumn {
  id: string;
  dataset_id: string;
  column_name: string;
  data_type: 'integer' | 'float' | 'string' | 'boolean' | 'datetime';
  semantic_type: SemanticType;
  missing_count: number;
  unique_count: number;
  min_value: string | null;
  max_value: string | null;
  mean: number | null;
  median: number | null;
  std_dev: number | null;
  sample_values: any[];
  frequency_distribution: Record<string, number>;
  created_at: string;
}

export interface CleaningOperation {
  id: string;
  dataset_id: string;
  operation_type:
    | 'remove_duplicates'
    | 'fill_missing'
    | 'standardize_category'
    | 'convert_data_type'
    | 'remove_columns'
    | 'filter_rows'
    | 'handle_outliers';
  column_name: string | null;
  parameters: Record<string, any>;
  description: string;
  version_step: number;
  created_at: string;
}

export interface Analysis {
  id: string;
  project_id: string;
  dataset_id: string | null;
  analysis_type:
    | 'descriptive'
    | 'correlation'
    | 't_test'
    | 'anova'
    | 'mann_whitney'
    | 'kruskal_wallis'
    | 'chi_square'
    | 'regression';
  parameters: Record<string, any>;
  assumptions_check: {
    normality?: { passed: boolean; test: string; p_value: number; note: string };
    homoscedasticity?: { passed: boolean; test: string; p_value: number; note: string };
    multicollinearity?: { passed: boolean; max_vif: number; note: string };
    sample_size?: { passed: boolean; count: number; note: string };
    recommended_alternative?: string | null;
  };
  numerical_results: Record<string, any>;
  ai_interpretation: {
    finding: string;
    interpretation: string;
    business_implication: string;
    limitations: string;
  } | null;
  created_at: string;
}

export interface Visualization {
  id: string;
  project_id: string;
  analysis_id: string | null;
  chart_type: 'bar' | 'line' | 'scatter' | 'histogram' | 'box' | 'pie' | 'heatmap' | 'table';
  configuration: Record<string, any>;
  title: string;
  description: string | null;
  ai_explanation: string | null;
  created_at: string;
}

export interface AnalysisRecommendation {
  id: string;
  project_id: string;
  recommendation_type: 'relationship' | 'comparison' | 'trend' | 'distribution';
  question: string;
  reason: string;
  suggested_test: string;
  priority: number;
  created_at: string;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'chart' | 'stats_table' | 'interpretation';
  content: string;
  chart_id?: string;
  is_ai_generated?: boolean;
}

export interface Report {
  id: string;
  project_id: string;
  title: string;
  content: ReportSection[];
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

