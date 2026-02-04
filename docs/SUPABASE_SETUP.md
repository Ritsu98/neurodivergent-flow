# Supabase Setup Guide

Instrukcja konfiguracji bazy danych Supabase dla aplikacji Neurodivergent Flow.

## 📋 Spis treści

1. [Utworzenie projektu Supabase](#1-utworzenie-projektu-supabase)
2. [Schemat bazy danych](#2-schemat-bazy-danych)
3. [Row Level Security (RLS)](#3-row-level-security-rls)
4. [Seed danych początkowych](#4-seed-danych-początkowych)
5. [Konfiguracja zmiennych środowiskowych](#5-konfiguracja-zmiennych-środowiskowych)
6. [Testowanie połączenia](#6-testowanie-połączenia)

---

## 1. Utworzenie projektu Supabase

1. Przejdź do [https://supabase.com](https://supabase.com)
2. Zaloguj się lub utwórz konto
3. Kliknij **"New Project"**
4. Wypełnij formularz:
   - **Name**: `neurodivergent-flow` (lub wybrana nazwa)
   - **Database Password**: Wygeneruj silne hasło (zapisz je!)
   - **Region**: Wybierz najbliższy region
   - **Pricing Plan**: Free tier (wystarczy na MVP)
5. Kliknij **"Create new project"**
6. Poczekaj na utworzenie projektu (~2 minuty)

---

## 2. Schemat bazy danych

### 2.1 Przejdź do SQL Editor

W panelu Supabase:
1. Kliknij **"SQL Editor"** w menu bocznym
2. Kliknij **"New query"**

### 2.2 Utwórz wszystkie tabele

Skopiuj i wykonaj poniższy SQL w SQL Editor:

```sql
-- ============================================
-- NEURODIVERGENT FLOW - Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: user_prefs
-- ============================================
CREATE TABLE IF NOT EXISTS user_prefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Work windows
  work_mode TEXT NOT NULL CHECK (work_mode IN ('none', 'weekdays', 'irregular')) DEFAULT 'none',
  work_windows JSONB,
  after_work_energy TEXT CHECK (after_work_energy IN ('low', 'mixed', 'decent')),
  preferred_primary_block_time TEXT CHECK (preferred_primary_block_time IN ('morning', 'afternoon', 'evening')),
  
  -- Sleep
  sleep_window_start TIME,
  sleep_window_end TIME,
  downshift_reminder_enabled BOOLEAN DEFAULT true,
  
  -- Weekly defaults
  week_intensity_default TEXT NOT NULL CHECK (week_intensity_default IN ('light', 'normal', 'heavy')) DEFAULT 'normal',
  recharge_defaults TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Notifications
  notification_preferences JSONB DEFAULT '{}'::JSONB,
  
  -- Accessibility
  high_contrast_enabled BOOLEAN DEFAULT false,
  reduced_motion_enabled BOOLEAN DEFAULT false,
  haptics_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_prefs_user_id ON user_prefs(user_id);

-- ============================================
-- Table: week_plans
-- ============================================
CREATE TABLE IF NOT EXISTS week_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  start_date DATE NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('light', 'normal', 'heavy')),
  weekly_outcomes TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Day themes (7 days, indexed 0-6 for Mon-Sun)
  day_themes JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, start_date)
);

CREATE INDEX IF NOT EXISTS idx_week_plans_user_id ON week_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_week_plans_start_date ON week_plans(start_date);

-- ============================================
-- Table: tasks
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_plan_id UUID REFERENCES week_plans(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  outcome TEXT,
  next_step TEXT,
  
  day INTEGER CHECK (day >= 0 AND day <= 6),
  status TEXT NOT NULL CHECK (status IN ('this_week', 'today', 'done')) DEFAULT 'this_week',
  
  is_mvd_essential BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  synced_at TIMESTAMPTZ,
  local_id TEXT,
  device_id TEXT,
  revision INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_week_plan_id ON tasks(week_plan_id);
CREATE INDEX IF NOT EXISTS idx_tasks_day_status ON tasks(day, status);

-- ============================================
-- Table: energy_logs
-- ============================================
CREATE TABLE IF NOT EXISTS energy_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  logged_at DATE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('am', 'pm', 'eve')),
  value INTEGER NOT NULL CHECK (value >= 0 AND value <= 5),
  
  day_color TEXT CHECK (day_color IN ('green', 'yellow', 'red')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, logged_at, period)
);

CREATE INDEX IF NOT EXISTS idx_energy_logs_user_id ON energy_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_energy_logs_logged_at ON energy_logs(logged_at);

-- ============================================
-- Table: inbox_items
-- ============================================
CREATE TABLE IF NOT EXISTS inbox_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL,
  
  promoted_to_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  synced_at TIMESTAMPTZ,
  local_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_inbox_items_user_id ON inbox_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_items_captured_at ON inbox_items(captured_at);
CREATE INDEX IF NOT EXISTS idx_inbox_items_deleted_at ON inbox_items(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- Table: supplements
-- ============================================
CREATE TABLE IF NOT EXISTS supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  template_source TEXT CHECK (template_source IN ('basics', 'sleep', 'focus', 'busy', 'custom')),
  timing_anchor TEXT NOT NULL CHECK (timing_anchor IN ('am', 'pm', 'with_breakfast', 'with_lunch', 'with_dinner', 'before_bed')),
  with_food BOOLEAN DEFAULT false,
  avoid_with TEXT[],
  safety_note TEXT,
  is_optional BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: user_supplement_plans
-- ============================================
CREATE TABLE IF NOT EXISTS user_supplement_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
  
  is_core BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  custom_timing TEXT,
  refill_link TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, supplement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_supplement_plans_user_id ON user_supplement_plans(user_id);

-- ============================================
-- Table: supplement_logs
-- ============================================
CREATE TABLE IF NOT EXISTS supplement_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_supplement_plan_id UUID REFERENCES user_supplement_plans(id) ON DELETE CASCADE,
  
  taken_at DATE NOT NULL,
  taken_time TIME,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, user_supplement_plan_id, taken_at)
);

CREATE INDEX IF NOT EXISTS idx_supplement_logs_user_id ON supplement_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_taken_at ON supplement_logs(taken_at);

-- ============================================
-- Functions: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_prefs_updated_at BEFORE UPDATE ON user_prefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_week_plans_updated_at BEFORE UPDATE ON week_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_supplement_plans_updated_at BEFORE UPDATE ON user_supplement_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Weryfikacja

Po wykonaniu SQL:
1. Przejdź do **"Table Editor"** w menu bocznym
2. Sprawdź, czy wszystkie tabele zostały utworzone:
   - `user_prefs`
   - `week_plans`
   - `tasks`
   - `energy_logs`
   - `inbox_items`
   - `supplements`
   - `user_supplement_plans`
   - `supplement_logs`

---

## 3. Row Level Security (RLS)

### 3.1 Włącz RLS dla wszystkich tabel

Wykonaj w SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE user_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;
```

### 3.2 Utwórz polityki RLS

```sql
-- ============================================
-- RLS Policies: user_prefs
-- ============================================
CREATE POLICY "Users can view own prefs"
  ON user_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prefs"
  ON user_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prefs"
  ON user_prefs FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: week_plans
-- ============================================
CREATE POLICY "Users can view own week plans"
  ON week_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own week plans"
  ON week_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own week plans"
  ON week_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own week plans"
  ON week_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: tasks
-- ============================================
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: energy_logs
-- ============================================
CREATE POLICY "Users can view own energy logs"
  ON energy_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own energy logs"
  ON energy_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own energy logs"
  ON energy_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: inbox_items
-- ============================================
CREATE POLICY "Users can view own inbox items"
  ON inbox_items FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own inbox items"
  ON inbox_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inbox items"
  ON inbox_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inbox items"
  ON inbox_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: supplements
-- ============================================
-- Supplements are shared/read-only (templates)
CREATE POLICY "Anyone can view supplements"
  ON supplements FOR SELECT
  USING (true);

-- ============================================
-- RLS Policies: user_supplement_plans
-- ============================================
CREATE POLICY "Users can view own supplement plans"
  ON user_supplement_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplement plans"
  ON user_supplement_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplement plans"
  ON user_supplement_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplement plans"
  ON user_supplement_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: supplement_logs
-- ============================================
CREATE POLICY "Users can view own supplement logs"
  ON supplement_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplement logs"
  ON supplement_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplement logs"
  ON supplement_logs FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 4. Seed danych początkowych

### 4.1 Dodaj szablony suplementów

```sql
-- ============================================
-- Seed: Supplement Templates
-- ============================================

-- Basics Template
INSERT INTO supplements (name, template_source, timing_anchor, with_food, safety_note, is_optional) VALUES
('Vitamin D', 'basics', 'am', false, 'If you already take it, especially during low sun months. Ask a clinician if you have kidney issues or take certain medications.', false),
('Magnesium', 'basics', 'before_bed', false, 'Ask a clinician if you have kidney disease or take certain medications.', false),
('Hydration', 'basics', 'am', false, 'General reminder to stay hydrated.', false);

-- Sleep Support Template
INSERT INTO supplements (name, template_source, timing_anchor, with_food, safety_note, is_optional) VALUES
('Magnesium (PM)', 'sleep', 'before_bed', false, 'Ask a clinician if you have kidney disease.', false),
('Caffeine Cutoff Reminder', 'sleep', 'pm', false, 'No medical advice - general timing reminder.', false),
('Downshift Checklist', 'sleep', 'before_bed', false, 'Routine reminder only.', false);

-- Focus-Friendly Template
INSERT INTO supplements (name, template_source, timing_anchor, with_food, safety_note, is_optional) VALUES
('Caffeine Timing', 'focus', 'am', false, 'Timing reminder only. Ask a clinician about caffeine interactions.', false),
('L-theanine', 'focus', 'am', true, 'If you already use it. Ask a clinician about interactions with medications.', true),
('Protein with Breakfast', 'focus', 'with_breakfast', true, 'Nutrition reminder, not a supplement.', false);

-- Busy/Low Appetite Template
INSERT INTO supplements (name, template_source, timing_anchor, with_food, safety_note, is_optional) VALUES
('Electrolytes', 'busy', 'am', false, 'If you use electrolyte supplements. Ask a clinician if you have kidney or heart conditions.', true),
('Easy Protein Reminder', 'busy', 'am', true, 'Nutrition reminder (shake, yogurt, etc.).', false),
('Minimum Nutrition', 'busy', 'am', true, 'General nutrition reminder for busy days.', false);
```

### 4.2 Weryfikacja seed

```sql
-- Sprawdź, czy szablony zostały dodane
SELECT name, template_source, timing_anchor FROM supplements ORDER BY template_source, name;
```

Powinieneś zobaczyć 12 rekordów (3 z każdego szablonu).

---

## 5. Konfiguracja zmiennych środowiskowych

### 5.1 Pobierz klucze API

W panelu Supabase:
1. Przejdź do **"Settings"** → **"API"**
2. Skopiuj:
   - **Project URL** (np. `https://xxxxx.supabase.co`)
   - **anon/public key** (długi klucz JWT)

### 5.2 Ustaw zmienne w aplikacji

#### Web (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Mobile (`apps/mobile/.env.local` lub Expo config)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Uwaga:** Nie commituj plików `.env.local` do repozytorium (są w `.gitignore`).

---

## 6. Testowanie połączenia

### 6.1 Test w aplikacji web

Utwórz prosty test w `apps/web/src/app/test-supabase/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@neurodivergent-flow/api';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    async function test() {
      try {
        const { data, error } = await supabase.from('supplements').select('count');
        if (error) throw error;
        setStatus('✅ Połączenie działa!');
      } catch (err) {
        setStatus(`❌ Błąd: ${err.message}`);
      }
    }
    test();
  }, []);

  return <div className="p-8">{status}</div>;
}
```

Otwórz `/test-supabase` w przeglądarce.

### 6.2 Test w SQL Editor

```sql
-- Test zapytania
SELECT COUNT(*) FROM supplements;
SELECT COUNT(*) FROM user_prefs;
```

---

## 7. Checklist weryfikacji

Przed kontynuacją upewnij się, że:

- [ ] Projekt Supabase utworzony
- [ ] Wszystkie 8 tabel utworzonych
- [ ] RLS włączony na wszystkich tabelach
- [ ] Polityki RLS utworzone
- [ ] Szablony suplementów dodane (12 rekordów)
- [ ] Zmienne środowiskowe ustawione
- [ ] Test połączenia działa

---

## 8. Następne kroki

Po zakończeniu setupu Supabase:

1. **Implementuj Authentication** (Stage 1.3)
   - Supabase Auth (email/password)
   - Ekrany logowania/rejestracji
   - Zarządzanie stanem auth

2. **Testuj onboarding end-to-end**
   - Zarejestruj użytkownika
   - Przejdź przez onboarding
   - Sprawdź, czy dane zapisują się w bazie

---

## 9. Troubleshooting

### Problem: "relation does not exist"
- **Rozwiązanie:** Upewnij się, że wykonałeś wszystkie SQL w kolejności

### Problem: "permission denied"
- **Rozwiązanie:** Sprawdź, czy RLS policies są utworzone i czy używasz `auth.uid()`

### Problem: "invalid input syntax for type uuid"
- **Rozwiązanie:** Upewnij się, że `user_id` jest UUID z `auth.users`

### Problem: Nie można połączyć się z Supabase
- **Rozwiązanie:** 
  - Sprawdź zmienne środowiskowe
  - Sprawdź, czy URL i klucz są poprawne
  - Sprawdź, czy projekt nie jest w trybie pauzy (free tier)

---

## 10. Przydatne linki

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Dashboard](https://app.supabase.com)

---

**Status:** ✅ Gotowe do użycia po wykonaniu wszystkich kroków
