DROP TABLE IF EXISTS companies, jobs;

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT,
  num_employees INTEGER,
  description TEXT, 
  logo_url TEXT
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT CHECK (equity > 0 AND equity <1) NOT NULL, 
  company_handle TEXT REFERENCES companies ON DELETE CASCADE,
  date_posted TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL, 
  email TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  is_admin BOOLEAN DEFAULT false NOT NULL
);