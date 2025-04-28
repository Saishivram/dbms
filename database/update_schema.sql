USE newspaper_supply_chain;

-- Rename the column to match your code
ALTER TABLE newspaper CHANGE newspaper_name name VARCHAR(255) NOT NULL;

-- Add foreign key constraints to the delivery table
ALTER TABLE delivery 
ADD CONSTRAINT fk_delivery_employee 
FOREIGN KEY (employee_id) REFERENCES employee(employee_id) 
ON DELETE CASCADE;

ALTER TABLE delivery 
ADD CONSTRAINT fk_delivery_customer 
FOREIGN KEY (customer_id) REFERENCES customer(customer_id) 
ON DELETE CASCADE;

ALTER TABLE delivery 
ADD CONSTRAINT fk_delivery_newspaper 
FOREIGN KEY (newspaper_id) REFERENCES newspaper(newspaper_id) 
ON DELETE CASCADE;

-- Change payment_date from VARCHAR to DATE
ALTER TABLE payment MODIFY COLUMN payment_date DATE NOT NULL;

-- Add missing columns to newspaper table
ALTER TABLE newspaper 
ADD COLUMN title VARCHAR(255) AFTER name,
ADD COLUMN publisher VARCHAR(255) AFTER title,
ADD COLUMN frequency VARCHAR(50) AFTER publisher;

-- Update existing records to have default values
UPDATE newspaper SET 
title = name,
publisher = 'Unknown',
frequency = 'Daily'
WHERE title IS NULL;

-- Check if any tables are missing primary keys
-- For example, if the payment table is missing a primary key:
ALTER TABLE payment 
MODIFY COLUMN payment_id INT PRIMARY KEY AUTO_INCREMENT;

-- Add indexes for frequently queried columns
ALTER TABLE delivery ADD INDEX idx_employee_id (employee_id);
ALTER TABLE delivery ADD INDEX idx_customer_id (customer_id);
ALTER TABLE delivery ADD INDEX idx_newspaper_id (newspaper_id);
ALTER TABLE payment ADD INDEX idx_payment_date (payment_date);

-- Ensure critical fields are NOT NULL
ALTER TABLE employee MODIFY COLUMN email VARCHAR(255) NOT NULL;
ALTER TABLE customer MODIFY COLUMN email VARCHAR(255) NOT NULL;
ALTER TABLE newspaper MODIFY COLUMN price DECIMAL(10,2) NOT NULL;

-- Add default values for status fields
ALTER TABLE delivery MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE payment MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending'; 