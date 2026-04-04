-- 004_create_volunteers.sql
CREATE TABLE volunteers (
  id                       SERIAL PRIMARY KEY,
  volunteer_id             VARCHAR(20)  NOT NULL UNIQUE,  -- e.g. VOL-001
  first_name               VARCHAR(100) NOT NULL,
  last_name                VARCHAR(100) NOT NULL,
  age                      SMALLINT     CHECK (age >= 16 AND age <= 120),
  neighbourhood            VARCHAR(100),
  languages_spoken         TEXT[],
  skills                   TEXT[],
  cause_areas_of_interest  TEXT[],
  availability             VARCHAR(100),
  hours_available_per_month SMALLINT    CHECK (hours_available_per_month >= 0),
  prior_volunteer_experience VARCHAR(50) CHECK (prior_volunteer_experience IN (
                               'None',
                               'Some (1-2 orgs)',
                               'Moderate (3-5 orgs)',
                               'Extensive (6+ orgs)'
                             )),
  has_vehicle              BOOLEAN      NOT NULL DEFAULT FALSE,
  background_check_status  VARCHAR(20)  NOT NULL DEFAULT 'Pending'
                                        CHECK (background_check_status IN (
                                          'Pending',
                                          'In Progress',
                                          'Completed',
                                          'Failed',
                                          'Expired'
                                        )),
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes for common filters
CREATE INDEX idx_volunteers_neighbourhood ON volunteers (neighbourhood);
CREATE INDEX idx_volunteers_bg_status     ON volunteers (background_check_status);
CREATE INDEX idx_volunteers_availability  ON volunteers (availability);

-- Seed row from sample data
INSERT INTO volunteers (
  volunteer_id, first_name, last_name, age, neighbourhood,
  languages_spoken, skills, cause_areas_of_interest,
  availability, hours_available_per_month,
  prior_volunteer_experience, has_vehicle, background_check_status
) VALUES (
  'VOL-001', 'Grace', 'Johannsen', 19, 'Victoria-Fraserview',
  ARRAY['English', 'Hindi'],
  ARRAY['Translation/interpretation', 'Legal knowledge'],
  ARRAY['Disability services'],
  'Evenings only', 4,
  'Some (1-2 orgs)', TRUE, 'Completed'
);