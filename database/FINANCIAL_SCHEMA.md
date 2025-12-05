# Financial Module Database Schema

This document describes the database schema extensions for the Financials/Payout Dashboard module. These tables extend the existing schema without breaking current functionality.

## Overview

The financial module requires the following new tables:
1. `payout_methods` - Store vendor bank account details
2. `partner_details` - Store contractual partner information
3. `email_settings` - Store email notification preferences
4. `monthly_statements` - Cache monthly financial summaries
5. `invoices` - Store invoice records
6. `credit_notes` - Store credit note records

## Schema Definitions

### 1. payout_methods

Stores vendor payout method (bank account) information.

```sql
CREATE TABLE payout_methods (
    id VARCHAR(36) PRIMARY KEY,
    vendor_id VARCHAR(36) NOT NULL,
    type ENUM('bank_account', 'paypal', 'stripe') NOT NULL DEFAULT 'bank_account',
    bank_name VARCHAR(255),
    account_number VARCHAR(50) NOT NULL, -- Encrypted in production
    account_holder_name VARCHAR(255) NOT NULL,
    routing_number VARCHAR(50), -- For US banks
    swift_code VARCHAR(20), -- For international transfers
    is_default BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_is_default (is_default)
);
```

**Security Notes:**
- `account_number` should be encrypted at rest (AES-256)
- Only show last 4 digits in UI
- Require re-authentication before viewing/editing

### 2. partner_details

Stores contractual partner (vendor) business details for invoicing.

```sql
CREATE TABLE partner_details (
    id VARCHAR(36) PRIMARY KEY,
    vendor_id VARCHAR(36) NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(20),
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Singapore',
    invoice_email VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50), -- GST/UEN number
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id)
);
```

### 3. email_settings

Stores vendor preferences for monthly sales overview emails.

```sql
CREATE TABLE email_settings (
    id VARCHAR(36) PRIMARY KEY,
    vendor_id VARCHAR(36) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    include_account_statements BOOLEAN DEFAULT TRUE,
    include_order_summaries BOOLEAN DEFAULT TRUE,
    include_invoices BOOLEAN DEFAULT FALSE,
    include_self_billing_invoices BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id)
);
```

### 4. monthly_statements

Cached monthly financial summaries for faster retrieval.

```sql
CREATE TABLE monthly_statements (
    id VARCHAR(36) PRIMARY KEY,
    vendor_id VARCHAR(36) NOT NULL,
    month TINYINT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    total_orders INT NOT NULL DEFAULT 0,
    total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    platform_fees DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    net_payout DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'processing', 'paid', 'failed') DEFAULT 'pending',
    payout_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vendor_month_year (vendor_id, month, year),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_status (status),
    INDEX idx_year_month (year, month)
);
```

### 5. invoices

Stores invoice records for each order.

```sql
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    order_id VARCHAR(36) NOT NULL,
    vendor_id VARCHAR(36) NOT NULL,
    consumer_id VARCHAR(36) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'cancelled') DEFAULT 'draft',
    pdf_url VARCHAR(500), -- URL to stored PDF
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (consumer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_order_id (order_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_issue_date (issue_date)
);
```

### 6. credit_notes

Stores credit note records for refunds/cancellations.

```sql
CREATE TABLE credit_notes (
    id VARCHAR(36) PRIMARY KEY,
    credit_note_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    vendor_id VARCHAR(36) NOT NULL,
    consumer_id VARCHAR(36) NOT NULL,
    issue_date DATE NOT NULL,
    reason TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('draft', 'issued', 'applied') DEFAULT 'draft',
    pdf_url VARCHAR(500), -- URL to stored PDF
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (consumer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_credit_note_number (credit_note_number)
);
```

## Migrations

### Migration 1: Create Financial Tables

```sql
-- Run this migration to add financial tables
-- Date: 2024-01-XX
-- Description: Add financial module tables

-- Create payout_methods table
CREATE TABLE IF NOT EXISTS payout_methods (
    id VARCHAR(36) PRIMARY KEY,
    vendor_id VARCHAR(36) NOT NULL,
    type ENUM('bank_account', 'paypal', 'stripe') NOT NULL DEFAULT 'bank_account',
    bank_name VARCHAR(255),
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    routing_number VARCHAR(50),
    swift_code VARCHAR(20),
    is_default BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_is_default (is_default)
);

-- Create partner_details table
CREATE TABLE IF NOT EXISTS partner_details (
    id VARCHAR(36) PRIMARY KEY,
    vendor_id VARCHAR(36) NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(20),
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Singapore',
    invoice_email VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id)
);

-- Create email_settings table
CREATE TABLE IF NOT EXISTS email_settings (
    id VARCHAR(36) PRIMARY KEY,
    vendor_id VARCHAR(36) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    include_account_statements BOOLEAN DEFAULT TRUE,
    include_order_summaries BOOLEAN DEFAULT TRUE,
    include_invoices BOOLEAN DEFAULT FALSE,
    include_self_billing_invoices BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id)
);

-- Create monthly_statements table
CREATE TABLE IF NOT EXISTS monthly_statements (
    id VARCHAR(36) PRIMARY KEY,
    vendor_id VARCHAR(36) NOT NULL,
    month TINYINT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    total_orders INT NOT NULL DEFAULT 0,
    total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    platform_fees DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    net_payout DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'processing', 'paid', 'failed') DEFAULT 'pending',
    payout_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vendor_month_year (vendor_id, month, year),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_status (status),
    INDEX idx_year_month (year, month)
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    order_id VARCHAR(36) NOT NULL,
    vendor_id VARCHAR(36) NOT NULL,
    consumer_id VARCHAR(36) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'cancelled') DEFAULT 'draft',
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (consumer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_order_id (order_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_issue_date (issue_date)
);

-- Create credit_notes table
CREATE TABLE IF NOT EXISTS credit_notes (
    id VARCHAR(36) PRIMARY KEY,
    credit_note_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    vendor_id VARCHAR(36) NOT NULL,
    consumer_id VARCHAR(36) NOT NULL,
    issue_date DATE NOT NULL,
    reason TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('draft', 'issued', 'applied') DEFAULT 'draft',
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (consumer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_credit_note_number (credit_note_number)
);
```

## Data Seeding

### Seed Default Email Settings

```sql
-- Set default email settings for all existing vendors
INSERT INTO email_settings (vendor_id, enabled, include_account_statements, include_order_summaries)
SELECT id, TRUE, TRUE, TRUE
FROM vendors
WHERE id NOT IN (SELECT vendor_id FROM email_settings);
```

## API Endpoints

The following API endpoints should be implemented:

### Payout Methods
- `GET /api/vendors/:vendorId/payout-overview` - Get payout overview
- `POST /api/vendors/:vendorId/payout-method` - Save/update payout method
- `GET /api/vendors/:vendorId/payout-method` - Get payout method (masked)

### Monthly Statements
- `GET /api/vendors/:vendorId/monthly-statements` - List all monthly statements
- `GET /api/vendors/:vendorId/monthly-statements/:year/:month/download` - Download statement PDF

### Daily Invoices
- `GET /api/vendors/:vendorId/daily-invoices` - Get invoices for a specific date
- `GET /api/vendors/:vendorId/invoices/:invoiceId/download` - Download invoice PDF
- `GET /api/vendors/:vendorId/credit-notes/:creditNoteId/download` - Download credit note PDF

### Partner Details
- `GET /api/vendors/:vendorId/partner-details` - Get partner details
- `PUT /api/vendors/:vendorId/partner-details` - Update partner details

### Email Settings
- `GET /api/vendors/:vendorId/email-settings` - Get email settings
- `PUT /api/vendors/:vendorId/email-settings` - Update email settings

### Legal Documents
- `GET /api/legal-documents` - List all legal documents

## Security Considerations

1. **Encryption**: All sensitive financial data (account numbers, tax IDs) should be encrypted at rest
2. **Access Control**: Only vendors can access their own financial data
3. **Audit Logging**: Log all financial data access and modifications
4. **Rate Limiting**: Implement rate limiting on download endpoints
5. **PDF Storage**: Store PDFs in secure cloud storage (S3, Cloudinary) with signed URLs
6. **Data Retention**: Implement data retention policies for financial records

## Notes

- All timestamps use UTC
- Decimal precision: 10 digits total, 2 decimal places for currency
- Foreign keys ensure referential integrity
- Indexes optimize common query patterns
- Unique constraints prevent duplicate records

