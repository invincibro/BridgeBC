-- 003_create_organizations.sql
CREATE TABLE organizations
    (
        id                          SERIAL PRIMARY KEY                                                                                                        ,
        bn                          VARCHAR(15) NOT NULL UNIQUE                                                                                               , -- CRA Business Number e.g. 886937309RR0001
        legal_name                  TEXT NOT NULL                                                                                                             ,
        account_name                TEXT                                                                                                                      ,
        address1                    TEXT                                                                                                                      ,
        address2                    TEXT                                                                                                                      ,
        city                        VARCHAR(100)                                                                                                              ,
        province                    CHAR(2)                                                                                                                   ,
        postal_code                 VARCHAR(10)                                                                                                               ,
        country                     CHAR(2)                                                                                                                   ,
        sector                      VARCHAR(100)                                                                                                              ,
        org_size                    VARCHAR(30) CHECK (org_size IN ( 'Micro (1-5 staff)', 'Small (6-15 staff)', 'Medium (16-50 staff)', 'Large (51+ staff)' )),
        volunteers_currently_needed INT                                                                                                                       ,
        volunteer_urgency           VARCHAR(10) CHECK (volunteer_urgency IN ( 'Low', 'Medium', 'High', 'Critical' ))                                          ,
        skills_needed               TEXT[]                                                                                                                    ,
        languages_needed            TEXT[]                                                                                                                    ,
        availability_preference     VARCHAR(100)                                                                                                              ,
        background_check_required   BOOLEAN NOT NULL DEFAULT FALSE                                                                                            ,
        created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()                                                                                        ,
        updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()                                                                                        ,
        weekday_morning             BOOLEAN NOT NULL DEFAULT FALSE                                                                                            ,
        weekday_afternoon           BOOLEAN NOT NULL DEFAULT FALSE                                                                                            ,
        weekday_evening             BOOLEAN NOT NULL DEFAULT FALSE                                                                                            ,
        weekend_morning             BOOLEAN NOT NULL DEFAULT FALSE                                                                                            ,
        weekend_afternoon           BOOLEAN NOT NULL DEFAULT FALSE                                                                                            ,
        weekend_evening             BOOLEAN NOT NULL DEFAULT FALSE
    )
;
-- Indexes for common filters
CREATE INDEX idx_organizations_city
ON organizations
    (
        city
    )
;
CREATE INDEX idx_organizations_province
ON organizations
    (
        province
    )
;
CREATE INDEX idx_organizations_sector
ON organizations
    (
        sector
    )
;
CREATE INDEX idx_organizations_urgency
ON organizations
    (
        volunteer_urgency
    );