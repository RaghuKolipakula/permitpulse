CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    community TEXT,
    bedrooms INTEGER,
    bathrooms REAL,
    square_feet REAL,
    lot_size_acres REAL,
    year_built INTEGER,
    estimated_value REAL
);
