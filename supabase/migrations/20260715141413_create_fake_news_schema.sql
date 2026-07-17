/*
# Fake News Detection System - Core Schema

## Overview
Creates the full database backend for an AI-Based Fake News Detection System.
Supports user accounts, prediction history, analysis reports, and admin audit logs.

## New Tables
1. `profiles` - Extends auth.users with role (admin/user), full_name, created_at.
2. `predictions` - Stores each fake/real detection run: input text, label, confidence, probabilities, suspicious words, explanation, source.
3. `reports` - Aggregated analysis reports generated from predictions (for export).
4. `admin_logs` - Audit trail of admin actions (user management, exports, dataset ops).

## Security
- RLS enabled on every table.
- profiles: each user reads/updates own row; admins read all.
- predictions: owner-scoped CRUD (user_id DEFAULT auth.uid()); admins read all via is_admin() check.
- reports: owner-scoped; admins read all.
- admin_logs: admin-only insert/select; users cannot access.

## Important Notes
1. A trigger auto-creates a profile row with default role 'user' on signup.
2. `is_admin()` SQL function checks the requesting user's role in profiles.
3. user_id columns default to auth.uid() so client inserts omitting user_id still pass RLS.
4. The first registered user is NOT auto-promoted to admin; an admin must be seeded manually via SQL if needed.
*/

-- ============================================================
-- 1. TABLES (all created first, before any functions/policies)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text text NOT NULL,
  title text,
  label text NOT NULL CHECK (label IN ('Fake','Real')),
  confidence numeric(6,4) NOT NULL,
  prob_fake numeric(6,4) NOT NULL,
  prob_real numeric(6,4) NOT NULL,
  suspicious_words jsonb,
  explanation text,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. FUNCTIONS (created after tables, before policies)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. RLS ENABLE + POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- profiles policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- predictions policies
DROP POLICY IF EXISTS "predictions_select_own_or_admin" ON public.predictions;
CREATE POLICY "predictions_select_own_or_admin"
ON public.predictions FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "predictions_insert_own" ON public.predictions;
CREATE POLICY "predictions_insert_own"
ON public.predictions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "predictions_delete_own" ON public.predictions;
CREATE POLICY "predictions_delete_own"
ON public.predictions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- reports policies
DROP POLICY IF EXISTS "reports_select_own_or_admin" ON public.reports;
CREATE POLICY "reports_select_own_or_admin"
ON public.reports FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
CREATE POLICY "reports_insert_own"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports_delete_own_or_admin" ON public.reports;
CREATE POLICY "reports_delete_own_or_admin"
ON public.reports FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- admin_logs policies
DROP POLICY IF EXISTS "admin_logs_admin_all" ON public.admin_logs;
CREATE POLICY "admin_logs_admin_all"
ON admin_logs FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_logs_insert_admin" ON public.admin_logs;
CREATE POLICY "admin_logs_insert_admin"
ON admin_logs FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- ============================================================
-- 4. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at desc);
CREATE INDEX IF NOT EXISTS idx_predictions_label ON public.predictions(label);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at desc);
