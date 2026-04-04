-- 003_create_organizations.sql
CREATE TABLE organizations (
  id                        SERIAL PRIMARY KEY,
  bn                        VARCHAR(15)   NOT NULL UNIQUE,  -- Business Number (e.g. 886937309RR0001)
  legal_name                TEXT          NOT NULL,
  account_name              TEXT,
  address1                  TEXT,
  address2                  TEXT,
  city                      VARCHAR(100),
  province                  CHAR(2),
  postal_code               VARCHAR(10),
  country                   CHAR(2),
  sector                    VARCHAR(100),
  org_size                  VARCHAR(50),  -- e.g. Micro (1-5 staff)
  volunteers_currently_needed INT,
  volunteer_urgency         VARCHAR(20)   CHECK (volunteer_urgency IN ('Low', 'Medium', 'High', 'Critical')),
  skills_needed             TEXT[],       -- array: {'Tutoring/mentorship', 'Event coordination'}
  languages_needed          TEXT[],       -- array: {'English', 'Mandarin'}
  availability_preference   VARCHAR(100),
  background_check_required BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index commonly filtered columns
CREATE INDEX idx_organizations_city     ON organizations (city);
CREATE INDEX idx_organizations_province ON organizations (province);
CREATE INDEX idx_organizations_sector   ON organizations (sector);
CREATE INDEX idx_organizations_urgency  ON organizations (volunteer_urgency);

-- Seed row from sample data
INSERT INTO organizations (
  bn, legal_name, account_name,
  address1, address2, city, province, postal_code, country,
  sector, org_size,
  volunteers_currently_needed, volunteer_urgency,
  skills_needed, languages_needed,
  availability_preference, background_check_required
) VALUES (
  '886937309RR0001',
  'SIDEBYSIDE II CHILDREN''S VILLAGE SOCIETY',
  'SOS II CHILDREN''S VILLAGE BRITISH COLUMBIA (CANADA) SOCIETY',
  '805 WEST BROADWAY', '12TH FLOOR', 'VANCOUVER', 'BC', 'V5Z1K1', 'CA',
  'Youth services', 'Micro (1-5 staff)',
  6, 'High',
  ARRAY['Tutoring/mentorship', 'Event coordination'],
  ARRAY['English', 'Mandarin'],
  'Weekdays preferred', TRUE
);