-- ============================================================
--  CSC343H5 -- Practical Session: Community Library Domain
--  File: practical.ddl
--  Copyright (c) 2026 Naaz Sibia
--
--  Instructions:
--    Complete every section marked TODO.
--    Run with: psql -f practical.ddl
-- ============================================================


-- ============================================================
-- Clean slate (safe to re-run while you are working)
-- ============================================================
DROP TABLE IF EXISTS branch_loan  CASCADE;
DROP TABLE IF EXISTS book_copy    CASCADE;
DROP TABLE IF EXISTS member       CASCADE;
DROP TABLE IF EXISTS branch       CASCADE;

DROP TYPE IF EXISTS membership_type;
DROP TYPE IF EXISTS book_condition;


-- ============================================================
-- ENUM types
--
-- Custom types must be defined before the tables that use them.
-- Fill in the allowed values for each type.
-- ============================================================

CREATE TYPE membership_type AS ENUM (
    'adult',
    ______,   -- TODO: add the remaining two values
    ______
);

CREATE TYPE book_condition AS ENUM (
    'new',
    'good',
    ______,   -- TODO: add the remaining two values
    ______
);


-- ============================================================
-- Table: member
--
-- member is created before branch because the deferred FK on
-- branch (added below) references member.member_id.
-- ============================================================
CREATE TABLE member (
    member_id       SERIAL          NOT NULL,
    first_name      TEXT            NOT NULL,
    last_name       TEXT            NOT NULL,
    email           TEXT            NOT NULL,
    membership_type membership_type NOT NULL,
    join_date       DATE            NOT NULL,

    -- Every member belongs to exactly one branch.
    -- Branch has a composite PK (branch_name, manager_member_id),
    -- so we need two columns here to form the FK.
    branch_name         TEXT    NOT NULL,
    branch_manager_id   INTEGER NOT NULL,

    CONSTRAINT member_pkey     PRIMARY KEY (member_id),
    CONSTRAINT member_email_uq UNIQUE      (email),

    CONSTRAINT member_branch_fkey
        FOREIGN KEY (branch_name, branch_manager_id)
        REFERENCES branch (branch_name, manager_member_id)
        ON DELETE ______   -- TODO: RESTRICT, CASCADE, or SET NULL? Why?
        DEFERRABLE INITIALLY DEFERRED
);


-- ============================================================
-- Table: branch
--
-- Branch has no surrogate id. It is identified by the pair
-- (branch_name, manager_member_id).
--
-- Circular dependency between member and branch:
--   member references branch  (affiliation FK above)
--   branch references member  (manager FK below)
--
-- We resolve this by adding the branch->member FK via ALTER
-- TABLE and marking it DEFERRABLE INITIALLY DEFERRED, so
-- PostgreSQL only checks it at transaction commit time.
-- ============================================================
CREATE TABLE branch (
    branch_name           TEXT    NOT NULL,
    street_address        TEXT    NOT NULL,
    city                  TEXT    NOT NULL,
    opening_year          INTEGER NOT NULL,
    specialty_description TEXT    NOT NULL,
    manager_member_id     INTEGER NOT NULL,

    CONSTRAINT branch_pkey PRIMARY KEY (branch_name, manager_member_id),

    -- TODO: Add a CHECK constraint so that opening_year is sensible.
    --       It should be greater than 1800 and no later than the current year.
    --       Hint: EXTRACT(YEAR FROM CURRENT_DATE) gives you the current year.
    CONSTRAINT branch_year_chk
        CHECK (____________________________________)
);

-- Deferred FK: branch -> member (resolves the circular dependency).
ALTER TABLE branch
    ADD CONSTRAINT branch_manager_fkey
    FOREIGN KEY (manager_member_id)
    REFERENCES member (member_id)
    ON DELETE RESTRICT
    DEFERRABLE INITIALLY DEFERRED;


-- ============================================================
-- Table: book_copy
--
-- Each copy is owned by exactly one branch. Because branch's
-- PK is composite, the FK here is also composite.
-- ============================================================
CREATE TABLE book_copy (
    book_copy_id        SERIAL         NOT NULL,
    title               TEXT           NOT NULL,
    isbn                CHAR(13)       NOT NULL,
    acquisition_date    DATE           NOT NULL,
    condition           book_condition NOT NULL,
    replacement_cost    NUMERIC(10, 2) NOT NULL,

    -- Owning branch (composite FK mirrors branch's composite PK).
    owning_branch_name       TEXT    NOT NULL,
    owning_branch_manager_id INTEGER NOT NULL,

    CONSTRAINT book_copy_pkey PRIMARY KEY (book_copy_id),

    CONSTRAINT book_copy_cost_chk
        CHECK (replacement_cost > 0),

    CONSTRAINT book_copy_branch_fkey
        FOREIGN KEY (owning_branch_name, owning_branch_manager_id)
        REFERENCES branch (branch_name, manager_member_id)
        ON DELETE RESTRICT
);


-- ============================================================
-- Table: branch_loan
--
-- Records loans of copies to branches other than the owner.
-- A branch cannot borrow its own copy.
--
-- TODO: This table is mostly empty. Using the pattern from
--       book_copy above as a guide, fill in:
--         1. book_copy_id (INTEGER, NOT NULL, FK to book_copy)
--         2. The two borrowing branch columns and their composite FK
--         3. A PRIMARY KEY across the three identifying columns
--
-- Discussion: can a CHECK constraint enforce "a branch cannot
-- borrow its own copy"? Write your answer as a comment below.
-- ============================================================
CREATE TABLE branch_loan (

    -- TODO: add columns and constraints here

    loan_start_date DATE    NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE

);

-- ============================================================
-- End of practical.ddl
-- Verify: psql -h mcsdb.utm.utoronto.ca -U yourutorid -d yourutorid_343 -f practical.ddl
-- ============================================================
