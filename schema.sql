-- ==============================================================================
-- FKS Carrom Open 2027 — Supabase PostgreSQL Schema
-- ==============================================================================

-- 1. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    mobile_number TEXT,
    events TEXT NOT NULL,
    partner_name TEXT,
    total_fee NUMERIC DEFAULT 0,
    payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Cancelled')),
    cash_collector TEXT,
    payment_date TIMESTAMPTZ
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_registrations_grade_event ON public.registrations(grade, events);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations(payment_status);

-- 2. VOLUNTEERS TABLE
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    full_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    judging_events TEXT NOT NULL,
    assigned_station INT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Standby', 'Inactive'))
);

CREATE INDEX IF NOT EXISTS idx_volunteers_status ON public.volunteers(status);

-- 3. TOURNAMENT RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    event TEXT NOT NULL, -- 'Solos', 'Doubles', 'Open Doubles'
    round TEXT NOT NULL, -- 'Top 64', 'Top 32', 'Top 16', 'Quarter-Finals', 'Semi-Finals', 'Finals'
    rank INT DEFAULT 0,
    competitor_id TEXT NOT NULL,
    name TEXT NOT NULL,
    partner_name TEXT,
    grade TEXT,
    score TEXT DEFAULT '0',
    station INT DEFAULT 0,
    status TEXT DEFAULT 'Completed' CHECK (status IN ('Upcoming', 'Live', 'Completed'))
);

CREATE INDEX IF NOT EXISTS idx_results_event_round ON public.results(event, round);
CREATE INDEX IF NOT EXISTS idx_results_competitor ON public.results(competitor_id);

-- 4. VOLUNTEER NEWS & BROADCAST NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT DEFAULT 'Secretariat',
    priority TEXT DEFAULT 'Standard' CHECK (priority IN ('Standard', 'High', 'Urgent')),
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_notices_priority ON public.notices(priority);

-- Row-Level Security (RLS) Setup
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active notices and results
CREATE POLICY "Public read access for results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Public read access for notices" ON public.notices FOR SELECT USING (active = true);
CREATE POLICY "Public insert access for registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access for volunteers" ON public.volunteers FOR INSERT WITH CHECK (true);

-- Allow full access for backend service role key
CREATE POLICY "Service role full access on registrations" ON public.registrations USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on volunteers" ON public.volunteers USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on results" ON public.results USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on notices" ON public.notices USING (true) WITH CHECK (true);
