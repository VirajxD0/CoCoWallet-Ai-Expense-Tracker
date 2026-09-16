-- ============================================================
-- CoCoWallet v2.0 — New Feature Tables
-- Run this AFTER 001_initial.sql
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 1. RECURRING EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  frequency ENUM('daily','weekly','monthly','yearly') NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE NOT NULL,
  last_run_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recurring_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_recurring_user_next (user_id, next_run_date, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. GOALS
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  target_date DATE,
  category VARCHAR(100),
  icon VARCHAR(50) DEFAULT 'target',
  color VARCHAR(20) DEFAULT '#3b82f6',
  auto_allocate_pct DECIMAL(5,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_goal_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Goal allocations history
CREATE TABLE IF NOT EXISTS goal_allocations (
  id CHAR(36) PRIMARY KEY,
  goal_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  source ENUM('manual','auto_surplus','recurring') DEFAULT 'manual',
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ga_goal FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  CONSTRAINT fk_ga_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ga_goal (goal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. IN-APP ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type ENUM(
    'budget_warning',
    'budget_exceeded',
    'unusual_spending',
    'recurring_due',
    'goal_milestone',
    'goal_completed'
  ) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  CONSTRAINT fk_alert_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_alert_user_read (user_id, is_read, triggered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. EXPORT/IMPORT JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS export_jobs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  format ENUM('json','csv') NOT NULL,
  status ENUM('pending','completed','failed') DEFAULT 'pending',
  file_path VARCHAR(500),
  record_count INT DEFAULT 0,
  error_message TEXT,
  filters JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_ej_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ej_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. Update existing tables with new columns
-- ============================================================

-- Add household_id, recurring_id to expenses (optional, for future household features)
ALTER TABLE expenses 
  ADD COLUMN IF NOT EXISTS household_id CHAR(36) AFTER user_id,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE AFTER receipt_url,
  ADD COLUMN IF NOT EXISTS recurring_id CHAR(36) AFTER is_recurring,
  ADD CONSTRAINT IF NOT EXISTS fk_exp_house FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL,
  ADD CONSTRAINT IF NOT EXISTS fk_exp_recur FOREIGN KEY (recurring_id) REFERENCES recurring_expenses(id) ON DELETE SET NULL;

-- Add household_id to budgets (optional)
ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS household_id CHAR(36) AFTER user_id,
  ADD CONSTRAINT IF NOT EXISTS fk_budget_house FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;

-- ============================================================
-- 6. Households table (for future shared features)
-- ============================================================
CREATE TABLE IF NOT EXISTS households (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id CHAR(36) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  invite_code VARCHAR(12) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_house_owner FOREIGN KEY (owner_id) REFERENCES users(id),
  INDEX idx_house_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS household_members (
  id CHAR(36) PRIMARY KEY,
  household_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role ENUM('owner','admin','member','viewer') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hm_house FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  CONSTRAINT fk_hm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_hm_house_user (household_id, user_id),
  INDEX idx_hm_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. Bank connections (for future Plaid integration)
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_connections (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  provider ENUM('plaid','sandbox') NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  institution_name VARCHAR(100),
  status ENUM('connected','error','revoked') DEFAULT 'connected',
  last_sync_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bank_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_bank_user_item (user_id, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bank_accounts (
  id CHAR(36) PRIMARY KEY,
  connection_id CHAR(36) NOT NULL,
  account_id VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  subtype VARCHAR(50),
  mask VARCHAR(4),
  balance_current DECIMAL(12,2),
  balance_available DECIMAL(12,2),
  currency CHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bank_acc_conn FOREIGN KEY (connection_id) REFERENCES bank_connections(id) ON DELETE CASCADE,
  INDEX idx_bank_acc_conn (connection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. Exchange rates (for multi-currency support)
-- ============================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
  id CHAR(36) PRIMARY KEY,
  from_currency CHAR(3) NOT NULL,
  to_currency CHAR(3) NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  source ENUM('exchangerate_host','ecb','manual') DEFAULT 'exchangerate_host',
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP NOT NULL,
  UNIQUE KEY uk_rate_pair_time (from_currency, to_currency, fetched_at),
  INDEX idx_rate_lookup (from_currency, to_currency, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. User preferences (base_currency, timezone, etc.)
-- ============================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS base_currency CHAR(3) DEFAULT 'USD' AFTER name,
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) AFTER base_currency,
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC' AFTER avatar_url;