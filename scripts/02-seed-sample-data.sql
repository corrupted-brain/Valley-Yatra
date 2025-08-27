-- Adding sample data for Kathmandu Valley bus routes and stops

-- Insert sample bus routes
INSERT INTO bus_routes (route_number, route_name, start_location, end_location, total_distance_km, estimated_duration_minutes, operating_hours_start, operating_hours_end, frequency_minutes) VALUES
('KTM-01', 'Ratna Park - Bhaktapur', 'Ratna Park', 'Bhaktapur Durbar Square', 15.5, 45, '06:00', '21:00', 15),
('KTM-02', 'New Bus Park - Patan', 'New Bus Park', 'Patan Dhoka', 8.2, 25, '06:00', '22:00', 10),
('KTM-03', 'Maharajgunj - Kirtipur', 'Maharajgunj', 'Kirtipur Campus', 12.3, 35, '06:30', '20:30', 20),
('KTM-04', 'Balaju - Sankhamul', 'Balaju', 'Sankhamul', 18.7, 50, '06:00', '21:30', 12),
('KTM-05', 'Kalanki - Koteshwor', 'Kalanki', 'Koteshwor', 22.1, 60, '05:30', '22:00', 18);

-- Insert sample bus stops
INSERT INTO bus_stops (stop_name, stop_code, latitude, longitude, address, landmarks, district, zone, is_major_stop, facilities) VALUES
('Ratna Park', 'RNP001', 27.7172, 85.3240, 'Ratna Park, Kathmandu', 'Near Ratna Park, City Center', 'Kathmandu', 'Bagmati', true, '{"wheelchair_accessible": true, "shelter": true, "seating": true}'),
('New Bus Park', 'NBP001', 27.7000, 85.3000, 'New Bus Park, Gongabu', 'Main Bus Terminal', 'Kathmandu', 'Bagmati', true, '{"wheelchair_accessible": true, "shelter": true, "seating": true, "restrooms": true}'),
('Bhaktapur Durbar Square', 'BDS001', 27.6710, 85.4298, 'Durbar Square, Bhaktapur', 'Historic Durbar Square', 'Bhaktapur', 'Bagmati', true, '{"wheelchair_accessible": false, "shelter": true, "seating": true}'),
('Patan Dhoka', 'PTD001', 27.6766, 85.3250, 'Patan Dhoka, Lalitpur', 'Patan Museum Area', 'Lalitpur', 'Bagmati', true, '{"wheelchair_accessible": true, "shelter": true, "seating": false}'),
('Maharajgunj', 'MRG001', 27.7394, 85.3347, 'Maharajgunj, Kathmandu', 'Near TU Teaching Hospital', 'Kathmandu', 'Bagmati', true, '{"wheelchair_accessible": true, "shelter": true, "seating": true}'),
('Kirtipur Campus', 'KTC001', 27.6780, 85.2800, 'Tribhuvan University, Kirtipur', 'TU Central Campus', 'Kathmandu', 'Bagmati', true, '{"wheelchair_accessible": true, "shelter": true, "seating": true}'),
('Balaju', 'BLJ001', 27.7394, 85.2969, 'Balaju, Kathmandu', 'Balaju Industrial Area', 'Kathmandu', 'Bagmati', false, '{"wheelchair_accessible": false, "shelter": true, "seating": false}'),
('Sankhamul', 'SKM001', 27.6900, 85.3500, 'Sankhamul, Kathmandu', 'Near Bagmati River', 'Kathmandu', 'Bagmati', false, '{"wheelchair_accessible": false, "shelter": false, "seating": false}'),
('Kalanki', 'KLK001', 27.6947, 85.2797, 'Kalanki, Kathmandu', 'Ring Road Junction', 'Kathmandu', 'Bagmati', true, '{"wheelchair_accessible": true, "shelter": true, "seating": true}'),
('Koteshwor', 'KTS001', 27.6775, 85.3475, 'Koteshwor, Kathmandu', 'Ring Road East', 'Kathmandu', 'Bagmati', true, '{"wheelchair_accessible": true, "shelter": true, "seating": true}');

-- Insert route-stop relationships for KTM-01 (Ratna Park - Bhaktapur)
INSERT INTO route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, estimated_travel_time_minutes, fare_from_start) VALUES
(1, 1, 1, 0.0, 0, 0.00),
(1, 3, 2, 15.5, 45, 25.00);

-- Insert route-stop relationships for KTM-02 (New Bus Park - Patan)
INSERT INTO route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, estimated_travel_time_minutes, fare_from_start) VALUES
(2, 2, 1, 0.0, 0, 0.00),
(2, 4, 2, 8.2, 25, 18.00);

-- Insert route-stop relationships for KTM-03 (Maharajgunj - Kirtipur)
INSERT INTO route_stops (route_id, stop_id, stop_sequence, distance_from_start_km, estimated_travel_time_minutes, fare_from_start) VALUES
(3, 5, 1, 0.0, 0, 0.00),
(3, 6, 2, 12.3, 35, 22.00);

-- Insert sample fare structure
INSERT INTO fare_structure (route_id, distance_range_start_km, distance_range_end_km, base_fare, student_fare, senior_fare, effective_from) VALUES
(1, 0.0, 5.0, 15.00, 10.00, 12.00, '2024-01-01'),
(1, 5.1, 15.0, 20.00, 15.00, 18.00, '2024-01-01'),
(1, 15.1, 25.0, 25.00, 20.00, 22.00, '2024-01-01'),
(2, 0.0, 10.0, 18.00, 12.00, 15.00, '2024-01-01'),
(3, 0.0, 15.0, 22.00, 16.00, 19.00, '2024-01-01');

-- Insert transfer points
INSERT INTO transfer_points (stop_id, connecting_routes, transfer_time_minutes, is_major_hub) VALUES
(1, '[1, 2, 4]', 5, true),
(2, '[2, 3, 5]', 8, true),
(9, '[4, 5]', 6, true),
(10, '[4, 5]', 6, true);
