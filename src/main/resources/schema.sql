-- =========================================================
-- ROSCA System Database Schema Definition for PostgreSQL (Neon.tech)
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    oauth_provider VARCHAR(50),
    current_trust_score DOUBLE PRECISION DEFAULT 100.0,
    exposure_limit DOUBLE PRECISION DEFAULT 0.0,
    account_balance DOUBLE PRECISION DEFAULT 0.0,
    account_status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Groups Table
CREATE TABLE IF NOT EXISTS groups (
    id BIGSERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    group_size INT NOT NULL,
    risk_threshold DOUBLE PRECISION DEFAULT 0.0,
    current_cycle INT DEFAULT 1,
    number_of_cycles INT NOT NULL,
    monthly_deposit_amount DOUBLE PRECISION NOT NULL,
    group_status VARCHAR(50) DEFAULT 'CREATED',
    group_frequency VARCHAR(50) DEFAULT 'MONTHLY',
    next_auction_time TIMESTAMP,
    auction_duration_minutes INT DEFAULT 60,
    admin_user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Memberships Table
CREATE TABLE IF NOT EXISTS memberships (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    trust_score_at_joining DOUBLE PRECISION DEFAULT 100.0,
    membership_status VARCHAR(50) DEFAULT 'ACTIVE',
    penalty_amount DOUBLE PRECISION DEFAULT 0.0,
    total_earned DOUBLE PRECISION DEFAULT 0.0,
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Auctions Table
CREATE TABLE IF NOT EXISTS auctions (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    cycle_number INT NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    winning_discount_bid DOUBLE PRECISION DEFAULT 0.0,
    winner_membership_id BIGINT REFERENCES memberships(id) ON DELETE SET NULL,
    auction_status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bids Table
CREATE TABLE IF NOT EXISTS bids (
    id BIGSERIAL PRIMARY KEY,
    auction_id BIGINT REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_membership_id BIGINT REFERENCES memberships(id) ON DELETE CASCADE,
    bid_amount DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    membership_id BIGINT REFERENCES memberships(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Recoveries Table
CREATE TABLE IF NOT EXISTS recoveries (
    id BIGSERIAL PRIMARY KEY,
    defaulter_membership_id BIGINT REFERENCES memberships(id) ON DELETE CASCADE,
    beneficiary_membership_id BIGINT REFERENCES memberships(id) ON DELETE SET NULL,
    auction_id BIGINT REFERENCES auctions(id) ON DELETE CASCADE,
    pending_contribution DOUBLE PRECISION NOT NULL,
    penalty DOUBLE PRECISION NOT NULL,
    recovery_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_group ON memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_auctions_group ON auctions(group_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_membership ON transactions(membership_id);
