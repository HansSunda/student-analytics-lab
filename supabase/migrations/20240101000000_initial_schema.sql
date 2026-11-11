-- ==============================================================================
-- STUDENT ANALYTICS LAB - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase PostgreSQL (Run in Supabase SQL Editor)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('active', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE semantic_type AS ENUM (
        'identifier',
        'date',
        'categorical',
        'numerical',
        'target',
        'text',
        'unknown'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------------------------

-- PROFILES (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    university TEXT,
    major TEXT,
    academic_level TEXT, -- e.g. 'Undergraduate / S1', 'Graduate / S2'
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    analysis_type TEXT DEFAULT 'general',
    status project_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- DATASETS
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'csv', 'xlsx', 'xls'
    storage_path TEXT NOT NULL,
    row_count INTEGER DEFAULT 0 NOT NULL,
    column_count INTEGER DEFAULT 0 NOT NULL,
    file_size BIGINT DEFAULT 0 NOT NULL, -- in bytes
    current_version INTEGER DEFAULT 1 NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- DATASET COLUMNS (Metadata per column)
CREATE TABLE IF NOT EXISTS public.dataset_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    data_type TEXT NOT NULL, -- 'integer', 'float', 'string', 'boolean', 'datetime'
    semantic_type semantic_type DEFAULT 'unknown' NOT NULL,
    missing_count INTEGER DEFAULT 0 NOT NULL,
    unique_count INTEGER DEFAULT 0 NOT NULL,
    min_value TEXT,
    max_value TEXT,
    mean NUMERIC,
    median NUMERIC,
    std_dev NUMERIC,
    sample_values JSONB DEFAULT '[]'::jsonb,
    frequency_distribution JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- DATASET VERSIONS (Version tracking for cleaning & audit trail)
CREATE TABLE IF NOT EXISTS public.dataset_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    operation_applied TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    column_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- CLEANING OPERATIONS (Log of operations applied to dataset)
CREATE TABLE IF NOT EXISTS public.cleaning_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    operation_type TEXT NOT NULL, -- 'remove_duplicates', 'fill_missing', 'standardize_category', 'convert_data_type', 'remove_columns', 'filter_rows', 'handle_outliers'
    column_name TEXT,
    parameters JSONB DEFAULT '{}'::jsonb NOT NULL,
    description TEXT NOT NULL,
    version_step INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ANALYSES (Deterministic statistical results & AI interpretation)
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE SET NULL,
    analysis_type TEXT NOT NULL, -- 'descriptive', 'correlation', 't_test', 'anova', 'mann_whitney', 'kruskal_wallis', 'chi_square', 'regression'
    parameters JSONB DEFAULT '{}'::jsonb NOT NULL,
    assumptions_check JSONB DEFAULT '{}'::jsonb NOT NULL, -- e.g. { normality: { passed: false, p_value: 0.01, test: 'shapiro' } }
    numerical_results JSONB DEFAULT '{}'::jsonb NOT NULL, -- e.g. { statistic: 0.42, p_value: 0.001, sample_size: 450 }
    ai_interpretation JSONB DEFAULT '{}'::jsonb NOT NULL, -- e.g. { finding: '...', business_implication: '...', limitations: '...' }
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- VISUALIZATIONS
CREATE TABLE IF NOT EXISTS public.visualizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
    chart_type TEXT NOT NULL, -- 'bar', 'line', 'scatter', 'histogram', 'box', 'pie', 'heatmap', 'table'
    configuration JSONB DEFAULT '{}'::jsonb NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ai_explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ANALYSIS RECOMMENDATIONS (Suggested by system based on dataset profile)
CREATE TABLE IF NOT EXISTS public.analysis_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL, -- 'relationship', 'comparison', 'trend', 'distribution'
    question TEXT NOT NULL,
    reason TEXT NOT NULL,
    suggested_test TEXT NOT NULL,
    priority INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- REPORTS (Structured academic & business reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of sections: { id, title, type, text, chartId, isAiGenerated }
    status TEXT DEFAULT 'draft' NOT NULL, -- 'draft', 'published'
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_project_id ON public.datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_dataset_columns_dataset_id ON public.dataset_columns(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_versions_dataset_id ON public.dataset_versions(dataset_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_operations_dataset_id ON public.cleaning_operations(dataset_id);
CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON public.analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_project_id ON public.visualizations(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_recommendations_project_id ON public.analysis_recommendations(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON public.reports(project_id);

-- ------------------------------------------------------------------------------
-- 4. AUTOMATED TRIGGERS (Updated at & Auto-Profile)
-- ------------------------------------------------------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Trigger to auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, university, major, academic_level)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Mahasiswa'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'university',
        NEW.raw_user_meta_data->>'major',
        'Undergraduate / S1'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- PROFILES Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- PROJECTS Policies
CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- DATASETS Policies
CREATE POLICY "Users can access datasets in own projects"
    ON public.datasets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = datasets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- DATASET COLUMNS Policies
CREATE POLICY "Users can access dataset columns in own projects"
    ON public.dataset_columns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.datasets
            JOIN public.projects ON projects.id = datasets.project_id
            WHERE datasets.id = dataset_columns.dataset_id
            AND projects.user_id = auth.uid()
        )
    );

-- DATASET VERSIONS Policies
CREATE POLICY "Users can access dataset versions in own projects"
    ON public.dataset_versions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.datasets
            JOIN public.projects ON projects.id = datasets.project_id
            WHERE datasets.id = dataset_versions.dataset_id
            AND projects.user_id = auth.uid()
        )
    );

-- CLEANING OPERATIONS Policies
CREATE POLICY "Users can access cleaning operations in own projects"
    ON public.cleaning_operations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.datasets
            JOIN public.projects ON projects.id = datasets.project_id
            WHERE datasets.id = cleaning_operations.dataset_id
            AND projects.user_id = auth.uid()
        )
    );

-- ANALYSES Policies
CREATE POLICY "Users can access analyses in own projects"
    ON public.analyses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = analyses.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- VISUALIZATIONS Policies
CREATE POLICY "Users can access visualizations in own projects"
    ON public.visualizations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = visualizations.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- ANALYSIS RECOMMENDATIONS Policies
CREATE POLICY "Users can access recommendations in own projects"
    ON public.analysis_recommendations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = analysis_recommendations.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- REPORTS Policies
CREATE POLICY "Users can access reports in own projects"
    ON public.reports FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = reports.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 6. STORAGE BUCKET CONFIGURATION & POLICIES
-- ------------------------------------------------------------------------------
-- Insert 'datasets' bucket into Supabase storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'datasets',
    'datasets',
    false, -- Private bucket
    52428800, -- 50 MB limit
    ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];

-- Storage RLS: Users can upload, read, update, delete only their own folder
CREATE POLICY "User dataset folder upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'datasets' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "User dataset folder select"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'datasets' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "User dataset folder update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'datasets' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "User dataset folder delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'datasets' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

