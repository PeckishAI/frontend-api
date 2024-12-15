CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE restaurants (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    info TEXT,
    created_at TIMESTAMP NOT NULL,
    created_at_utc TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_at_utc TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);

CREATE TABLE suppliers (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    info TEXT,
    created_at TIMESTAMP NOT NULL,
    created_at_utc TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_at_utc TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true
);
