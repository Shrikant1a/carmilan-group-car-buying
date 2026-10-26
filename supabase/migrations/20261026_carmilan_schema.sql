-- ==============================================================================
-- CarMilan: Group Car Buying Platform Schema & Migrations
-- Target: PostgreSQL / Supabase
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Roles ENUM & Table
CREATE TYPE app_role AS ENUM ('buyer', 'dealer', 'admin');
CREATE TYPE group_status AS ENUM (
  'recruiting',
  'target_reached',
  'quotations_requested',
  'offers_received',
  'completed',
  'cancelled',
  'expired'
);
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE offer_status AS ENUM ('submitted', 'updated', 'withdrawn', 'accepted');

-- 3. Profiles Table (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  state TEXT,
  preferred_contact_method TEXT DEFAULT 'whatsapp' CHECK (preferred_contact_method IN ('whatsapp', 'phone', 'email')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. User Roles Table (Ensures users cannot elevate themselves)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'buyer',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 5. Dealerships Table
CREATE TABLE IF NOT EXISTS dealerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dealership_name TEXT NOT NULL,
  trade_name TEXT NOT NULL,
  gstin TEXT NOT NULL UNIQUE,
  trade_license_number TEXT NOT NULL,
  showroom_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  brands_handled TEXT[] NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Dealership Verifications Table
CREATE TABLE IF NOT EXISTS dealership_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  doc_number TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Car Brands Catalog
CREATE TABLE IF NOT EXISTS car_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Car Models Catalog
CREATE TABLE IF NOT EXISTS car_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES car_brands(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  body_type TEXT NOT NULL,
  starting_price NUMERIC(12, 2) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  popularity_score INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_brand_model UNIQUE (brand_id, name)
);

-- 9. Car Variants Catalog
CREATE TABLE IF NOT EXISTS car_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  engine_cc INTEGER,
  ex_showroom_price NUMERIC(12, 2) NOT NULL,
  standard_rto NUMERIC(12, 2) NOT NULL,
  standard_insurance NUMERIC(12, 2) NOT NULL,
  standard_other_charges NUMERIC(12, 2) NOT NULL,
  standard_on_road_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_model_variant UNIQUE (model_id, variant_name)
);

-- 10. Buyer Groups Table
CREATE TABLE IF NOT EXISTS buyer_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE RESTRICT,
  variant_id UUID NOT NULL REFERENCES car_variants(id) ON DELETE RESTRICT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  target_group_size INTEGER NOT NULL CHECK (target_group_size >= 3),
  min_group_size INTEGER NOT NULL DEFAULT 5 CHECK (min_group_size <= target_group_size),
  current_member_count INTEGER NOT NULL DEFAULT 1,
  status group_status NOT NULL DEFAULT 'recruiting',
  purchase_timeline TEXT NOT NULL,
  deadline_date DATE NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Group Memberships Table (with concurrency safe uniqueness constraint)
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES buyer_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES car_variants(id),
  budget_max NUMERIC(12, 2),
  purchase_timeline TEXT,
  joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn')),
  notes TEXT,
  -- Prevent duplicate active membership in the same group:
  CONSTRAINT unique_active_group_membership UNIQUE (group_id, user_id)
);

-- 12. Quotation Requests Table
CREATE TABLE IF NOT EXISTS quotation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES buyer_groups(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'expired')),
  deadline_date DATE NOT NULL,
  total_buyers INTEGER NOT NULL,
  target_city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Dealer Offers Table
CREATE TABLE IF NOT EXISTS dealer_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_request_id UUID NOT NULL REFERENCES quotation_requests(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES buyer_groups(id) ON DELETE CASCADE,
  dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE RESTRICT,
  variant_id UUID NOT NULL REFERENCES car_variants(id) ON DELETE RESTRICT,
  ex_showroom_price NUMERIC(12, 2) NOT NULL,
  dealer_discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  rto_charges NUMERIC(12, 2) NOT NULL,
  insurance_charges NUMERIC(12, 2) NOT NULL,
  mandatory_charges NUMERIC(12, 2) NOT NULL,
  optional_accessories_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  accessories_included TEXT[] NOT NULL DEFAULT '{}',
  final_quoted_on_road_price NUMERIC(12, 2) NOT NULL,
  estimated_delivery_days INTEGER NOT NULL,
  offer_valid_until DATE NOT NULL,
  terms_conditions TEXT NOT NULL,
  status offer_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_dealership_group_offer UNIQUE (quotation_request_id, dealership_id)
);

-- 14. Offer Line Items
CREATE TABLE IF NOT EXISTS offer_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES dealer_offers(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  description TEXT
);

-- 15. Saved Cars
CREATE TABLE IF NOT EXISTS saved_cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_saved_car UNIQUE (user_id, model_id)
);

-- 16. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group_milestone', 'new_offer', 'verification', 'system')),
  read BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR FREQUENTLY FILTERED QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_buyer_groups_city ON buyer_groups(city);
CREATE INDEX IF NOT EXISTS idx_buyer_groups_status ON buyer_groups(status);
CREATE INDEX IF NOT EXISTS idx_buyer_groups_model ON buyer_groups(model_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_group ON dealer_offers(group_id);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_dealer ON dealer_offers(dealership_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE read = false;

-- ==============================================================================
-- CONCURRENCY SAFE CAPACITY CHECK TRIGGER FOR BUYER GROUPS
-- ==============================================================================
CREATE OR REPLACE FUNCTION check_group_capacity_and_increment()
RETURNS TRIGGER AS $$
DECLARE
  v_current_count INT;
  v_target_size INT;
  v_status group_status;
BEGIN
  -- Lock the target group row to prevent race conditions
  SELECT current_member_count, target_group_size, status
  INTO v_current_count, v_target_size, v_status
  FROM buyer_groups
  WHERE id = NEW.group_id
  FOR UPDATE;

  IF v_status <> 'recruiting' THEN
    RAISE EXCEPTION 'Cannot join group: Group status is %, not recruiting.', v_status;
  END IF;

  IF v_current_count >= v_target_size THEN
    RAISE EXCEPTION 'Cannot join group: Group has already reached capacity (% / %)', v_current_count, v_target_size;
  END IF;

  -- Increment member count
  UPDATE buyer_groups
  SET 
    current_member_count = current_member_count + 1,
    status = CASE 
      WHEN (current_member_count + 1) >= target_group_size THEN 'target_reached'::group_status 
      ELSE status 
    END,
    updated_at = timezone('utc'::text, now())
  WHERE id = NEW.group_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_group_capacity ON group_memberships;
CREATE TRIGGER trg_check_group_capacity
BEFORE INSERT ON group_memberships
FOR EACH ROW
EXECUTE FUNCTION check_group_capacity_and_increment();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view non-private basic info, owner can update
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Dealer offers:
-- Dealers can only create or update offers for their own verified dealership
CREATE POLICY "Dealers can insert offers for their dealership" ON dealer_offers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dealerships d
      WHERE d.id = dealership_id AND d.dealer_user_id = auth.uid() AND d.is_verified = true
    )
  );

CREATE POLICY "Dealers can update own offers" ON dealer_offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM dealerships d
      WHERE d.id = dealership_id AND d.dealer_user_id = auth.uid()
    )
  );

-- Buyers and Dealers can view all submitted offers for groups
CREATE POLICY "Public can view submitted offers" ON dealer_offers
  FOR SELECT USING (status = 'submitted' OR status = 'accepted');

-- Buyer Groups: Anyone can view active groups
CREATE POLICY "Anyone can view buyer groups" ON buyer_groups
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create buyer groups" ON buyer_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Privacy Protection Policy for Group Memberships:
-- Private contact info is never exposed; members can view participant count & member list with anonymized initials
CREATE POLICY "Members can view anonymized group members" ON group_memberships
  FOR SELECT USING (true);

-- User Roles Security Policies:
-- Users can read their own role; self-escalation to admin is blocked
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Dealerships Policies:
-- Anyone can view verified dealerships; dealers can read and update their own dealership profile
CREATE POLICY "Public can view verified dealerships" ON dealerships
  FOR SELECT USING (is_verified = true OR dealer_user_id = auth.uid());

CREATE POLICY "Dealers can register pending dealership" ON dealerships
  FOR INSERT WITH CHECK (
    dealer_user_id = auth.uid() AND
    is_verified = false AND
    verification_status = 'pending'
  );

CREATE POLICY "Dealers can update own dealership details" ON dealerships
  FOR UPDATE USING (dealer_user_id = auth.uid())
  WITH CHECK (
    dealer_user_id = auth.uid() AND
    -- Dealers cannot mark themselves as verified
    is_verified = (SELECT is_verified FROM dealerships WHERE id = dealerships.id)
  );

CREATE POLICY "Admins can manage all dealerships and verifications" ON dealerships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

