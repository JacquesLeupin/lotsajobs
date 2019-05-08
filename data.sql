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