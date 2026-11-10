-- ==============================================================================
-- ENTERPRISE OVERHAUL: MULTI-TENANT, MODULAR LICENSES, HEALTH RAG & AUTOMATION
-- Migration: 20261108030000_enterprise_overhaul_schema.sql
-- ==============================================================================

-- 1. ACCOUNT NUMBER SEQUENCE & PROFILES EXPANSION
CREATE SEQUENCE IF NOT EXISTS public.kl_account_number_seq START WITH 1000;

CREATE OR REPLACE FUNCTION public.set_account_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_number IS NULL THEN
    NEW.account_number := 'KL-' || LPAD(nextval('public.kl_account_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS client_state TEXT NOT NULL DEFAULT 'active' CHECK (client_state IN ('active', 'frozen', 'deactivated'));

DROP TRIGGER IF EXISTS trigger_set_account_number ON public.profiles;
CREATE TRIGGER trigger_set_account_number
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_account_number();

-- Backfill any existing profiles missing account numbers
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE account_number IS NULL ORDER BY updated_at ASC LOOP
    UPDATE public.profiles
    SET account_number = 'KL-' || LPAD(nextval('public.kl_account_number_seq')::text, 5, '0')
    WHERE id = r.id;
  END LOOP;
END;
$$;


-- 2. MODULAR LICENSES & ADD-ONS
CREATE TABLE IF NOT EXISTS public.trainer_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'pro' CHECK (tier IN ('starter', 'pro', 'enterprise')),
  max_clients INTEGER NOT NULL DEFAULT 10,
  add_ons JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["recipe_ocr", "cooking_mode", "ai_meal_planner"]
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT trainer_licenses_trainer_id_key UNIQUE (trainer_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_licenses_trainer_id ON public.trainer_licenses(trainer_id);

ALTER TABLE public.trainer_licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers manage their own license" ON public.trainer_licenses;
CREATE POLICY "Trainers manage their own license"
  ON public.trainer_licenses FOR ALL
  USING (trainer_id = auth.uid());

DROP POLICY IF EXISTS "Clients can view their trainer's license" ON public.trainer_licenses;
CREATE POLICY "Clients can view their trainer's license"
  ON public.trainer_licenses FOR SELECT
  USING (
    trainer_id IN (
      SELECT trainer_id FROM public.profiles WHERE id = auth.uid()
    )
  );


-- 3. DYNAMIC HOME SCREEN UI CONFIGURATION
CREATE TABLE IF NOT EXISTS public.trainer_ui_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  home_layout JSONB NOT NULL DEFAULT '[
    {"id": "macros_summary", "type": "MacrosWidget", "order": 0, "visible": true, "props": {"showRemaining": true}},
    {"id": "steps_rag_card", "type": "StepsRAGWidget", "order": 1, "visible": true, "props": {"colorScheme": "traffic"}},
    {"id": "cooking_mode_banner", "type": "CookingModeBanner", "order": 2, "visible": true, "props": {}, "requiredAddon": "cooking_mode"},
    {"id": "recent_meals", "type": "RecentMealsWidget", "order": 3, "visible": true, "props": {"maxItems": 4}}
  ]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT trainer_ui_configs_trainer_id_key UNIQUE (trainer_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_ui_configs_trainer_id ON public.trainer_ui_configs(trainer_id);

ALTER TABLE public.trainer_ui_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers manage their own UI config" ON public.trainer_ui_configs;
CREATE POLICY "Trainers manage their own UI config"
  ON public.trainer_ui_configs FOR ALL
  USING (trainer_id = auth.uid());

DROP POLICY IF EXISTS "Clients can view their trainer's UI config" ON public.trainer_ui_configs;
CREATE POLICY "Clients can view their trainer's UI config"
  ON public.trainer_ui_configs FOR SELECT
  USING (
    trainer_id IN (
      SELECT trainer_id FROM public.profiles WHERE id = auth.uid()
    )
  );


-- 4. HEALTH DATA COMPLIANCE (RAG BYPASS ONLY)
CREATE TABLE IF NOT EXISTS public.client_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps_rag TEXT NOT NULL CHECK (steps_rag IN ('red', 'amber', 'green')),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT client_health_metrics_user_date_key UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_client_health_metrics_user_date ON public.client_health_metrics(user_id, date);

ALTER TABLE public.client_health_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own health RAG metrics" ON public.client_health_metrics;
CREATE POLICY "Users can manage their own health RAG metrics"
  ON public.client_health_metrics FOR ALL
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Trainers can view their clients' health RAG metrics" ON public.client_health_metrics;
CREATE POLICY "Trainers can view their clients' health RAG metrics"
  ON public.client_health_metrics FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE trainer_id = auth.uid()
    )
  );

-- 5. SINGLE-USE TRAINER INVITES
CREATE TABLE IF NOT EXISTS public.trainer_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),
  used_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_invites_code ON public.trainer_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_trainer_invites_trainer ON public.trainer_invites(trainer_id);

ALTER TABLE public.trainer_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers manage their own invite links" ON public.trainer_invites;
CREATE POLICY "Trainers manage their own invite links"
  ON public.trainer_invites FOR ALL
  USING (trainer_id = auth.uid());

DROP POLICY IF EXISTS "Public read for active invite validation" ON public.trainer_invites;
CREATE POLICY "Public read for active invite validation"
  ON public.trainer_invites FOR SELECT
  USING (status = 'active');


-- 6. SERVER-VERIFIED CLIENT ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.client_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- e.g. 'macro_streak_7', 'recipe_cooked_first', 'steps_green_14'
  title TEXT NOT NULL,
  description TEXT,
  server_verified BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT client_achievements_user_type_key UNIQUE (user_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS idx_client_achievements_user ON public.client_achievements(user_id);

ALTER TABLE public.client_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own achievements" ON public.client_achievements;
CREATE POLICY "Users can view their own achievements"
  ON public.client_achievements FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Trainers can view their clients' achievements" ON public.client_achievements;
CREATE POLICY "Trainers can view their clients' achievements"
  ON public.client_achievements FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE trainer_id = auth.uid()
    )
  );


-- 7. AI ROSTER SUMMARIES
CREATE TABLE IF NOT EXISTS public.ai_roster_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary_period_start DATE NOT NULL,
  summary_period_end DATE NOT NULL,
  metrics_overview JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_summary_text TEXT NOT NULL,
  action_items JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_roster_summaries_trainer ON public.ai_roster_summaries(trainer_id);

ALTER TABLE public.ai_roster_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers view their own AI roster summaries" ON public.ai_roster_summaries;
CREATE POLICY "Trainers view their own AI roster summaries"
  ON public.ai_roster_summaries FOR SELECT
  USING (trainer_id = auth.uid());


-- 8. IDEAS HUB & DEDUPLICATION
CREATE TABLE IF NOT EXISTS public.ideas_hub (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  dedup_group_id UUID REFERENCES public.ideas_hub(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'feature' CHECK (category IN ('feature', 'ui', 'recipe', 'bug')),
  upvotes_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'planned', 'in_progress', 'completed', 'duplicate')),
  ai_similarity_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ideas_hub_dedup_group ON public.ideas_hub(dedup_group_id);

CREATE TABLE IF NOT EXISTS public.ideas_hub_votes (
  idea_id UUID NOT NULL REFERENCES public.ideas_hub(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (idea_id, user_id)
);

ALTER TABLE public.ideas_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas_hub_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view ideas" ON public.ideas_hub;
CREATE POLICY "Authenticated users can view ideas"
  ON public.ideas_hub FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create their own ideas" ON public.ideas_hub;
CREATE POLICY "Users can create their own ideas"
  ON public.ideas_hub FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own ideas" ON public.ideas_hub;
CREATE POLICY "Users can update their own ideas"
  ON public.ideas_hub FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view and cast votes" ON public.ideas_hub_votes;
CREATE POLICY "Users can view and cast votes"
  ON public.ideas_hub_votes FOR ALL
  USING (user_id = auth.uid());

-- Trigger to sync upvote counts on ideas_hub
CREATE OR REPLACE FUNCTION public.sync_idea_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ideas_hub
    SET upvotes_count = upvotes_count + 1
    WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ideas_hub
    SET upvotes_count = GREATEST(0, upvotes_count - 1)
    WHERE id = OLD.idea_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_idea_votes ON public.ideas_hub_votes;
CREATE TRIGGER trigger_sync_idea_votes
  AFTER INSERT OR DELETE ON public.ideas_hub_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_idea_votes_count();


-- 9. SUPPORT TICKETS (AI AUTO-REPLY & ESCALATION)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  ai_reply TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'ai_resolved', 'human_needed', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own support tickets" ON public.support_tickets;
CREATE POLICY "Users manage their own support tickets"
  ON public.support_tickets FOR ALL
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Trainers can view their clients' support tickets" ON public.support_tickets;
CREATE POLICY "Trainers can view their clients' support tickets"
  ON public.support_tickets FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE trainer_id = auth.uid()
    )
  );


