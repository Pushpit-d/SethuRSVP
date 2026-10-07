-- Run this in the Neon SQL Editor (console.neon.tech > SQL Editor)

CREATE TABLE rsvps (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  guest_count integer NOT NULL DEFAULT 1,
  meal_preferences jsonb NOT NULL DEFAULT '[]',
  submitted_at timestamptz NOT NULL DEFAULT now()
);
