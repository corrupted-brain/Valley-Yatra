-- Creating comprehensive database schema for Kathmandu Valley public transport system

-- Bus Routes Table
CREATE TABLE IF NOT EXISTS bus_routes (
    id SERIAL PRIMARY KEY,
    route_number VARCHAR(20) NOT NULL UNIQUE,
    route_name VARCHAR(100) NOT NULL,
    start_location VARCHAR(100) NOT NULL,
    end_location VARCHAR(100) NOT NULL,
    total_distance_km DECIMAL(5,2),
    estimated_duration_minutes INTEGER,
    operating_hours_start TIME,
    operating_hours_end TIME,
    frequency_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bus Stops Table
CREATE TABLE IF NOT EXISTS bus_stops (
    id SERIAL PRIMARY KEY,
    stop_name VARCHAR(100) NOT NULL,
    stop_code VARCHAR(20) UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    landmarks TEXT,
    district VARCHAR(50),
    zone VARCHAR(50),
    is_major_stop BOOLEAN DEFAULT false,
    facilities JSONB, -- wheelchair_accessible, shelter, seating, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route Stops Junction Table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES bus_routes(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES bus_stops(id) ON DELETE CASCADE,
    stop_sequence INTEGER NOT NULL,
    distance_from_start_km DECIMAL(5,2),
    estimated_travel_time_minutes INTEGER,
    fare_from_start DECIMAL(6,2),
    UNIQUE(route_id, stop_sequence),
    UNIQUE(route_id, stop_id)
);

-- Fare Structure Table
CREATE TABLE IF NOT EXISTS fare_structure (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES bus_routes(id) ON DELETE CASCADE,
    distance_range_start_km DECIMAL(5,2) NOT NULL,
    distance_range_end_km DECIMAL(5,2) NOT NULL,
    base_fare DECIMAL(6,2) NOT NULL,
    student_fare DECIMAL(6,2),
    senior_fare DECIMAL(6,2),
    effective_from DATE NOT NULL,
    effective_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transfer Points Table
CREATE TABLE IF NOT EXISTS transfer_points (
    id SERIAL PRIMARY KEY,
    stop_id INTEGER REFERENCES bus_stops(id) ON DELETE CASCADE,
    connecting_routes JSONB, -- Array of route IDs that connect at this stop
    transfer_time_minutes INTEGER DEFAULT 5,
    is_major_hub BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Real-time Bus Tracking (for future implementation)
CREATE TABLE IF NOT EXISTS bus_tracking (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES bus_routes(id) ON DELETE CASCADE,
    bus_number VARCHAR(20),
    current_stop_id INTEGER REFERENCES bus_stops(id),
    next_stop_id INTEGER REFERENCES bus_stops(id),
    estimated_arrival_time TIMESTAMP,
    delay_minutes INTEGER DEFAULT 0,
    occupancy_level VARCHAR(20) CHECK (occupancy_level IN ('low', 'medium', 'high', 'full')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Journey History (for analytics and improvements)
CREATE TABLE IF NOT EXISTS journey_searches (
    id SERIAL PRIMARY KEY,
    from_location VARCHAR(200),
    to_location VARCHAR(200),
    from_coordinates POINT,
    to_coordinates POINT,
    search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    suggested_routes JSONB,
    user_session_id VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bus_stops_coordinates ON bus_stops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_stop_id ON route_stops(stop_id);
CREATE INDEX IF NOT EXISTS idx_fare_structure_route_id ON fare_structure(route_id);
CREATE INDEX IF NOT EXISTS idx_bus_tracking_route_id ON bus_tracking(route_id);
CREATE INDEX IF NOT EXISTS idx_journey_searches_timestamp ON journey_searches(search_timestamp);
