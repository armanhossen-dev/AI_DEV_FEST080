-- ==============================================================================
-- upay Sentinel: Behavioral Profiling & AI Agent Copilot Schema (Migration 2)
-- ==============================================================================

-- 1. CUSTOMER BEHAVIOR PROFILES
CREATE TABLE IF NOT EXISTS customer_behavior_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_identifier TEXT UNIQUE NOT NULL,
    average_amount NUMERIC(12,2) NOT NULL DEFAULT 2100.00,
    median_amount NUMERIC(12,2) NOT NULL DEFAULT 1800.00,
    transaction_count_daily NUMERIC(5,2) NOT NULL DEFAULT 2.5,
    normal_transaction_start_hour INT NOT NULL DEFAULT 8,
    normal_transaction_end_hour INT NOT NULL DEFAULT 22,
    known_device_count INT NOT NULL DEFAULT 1,
    known_beneficiary_count INT NOT NULL DEFAULT 4,
    typical_location TEXT NOT NULL DEFAULT 'Dhaka',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ALTER RISK ASSESSMENTS TO ADD BEHAVIOR AND CONTEXTUAL SCORES IF NOT PRESENT
ALTER TABLE risk_assessments 
ADD COLUMN IF NOT EXISTS behavior_score NUMERIC(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS contextual_score NUMERIC(5,2) DEFAULT 0.00;

-- 3. AI AGENT SESSIONS
CREATE TABLE IF NOT EXISTS ai_agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. AI AGENT MESSAGES
CREATE TABLE IF NOT EXISTS ai_agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_agent_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    tool_name TEXT,
    tool_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_behavior_customer ON customer_behavior_profiles (customer_identifier);
CREATE INDEX IF NOT EXISTS idx_agent_messages_session ON ai_agent_messages (session_id);

-- 6. ROW LEVEL SECURITY
ALTER TABLE customer_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Behavior profiles accessible"
    ON customer_behavior_profiles FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Agent sessions accessible"
    ON ai_agent_sessions FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Agent messages accessible"
    ON ai_agent_messages FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);
