-- 004_create_volunteers.sql
CREATE TABLE volunteers
    (
        id                         SERIAL PRIMARY KEY                                                                                                 ,
        volunteer_id               VARCHAR(20) NOT NULL UNIQUE                                                                                        , -- e.g. VOL-001
        first_name                 VARCHAR(100) NOT NULL                                                                                              ,
        last_name                  VARCHAR(100) NOT NULL                                                                                              ,
        age                        SMALLINT CHECK (age >= 16 AND age <= 120)                                                                          ,
        neighbourhood              VARCHAR(100)                                                                                                       ,
        languages_spoken           TEXT[]                                                                                                             ,
        skills                     TEXT[]                                                                                                             ,
        cause_areas_of_interest    TEXT[]                                                                                                             ,
        hours_available_per_month  SMALLINT CHECK (hours_available_per_month >= 0)                                                                    ,
        prior_volunteer_experience VARCHAR(50) CHECK (prior_volunteer_experience IN ( 'None', 'Some (1-2 orgs)', 'Experienced (3+ orgs)' ))           ,
        has_vehicle                BOOLEAN NOT NULL DEFAULT FALSE                                                                                     ,
        background_check_status    VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (background_check_status IN ( 'In progress', 'Completed', 'Not yet' )),
        created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()                                                                                 ,
        updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()                                                                                 ,
        weekday_morning            BOOLEAN NOT NULL DEFAULT FALSE                                                                                     ,
        weekday_afternoon          BOOLEAN NOT NULL DEFAULT FALSE                                                                                     ,
        weekday_evening            BOOLEAN NOT NULL DEFAULT FALSE                                                                                     ,
        weekend_morning            BOOLEAN NOT NULL DEFAULT FALSE                                                                                     ,
        weekend_afternoon          BOOLEAN NOT NULL DEFAULT FALSE                                                                                     ,
        weekend_evening            BOOLEAN NOT NULL DEFAULT FALSE
    )
;
-- Indexes for common filters
CREATE INDEX idx_volunteers_neighbourhood
ON volunteers
    (
        neighbourhood
    )
;
CREATE INDEX idx_volunteers_bg_status
ON volunteers
    (
        background_check_status
    )
;
