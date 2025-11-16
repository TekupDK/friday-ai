# Requirements Document - CRM Module for Friday AI

## Introduction

This document specifies the requirements for implementing a comprehensive CRM (Customer Relationship Management) module within the Friday AI platform. The CRM module will extend the existing lead intelligence system to provide full customer lifecycle management, from lead capture through service delivery and invoicing, specifically tailored for Rendetalje's cleaning business operations.

The system will be built on the existing Friday AI infrastructure (React 19, TypeScript, TRPC, Drizzle ORM, PostgreSQL) and will integrate seamlessly with current features including lead management, Billy invoicing, Google Calendar, and email intelligence.

## Glossary

- **System**: The Friday AI CRM Module

- **User**: A Friday AI platform user (Rendetalje employee)

- **Customer**: A client of Rendetalje with an active customer profile

- **Lead**: A potential customer in the sales pipeline

- **Property**: A physical location (ejendom) where cleaning services are performed

- **Booking**: A scheduled cleaning service appointment

- **Service Template**: A predefined cleaning service type with standard pricing and duration

- **Field Worker**: A Rendetalje employee who performs on-site cleaning services

- **Billy**: External invoicing system integration

- **Pipeline Stage**: Current status of a lead or customer in the sales/service workflow

## Requirements

### Requirement 1: Customer Profile Management

**User Story:** As a User, I want to view and manage comprehensive customer profiles, so that I have all relevant customer information in one place.

#### Acceptance Criteria

1. WHEN a User opens a customer profile, THE System SHALL display customer name, email, phone, status, tags, and customer type
1. WHEN a User views a customer profile, THE System SHALL display financial summary including total invoiced, total paid, balance, and invoice count
1. WHEN a User views a customer profile, THE System SHALL display activity metrics including email count, last contact date, and last sync date
1. WHERE a customer has an AI-generated resume, THE System SHALL display the AI resume in the customer profile
1. WHEN a User updates customer information, THE System SHALL save changes to the database and update the timestamp

### Requirement 2: Property (Ejendom) Management

**User Story:** As a User, I want to manage multiple properties for each customer, so that I can track service locations and property-specific details.

#### Acceptance Criteria

1. WHEN a User adds a property to a customer profile, THE System SHALL store address, city, postal code, and coordinates
1. WHEN a User views customer properties, THE System SHALL display all properties with primary property highlighted
1. WHERE a property has custom attributes, THE System SHALL store and display property type, size, access codes, parking information, and special requirements
1. WHEN a User marks a property as primary, THE System SHALL update only one property as primary per customer
1. WHEN a User adds property notes, THE System SHALL store and display notes with timestamp

### Requirement 3: Service Template Configuration

**User Story:** As a User, I want to create and manage service templates, so that I can quickly book standard cleaning services with consistent pricing.

#### Acceptance Criteria

1. WHEN a User creates a service template, THE System SHALL store title, description, category, duration in minutes, and price in DKK
1. WHEN a User views service templates, THE System SHALL display all active templates grouped by category
1. WHERE a service template has category "vinduespolering", THE System SHALL apply category-specific defaults
1. WHEN a User deactivates a service template, THE System SHALL set isActive to false without deleting the template
1. WHEN a User creates a booking, THE System SHALL allow selection from active service templates

### Requirement 4: Booking Management

**User Story:** As a User, I want to create and manage service bookings, so that I can schedule cleaning services for customers.

#### Acceptance Criteria

1. WHEN a User creates a booking, THE System SHALL require customer profile, scheduled start time, and status
1. WHEN a User creates a booking with a service template, THE System SHALL pre-fill title, duration, and notes from the template
1. WHERE a booking is linked to a property, THE System SHALL display property address and access information
1. WHEN a User assigns a booking to a field worker, THE System SHALL store assignee user ID and send notification
1. WHEN a booking status changes to "completed", THE System SHALL trigger invoice creation workflow

### Requirement 5: Lead Assignment and Conversion

**User Story:** As a User, I want to assign leads to team members and convert qualified leads to customers, so that I can manage the sales pipeline effectively.

#### Acceptance Criteria

1. WHEN a User assigns a lead, THE System SHALL store assigned user ID, assignment timestamp, and optional notes
1. WHEN a User views assigned leads, THE System SHALL display leads grouped by assignee
1. WHEN a User converts a lead to customer, THE System SHALL create customer profile with lead ID reference
1. WHERE a lead has metadata, THE System SHALL transfer relevant metadata to customer profile during conversion
1. WHEN a lead is converted, THE System SHALL update lead status to "won" and set conversion timestamp

### Requirement 6: CRM Dashboard and Analytics

**User Story:** As a User, I want to view CRM dashboard with key metrics, so that I can monitor business performance at a glance.

#### Acceptance Criteria

1. WHEN a User opens the CRM dashboard, THE System SHALL display total customer count, active customer count, and VIP customer count
1. WHEN a User views the dashboard, THE System SHALL display total revenue, paid revenue, and outstanding balance
1. WHEN a User views the dashboard, THE System SHALL display booking statistics including planned, in-progress, and completed bookings
1. WHERE there are at-risk customers, THE System SHALL display at-risk customer count with alert indicator
1. WHEN a User clicks a dashboard metric, THE System SHALL navigate to filtered view of relevant entities

### Requirement 7: Customer Search and Filtering

**User Story:** As a User, I want to search and filter customers by multiple criteria, so that I can quickly find specific customers or customer segments.

#### Acceptance Criteria

1. WHEN a User enters search text, THE System SHALL search customer name, email, and phone fields
1. WHEN a User applies status filter, THE System SHALL display only customers matching selected status
1. WHEN a User applies tag filter, THE System SHALL display only customers with selected tags
1. WHERE a User applies multiple filters, THE System SHALL combine filters with AND logic
1. WHEN search results exceed 50 records, THE System SHALL implement pagination with 50 records per page

### Requirement 8: Task Management Integration

**User Story:** As a User, I want to create tasks linked to customers and leads, so that I can track follow-up actions.

#### Acceptance Criteria

1. WHEN a User creates a task from customer profile, THE System SHALL link task to customer ID
1. WHEN a User creates a task from lead view, THE System SHALL link task to lead ID
1. WHEN a User views customer profile, THE System SHALL display all related tasks with status and priority
1. WHERE a task has due date, THE System SHALL display overdue indicator when due date has passed
1. WHEN a User completes a task, THE System SHALL update task status and set completion timestamp

### Requirement 9: Email Integration with Customer Context

**User Story:** As a User, I want emails automatically linked to customer profiles, so that I can see complete communication history.

#### Acceptance Criteria

1. WHEN an email is received from a known customer email, THE System SHALL link email to customer profile
1. WHEN a User views customer profile, THE System SHALL display email count and recent emails
1. WHEN a User clicks an email in customer profile, THE System SHALL open email in Email Center panel
1. WHERE an email matches multiple customers, THE System SHALL prompt User to select correct customer
1. WHEN a User manually links an email to customer, THE System SHALL create customer email association

### Requirement 10: Invoice Integration with Billy

**User Story:** As a User, I want invoices automatically synced with Billy and linked to customers, so that I have accurate financial tracking.

#### Acceptance Criteria

1. WHEN a booking is completed, THE System SHALL create invoice draft in Billy with customer details
1. WHEN Billy invoice is created, THE System SHALL store Billy invoice ID and sync invoice data
1. WHEN a User views customer profile, THE System SHALL display all invoices with status and amounts
1. WHERE an invoice is paid in Billy, THE System SHALL update invoice status and paid amount
1. WHEN invoice data changes in Billy, THE System SHALL sync changes within 5 minutes

### Requirement 11: Mobile Field Worker Interface

**User Story:** As a Field Worker, I want a mobile-optimized interface to view and complete bookings, so that I can efficiently manage my daily work.

#### Acceptance Criteria

1. WHEN a Field Worker logs in on mobile device, THE System SHALL display today's bookings in chronological order
1. WHEN a Field Worker opens a booking, THE System SHALL display customer name, property address, access codes, and service notes
1. WHEN a Field Worker starts a booking, THE System SHALL update booking status to "in_progress" and record start time
1. WHERE a booking requires photo documentation, THE System SHALL allow photo upload with before/during/after labels
1. WHEN a Field Worker completes a booking, THE System SHALL update status to "completed" and trigger invoice creation

### Requirement 12: Capacity Planning and Scheduling

**User Story:** As a User, I want to view team capacity and booking schedule, so that I can optimize resource allocation.

#### Acceptance Criteria

1. WHEN a User views capacity calendar, THE System SHALL display all bookings grouped by assigned field worker
1. WHEN a User creates a booking, THE System SHALL check for scheduling conflicts and display warning
1. WHERE multiple bookings overlap for same field worker, THE System SHALL highlight conflict with red indicator
1. WHEN a User views weekly capacity, THE System SHALL display total booked hours per field worker
1. WHEN capacity exceeds threshold, THE System SHALL display capacity warning with suggested actions

### Requirement 13: Customer Status Automation

**User Story:** As a User, I want customer status automatically updated based on activity, so that I can identify at-risk customers.

#### Acceptance Criteria

1. WHEN a recurring customer has no bookings for 90 days, THE System SHALL update status to "at_risk"
1. WHEN a customer total invoiced exceeds 50000 DKK, THE System SHALL update status to "vip"
1. WHEN a new customer profile is created, THE System SHALL set status to "new"
1. WHERE a customer has completed 3 or more bookings, THE System SHALL update status to "active"
1. WHEN a customer has no activity for 180 days, THE System SHALL update status to "inactive"

### Requirement 14: AI-Powered Lead Intelligence

**User Story:** As a User, I want AI-generated insights for leads and customers, so that I can make data-driven decisions.

#### Acceptance Criteria

1. WHEN a lead is created, THE System SHALL generate AI lead score based on available data
1. WHEN a User views lead details, THE System SHALL display AI-suggested next actions
1. WHERE a customer has multiple interactions, THE System SHALL generate AI customer resume
1. WHEN AI generates insights, THE System SHALL store confidence score with each insight
1. WHEN a User requests actionable insights, THE System SHALL return prioritized list of opportunities

### Requirement 15: CRM Navigation and Routing

**User Story:** As a User, I want dedicated CRM navigation routes, so that I can easily access CRM features.

#### Acceptance Criteria

1. WHEN a User clicks CRM navigation item, THE System SHALL navigate to /crm/customers route
1. WHEN a User is on CRM route, THE System SHALL highlight active CRM navigation item
1. WHEN a User navigates to /crm/leads, THE System SHALL display lead management interface
1. WHERE a User navigates to /crm/bookings, THE System SHALL display booking calendar view
1. WHEN a User uses keyboard shortcut Alt+C, THE System SHALL navigate to CRM dashboard

### Requirement 16: Data Export and Reporting

**User Story:** As a User, I want to export customer and booking data, so that I can perform external analysis and reporting.

#### Acceptance Criteria

1. WHEN a User clicks export button, THE System SHALL generate CSV file with selected data
1. WHEN a User exports customers, THE System SHALL include all customer fields and calculated metrics
1. WHERE a User applies filters before export, THE System SHALL export only filtered records
1. WHEN export file is generated, THE System SHALL download file with timestamp in filename
1. WHEN export exceeds 1000 records, THE System SHALL process export in background and notify when complete

### Requirement 17: Customer Notes and Activity Timeline

**User Story:** As a User, I want to add notes and view activity timeline for customers, so that I can track customer interactions.

#### Acceptance Criteria

1. WHEN a User adds a note to customer profile, THE System SHALL store note with user ID and timestamp
1. WHEN a User views customer timeline, THE System SHALL display notes, emails, bookings, and invoices in chronological order
1. WHERE a timeline item is a booking, THE System SHALL display booking status and assigned field worker
1. WHEN a User edits a note, THE System SHALL update note content and set updated timestamp
1. WHEN timeline has more than 20 items, THE System SHALL implement infinite scroll loading

### Requirement 18: Permission and Access Control

**User Story:** As an Admin User, I want to control access to CRM features, so that I can maintain data security.

#### Acceptance Criteria

1. WHEN a User with role "user" accesses CRM, THE System SHALL allow view and edit of own assigned customers
1. WHEN a User with role "admin" accesses CRM, THE System SHALL allow view and edit of all customers
1. WHERE a User attempts unauthorized action, THE System SHALL display permission denied message
1. WHEN a User views customer list, THE System SHALL filter customers based on user permissions
1. WHEN an Admin assigns customer to User, THE System SHALL grant User access to that customer

### Requirement 19: Seasonal Business Logic

**User Story:** As a User, I want seasonal indicators and capacity planning, so that I can prepare for peak periods.

#### Acceptance Criteria

1. WHEN current date is between May and September, THE System SHALL display "flytterengøring peak season" indicator
1. WHEN a User views capacity for peak season, THE System SHALL highlight weeks exceeding 80% capacity
1. WHERE a booking is created in peak season, THE System SHALL suggest earlier booking dates if capacity is low
1. WHEN seasonal demand increases, THE System SHALL send capacity alert to Admin users
1. WHEN a User views historical data, THE System SHALL display seasonal trends chart

### Requirement 20: Offline Support for Mobile Workers

**User Story:** As a Field Worker, I want to access booking details offline, so that I can work without internet connection.

#### Acceptance Criteria

1. WHEN a Field Worker opens mobile app with internet connection, THE System SHALL cache today's bookings locally
1. WHEN a Field Worker loses internet connection, THE System SHALL display cached booking data
1. WHERE a Field Worker updates booking offline, THE System SHALL queue changes for sync
1. WHEN internet connection is restored, THE System SHALL sync queued changes to server
1. WHEN sync conflicts occur, THE System SHALL prompt Field Worker to resolve conflicts
