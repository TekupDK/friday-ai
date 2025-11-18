-- Create subscription tables
-- Run this manually if drizzle-kit push fails

-- Create enums first
DO $$ BEGIN
    CREATE TYPE friday_ai.subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE friday_ai.subscription_plan_type AS ENUM ('tier1', 'tier2', 'tier3', 'flex_basis', 'flex_plus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS friday_ai.subscriptions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "customerProfileId" INTEGER NOT NULL,
    "planType" friday_ai.subscription_plan_type NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,
    "includedHours" NUMERIC(5, 2) NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    status friday_ai.subscription_status DEFAULT 'active' NOT NULL,
    "autoRenew" BOOLEAN DEFAULT true NOT NULL,
    "nextBillingDate" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    "cancellationReason" TEXT,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create subscription_usage table
CREATE TABLE IF NOT EXISTS friday_ai.subscription_usage (
    id SERIAL PRIMARY KEY,
    "subscriptionId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "hoursUsed" NUMERIC(5, 2) NOT NULL,
    date TIMESTAMP NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS friday_ai.subscription_history (
    id SERIAL PRIMARY KEY,
    "subscriptionId" INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedBy" INTEGER,
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON friday_ai.subscriptions USING btree ("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_profile_id ON friday_ai.subscriptions USING btree ("customerProfileId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON friday_ai.subscriptions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON friday_ai.subscriptions USING btree ("nextBillingDate");
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON friday_ai.subscriptions USING btree ("endDate");

CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON friday_ai.subscription_usage USING btree ("subscriptionId");
CREATE INDEX IF NOT EXISTS idx_subscription_usage_booking_id ON friday_ai.subscription_usage USING btree ("bookingId");
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_month_year ON friday_ai.subscription_usage USING btree ("subscriptionId", year, month);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_date ON friday_ai.subscription_usage USING btree (date);

CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON friday_ai.subscription_history USING btree ("subscriptionId");
CREATE INDEX IF NOT EXISTS idx_subscription_history_timestamp ON friday_ai.subscription_history USING btree (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_history_action ON friday_ai.subscription_history USING btree (action);

