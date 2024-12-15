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

CREATE TABLE units (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    symbol VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    base_unit_uuid UUID REFERENCES units(uuid),
    multiplier DOUBLE PRECISION,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    created_at_utc TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_at_utc TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);

CREATE TABLE ingredients (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    info TEXT,
    category VARCHAR,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    created_at_utc TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_at_utc TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);

CREATE TABLE orders (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_uuid UUID NOT NULL REFERENCES restaurants(uuid),
    supplier_uuid UUID NOT NULL REFERENCES suppliers(uuid),
    status VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_at_utc TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_at_utc TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);

CREATE TABLE procurements (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_uuid UUID NOT NULL REFERENCES restaurants(uuid),
    supplier_uuid UUID NOT NULL REFERENCES suppliers(uuid),
    price DOUBLE PRECISION,
    currency VARCHAR,
    status VARCHAR NOT NULL,
    note VARCHAR,
    date VARCHAR,
    delivery_date VARCHAR,
    expected_date VARCHAR,
    created_at TIMESTAMP NOT NULL,
    created_at_utc TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_at_utc TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);

CREATE TABLE procurement_ingredients (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procurement_uuid UUID NOT NULL REFERENCES procurements(uuid),
    ingredient_uuid UUID NOT NULL REFERENCES ingredients(uuid),
    unit_uuid UUID NOT NULL REFERENCES units(uuid),
    quantity DOUBLE PRECISION NOT NULL,
    unit_cost DOUBLE PRECISION NOT NULL,
    currency VARCHAR,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    created_at_utc TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_at_utc TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);
