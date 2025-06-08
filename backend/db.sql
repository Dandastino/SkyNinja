-- the user
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_role VARCHAR(5) NOT NULL DEFAULT 'user',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    prefix VARCHAR(5),
    phone_number VARCHAR(15),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- what the user likes
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    travel_style JSONB, -- e.g., 'adventure', 'relaxation', 'cultural', 'fun'
    budget_range JSONB, -- e.g., 'poor', 'mid-range', 'luxury'
    preferences_destinations JSONB, -- e.g., ['Italy', 'Japan', 'Egypt']
    preferences_accommodations JSONB, -- e.g., ['hotel', 'hostel', 'apartment']
    preferences_accompaniment JSONB, -- e.g., ['solo', 'couple', 'family', 'friends']
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- The tips the user books or is booking / if the user wants can ask the gpt for an itinerary
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    destination VARCHAR(100) NOT NULL,
    number_of_travelers INT DEFAULT 1,
    starts DATE NOT NULL,
    ends DATE NOT NULL,
    current_status VARCHAR(20) NOT NULL DEFAULT 'planned',
    total_cost DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'EUR',
    activities JSONB, -- e.g., [{'name': 'Visit Colosseum', 'date': '2023-10-01', 'details': 'Link for tikets'}]
    itinerary TEXT, -- Here gives advice for where to eat, how to move around, etc..'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- The plane the user books or is booking he can have more than one for the same trip
CREATE TABLE transports(
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    departure_location VARCHAR(100) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    departure_date DATE NOT NULL,
    arrival_location VARCHAR(100) NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    arrival_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- accomodation for the user, he can have more than for the same trip
CREATE TABLE accommodations(
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    accommodation_location VARCHAR(100) NOT NULL,
    check_in_date DATE NOT NULL,
    check_in_time TIMESTAMP NOT NULL,
    check_out_date DATE NOT NULL,
    check_out_time TIMESTAMP NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);


INSERT INTO users (first_name, last_name, username, prefix ,phone_number, email, password_hash) 
VALUES ('Moustafa', 'Sherif', 'Dandastino', '+47', '91259103', 'sherif.mustaa@gmail.com', 'firstpassword')
