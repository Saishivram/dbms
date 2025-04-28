-- Drop database if it exists and create a new one
DROP DATABASE IF EXISTS newspaper_supply_chain;
CREATE DATABASE newspaper_supply_chain;
USE newspaper_supply_chain;

-- Create owner table
CREATE TABLE owner (
    owner_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employee table
CREATE TABLE employee (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    owner_id INT,
    phone VARCHAR(15),
    role VARCHAR(50) DEFAULT 'delivery',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owner(owner_id) ON DELETE CASCADE
);

-- Create customer table
CREATE TABLE customer (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create newspaper table
CREATE TABLE newspaper (
    newspaper_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    publisher VARCHAR(100) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owner(owner_id) ON DELETE CASCADE
);

-- Create subscription table
CREATE TABLE subscription (
    subscription_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    newspaper_id INT,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
    monthly_fee DECIMAL(10,2) NOT NULL,
    next_payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (newspaper_id) REFERENCES newspaper(newspaper_id) ON DELETE CASCADE
);

-- Create payment table
CREATE TABLE payment (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'late') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscription(subscription_id) ON DELETE CASCADE
);

-- Create delivery table
CREATE TABLE delivery (
    delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    customer_id INT,
    newspaper_id INT,
    delivery_date DATE NOT NULL,
    status ENUM('pending', 'delivered', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (newspaper_id) REFERENCES newspaper(newspaper_id) ON DELETE CASCADE
);

-- Create notification table
CREATE TABLE notification (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT,
    employee_id INT,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owner(owner_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_employee_owner ON employee(owner_id);
CREATE INDEX idx_newspaper_owner ON newspaper(owner_id);
CREATE INDEX idx_subscription_customer ON subscription(customer_id);
CREATE INDEX idx_subscription_newspaper ON subscription(newspaper_id);
CREATE INDEX idx_payment_subscription ON payment(subscription_id);
CREATE INDEX idx_payment_date ON payment(payment_date);
CREATE INDEX idx_delivery_employee ON delivery(employee_id);
CREATE INDEX idx_delivery_customer ON delivery(customer_id);
CREATE INDEX idx_delivery_newspaper ON delivery(newspaper_id);
CREATE INDEX idx_delivery_date ON delivery(delivery_date);
CREATE INDEX idx_notification_owner ON notification(owner_id);
CREATE INDEX idx_notification_employee ON notification(employee_id);

-- Trigger to check payment status on insert
DELIMITER //
CREATE TRIGGER check_payment_status_before_insert
BEFORE INSERT ON payment
FOR EACH ROW
BEGIN
    IF NEW.payment_date > NEW.due_date THEN
        SET NEW.status = 'late';
    END IF;
END //
DELIMITER ;

-- Trigger to check payment status on update
DELIMITER //
CREATE TRIGGER check_payment_status_before_update
BEFORE UPDATE ON payment
FOR EACH ROW
BEGIN
    IF NEW.payment_date > NEW.due_date AND NEW.status != 'late' THEN
        SET NEW.status = 'late';
    END IF;
END //
DELIMITER ;

-- Trigger to suspend subscription after three late payments
DELIMITER //
CREATE TRIGGER check_subscription_status
AFTER UPDATE ON payment
FOR EACH ROW
BEGIN
    DECLARE late_count INT;
    
    IF NEW.status = 'late' THEN
        SELECT COUNT(*) INTO late_count
        FROM payment
        WHERE subscription_id = NEW.subscription_id
        AND status = 'late'
        AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
        
        IF late_count >= 3 THEN
            UPDATE subscription
            SET status = 'suspended'
            WHERE subscription_id = NEW.subscription_id;
            
            -- Insert notification for owner
            INSERT INTO notification (owner_id, message)
            SELECT DISTINCT o.owner_id, CONCAT('Subscription #', NEW.subscription_id, ' has been suspended due to multiple late payments')
            FROM subscription s
            JOIN newspaper n ON s.newspaper_id = n.newspaper_id
            JOIN owner o ON n.owner_id = o.owner_id
            WHERE s.subscription_id = NEW.subscription_id;
        END IF;
    END IF;
END //
DELIMITER ;

-- Trigger to automatically set next payment date when subscription is created
DELIMITER //
CREATE TRIGGER set_next_payment_date_on_subscription
BEFORE INSERT ON subscription
FOR EACH ROW
BEGIN
    SET NEW.next_payment_date = DATE_ADD(NEW.start_date, INTERVAL 1 MONTH);
END //
DELIMITER ;

-- Trigger to update next payment date when payment is made
DELIMITER //
CREATE TRIGGER update_next_payment_date
AFTER UPDATE ON payment
FOR EACH ROW
BEGIN
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        UPDATE subscription
        SET next_payment_date = DATE_ADD(NEW.payment_date, INTERVAL 1 MONTH)
        WHERE subscription_id = NEW.subscription_id;
    END IF;
END //
DELIMITER ; 