-- A/B Test Metrics Table
-- Stores metrics for A/B testing and feature rollouts
CREATE TABLE IF NOT EXISTS ab_test_metrics (
  id SERIAL PRIMARY KEY,
  
  -- Test identification
  test_name VARCHAR(100) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_group VARCHAR(20) NOT NULL CHECK (test_group IN ('control', 'variant')),
  
  -- Performance metrics
  response_time INTEGER NOT NULL, -- milliseconds
  error_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 1,
  completion_rate DECIMAL(5,4) DEFAULT 1.0, -- 0.0 to 1.0
  
  -- User satisfaction
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  user_feedback TEXT,
  
  -- Context
  endpoint VARCHAR(255),
  user_agent TEXT,
  session_id VARCHAR(255),
  
  -- Timestamps
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for fast queries
  INDEX idx_test_name (test_name),
  INDEX idx_user_id (user_id),
  INDEX idx_test_group (test_group),
  INDEX idx_timestamp (timestamp),
  INDEX idx_test_name_group (test_name, test_group)
);

-- A/B Test Configurations Table
-- Stores test configurations and status
CREATE TABLE IF NOT EXISTS ab_test_configs (
  id SERIAL PRIMARY KEY,
  
  test_name VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  traffic_split DECIMAL(5,4) NOT NULL DEFAULT 0.1, -- 0.0 to 1.0
  
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  
  -- Target users (optional - for specific user testing)
  target_users INTEGER[],
  
  -- Metrics to track
  metrics TEXT[] NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  
  -- Results
  winner VARCHAR(20) CHECK (winner IN ('control', 'variant', 'inconclusive')),
  statistical_significance DECIMAL(5,4),
  
  -- Metadata
  description TEXT,
  created_by VARCHAR(255),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Feature Rollout Metrics Table
-- Stores metrics for gradual feature rollouts
CREATE TABLE IF NOT EXISTS feature_rollout_metrics (
  id SERIAL PRIMARY KEY,
  
  feature_name VARCHAR(100) NOT NULL,
  phase_name VARCHAR(100) NOT NULL,
  
  -- Aggregated metrics
  total_users INTEGER DEFAULT 0,
  error_rate DECIMAL(5,4) DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3,2),
  
  -- Counts
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  
  -- Snapshot timestamp
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_feature_name (feature_name),
  INDEX idx_snapshot_date (snapshot_date),
  INDEX idx_feature_phase (feature_name, phase_name)
);

-- Comments
COMMENT ON TABLE ab_test_metrics IS 'Stores individual A/B test metrics for analysis';
COMMENT ON TABLE ab_test_configs IS 'Configuration and status of A/B tests';
COMMENT ON TABLE feature_rollout_metrics IS 'Aggregated metrics for feature rollouts';
