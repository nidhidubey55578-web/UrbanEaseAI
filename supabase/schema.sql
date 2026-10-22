-- ============================================================
-- UrbanEase AI — Supabase Database Schema & RLS Policies
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. USER PROFILES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     TEXT UNIQUE,
  full_name   TEXT,
  email       TEXT,
  preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on user_profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on user_profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on user_profiles"
  ON public.user_profiles FOR UPDATE
  USING (true);

-- ------------------------------------------------------------
-- 2. BARRIER REPORTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.barrier_reports (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  severity    TEXT NOT NULL DEFAULT 'Medium',
  location    TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'Under Review',
  date        TEXT DEFAULT 'Today',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.barrier_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on barrier_reports"
  ON public.barrier_reports FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on barrier_reports"
  ON public.barrier_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on barrier_reports"
  ON public.barrier_reports FOR UPDATE
  USING (true);

-- ------------------------------------------------------------
-- 3. SAVED PLACES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_places (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT,
  address     TEXT,
  score       INTEGER DEFAULT 90,
  distance    TEXT,
  features    TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on saved_places"
  ON public.saved_places FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on saved_places"
  ON public.saved_places FOR INSERT
  WITH CHECK (true);

-- ------------------------------------------------------------
-- 4. SAVED ROUTES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_routes (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  score        INTEGER DEFAULT 90,
  time_minutes INTEGER DEFAULT 25,
  distance     TEXT,
  traits       TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on saved_routes"
  ON public.saved_routes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on saved_routes"
  ON public.saved_routes FOR INSERT
  WITH CHECK (true);
