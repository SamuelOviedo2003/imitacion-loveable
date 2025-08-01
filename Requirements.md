# Dominate Local Leads - Project Requirements

## Table of Contents
- [Authentication & User Management](#authentication--user-management)
- [Universal Header](#universal-header)
- [Dashboard](#dashboard)
- [New Leads](#new-leads)
- [Lead Details](#lead-details)
- [Communications](#communications)
- [Incoming Calls](#incoming-calls)
- [FB Analysis](#fb-analysis)
- [Salesman](#salesman)
- [Database Schema](#database-schema)
- [Error Handling & Edge Cases](#error-handling--edge-cases)

---

## Authentication & User Management

### Functional Requirements
- **Login System**: Users authenticate via Supabase Auth
- **Session Management**: Persistent sessions with automatic token refresh
- **Protected Routes**: All pages except login require authentication
- **Business Data Association**: Each user is associated with business data from `business_clients` table

### UI/UX Behavior
- **Login Redirect**: Unauthenticated users redirect to login page
- **Loading States**: Show loading indicators during auth state changes
- **User Profile**: Header displays user email initial in circular avatar
- **Sign Out**: Dropdown menu with sign out option

### SQL Queries
```sql
-- Fetch business data for authenticated user
SELECT * FROM business_clients LIMIT 1;

-- User profile data comes from Supabase Auth
```

### Edge Cases
- **Failed Authentication**: Redirect to login with error message
- **Session Expiry**: Automatic logout and redirect to login
- **Missing Business Data**: Show loading state until business data loads

---

## Universal Header

### Functional Requirements
- **Company Logo**: Display business logo from `business_clients.avatar_url`
- **Navigation Menu**: Links to all main sections
- **User Profile**: Show authenticated user info with dropdown
- **Active State**: Highlight current page in navigation

### UI/UX Behavior
- **Logo Loading**: Header waits for business data before rendering (prevents logo flash)
- **Fixed Height**: Logo maintains `h-12` height for consistency
- **Responsive**: Navigation collapses on mobile (hidden md:flex)
- **Hover States**: Interactive elements have hover effects

### Navigation Links
- Dashboard
- New Leads
- Salesman
- Incoming Calls
- FB Analysis

### Edge Cases
- **Page Refresh**: Entire header waits for logo before showing (no partial rendering)
- **Missing Logo**: Show loading placeholder until business data available
- **Long Company Names**: Truncate if necessary

---

## Dashboard

### Functional Requirements
- **Under Construction**: Currently shows placeholder content
- **Future State**: Will display key metrics and overview charts

### UI/UX Behavior
- **Centered Layout**: Simple centered message
- **Protected Route**: Requires authentication

---

## New Leads

### Functional Requirements
- **Lead Metrics Display**: Show total leads, contacted leads, booked leads, contact rate, booking rate
- **Appointment Setters Component**: Display appointment setter performance metrics with vertical carousel
- **Recent Leads Table**: Display leads with pagination/filtering capabilities
- **Time Period Filter**: 30, 60, or 90 days
- **Lead Navigation**: Click on lead to open Lead Details view

### UI/UX Behavior
- **Loading States**: Show loading indicators while fetching data
- **Metrics Cards**: Display key performance indicators in card format
- **Interactive Table**: Hover effects on table rows
- **Date Filter**: Dropdown selector in top-right corner

### SQL Queries
```sql
-- Main leads query with time filter
SELECT * FROM leads 
WHERE created_at >= $startDateISO 
AND business_id = $businessId
ORDER BY created_at DESC;

-- Calculate metrics from leads data
-- Total leads: COUNT(*)
-- Contacted leads: COUNT WHERE contacted = true
-- Booked leads: COUNT WHERE start_time IS NOT NULL
-- Contact rate: (contacted/total) * 100
-- Booking rate: (booked/contacted) * 100
```

### Recent Leads Table Columns
1. **Lead Name**: Formatted from `first_name + last_name`
2. **How Soon**: Urgency indicator with color coding
3. **Service**: Service type needed
4. **Date**: Created date formatted as "Jan 1, 5:00 AM"
5. **Score**: Lead quality score with color-coded percentage badges
6. **Status**: Current lead status

### Data Transformations
- **Name Formatting**: `first_name + " " + last_name` or `first_name` only if last_name missing
- **Urgency Colors**: Red (ASAP), Orange (week), Blue (month), Gray (default)
- **Score Colors**: Red (0-33%), Yellow (34-66%), Green (67-100%)
- **Status Display**: Standardized status badges

### Appointment Setters Component (New Leads Page)
- **Layout**: Right side of grid layout, symmetrical with Lead Metrics
- **Display**: Vertical carousel showing one setter at a time
- **Navigation**: Up/down arrows with pagination counter (e.g., "1/3")
- **Sorting**: Sorted by booked appointments in descending order (best performers first)
- **Structure**: Mirrors LeadMetrics component layout exactly
- **Statistics**: Leads, contacted, booked, contact rate, booking rate
- **Fixed Height**: Maintains visual balance regardless of content

### Edge Cases
- **No Data**: Show "No leads found" message
- **Loading**: Show loading spinners
- **Missing Fields**: Handle null values gracefully (show "N/A" or "Unknown")

---

## Lead Details

### Functional Requirements
- **Lead Information Display**: Show complete lead profile
- **Property Information**: Display property details and image
- **Communications History**: Show all communications for this lead
- **Real-time Updates**: Communications update in real-time

### UI/UX Behavior
- **Two-Column Layout**: Lead info + Property image on top row
- **Expandable Communications**: Table expands based on content (no internal scroll)
- **Fixed Chat Interface**: Chat input remains at bottom
- **Navigation**: Back navigation to leads list

### Lead Information Fields
- **Basic Info**: Name, email, phone
- **Lead Score Component**: Color-coded percentage score display in top-right corner with dynamic backgrounds (Red: 0-33%, Yellow: 34-66%, Green: 67-100%)
- **Service Details**: Service needed, urgency (labeled as "How Soon")
- **Lead Metadata**: Assigned, setter_name, roof_age, payment_type, email_valid (displayed as check/X icons), source
- **Appointment**: Scheduled appointment time
- **Navigation**: Back button with arrow icon to return to New Leads page

### Property Information
- **Property Image**: Display from `house_url` or fallback to no-image placeholder
- **Address**: Property address with Google Maps link
- **Value**: Property value
- **Location**: Distance and duration (shown in right panel)

### SQL Queries
```sql
-- Main lead query
SELECT * FROM leads WHERE lead_id = $leadId;

-- Property data from clients table
SELECT house_value, distance_meters, house_url, full_address, duration_seconds 
FROM clients WHERE account_id = $accountId;

-- Communications for this lead
SELECT * FROM communications 
WHERE account_id = $accountId 
ORDER BY created_at ASC;
```

### Edge Cases
- **Missing Property Data**: Show fallback values ("N/A", default image)
- **No Communications**: Show "No communications recorded" message
- **Invalid Lead ID**: Show "Lead not found" with back button

---

## Communications

### Functional Requirements
- **Communications Table**: Display all communications chronologically
- **Audio Playback**: Play recording files with seek functionality and progress bars
- **Message Type Indicators**: Visual badges for different communication types
- **Chronological Sorting**: Sort by created_at (oldest to newest)
- **Audio Progress Control**: Visual progress bar with time display and click-to-seek functionality

### UI/UX Behavior
- **No Internal Scroll**: Table expands vertically based on content
- **Audio Controls**: Play/pause buttons with seek functionality and progress visualization
- **Progress Bars**: Visual progress indicators with current time and total duration
- **Type Badges**: Color-coded badges for different message types
- **Hover Effects**: Row highlighting on hover

### Table Columns
1. **Type**: Message type with color-coded badge
2. **Summary**: Communication summary or content
3. **Created**: Date/time formatted as "Jan 1, 5:00 AM"
4. **Audio**: Play/pause controls with progress bar, time display, and seek functionality

### Message Type Colors
- **Email**: Blue (`bg-blue-50 text-blue-600 border-blue-200`)
- **SMS/Text**: Green (`bg-green-50 text-green-600 border-green-200`)
- **Call/Phone**: Purple (`bg-purple-50 text-purple-600 border-purple-200`)
- **Voicemail**: Orange (`bg-orange-50 text-orange-600 border-orange-200`)
- **Default**: Gray (`bg-gray-50 text-gray-600 border-gray-200`)

### SQL Queries
```sql
-- Communications for lead (sorted chronologically)
SELECT * FROM communications 
WHERE account_id = $accountId 
ORDER BY created_at ASC;
```

### Edge Cases
- **No Communications**: Show placeholder message
- **Missing Audio**: Disable play button, show grayed out icon
- **Audio Playback Errors**: Handle failed audio loading gracefully

---

## Incoming Calls

### Functional Requirements
- **Call Analytics**: Visual charts and data analysis
- **Source Distribution**: Chart showing call sources
- **Caller Type Distribution**: Chart showing types of callers
- **Sankey Diagram**: Flow from sources to caller types
- **Recent Calls Table**: List of recent incoming calls
- **Time Period Filter**: 30, 60, or 90 days

### UI/UX Behavior
- **Dashboard Layout**: Charts in grid layout
- **Interactive Charts**: Hover effects and tooltips
- **Data Table**: Scrollable table with call details

### Charts & Visualizations

#### Source Distribution Chart
- **Type**: Pie/Donut chart
- **Data**: Call counts by source
- **Shows**: Distribution of where calls are coming from

#### Caller Type Distribution Chart  
- **Type**: Pie/Donut chart
- **Data**: Call counts by caller type
- **Shows**: Types of people calling (e.g., leads, customers, etc.)

#### Sankey Diagram
- **Type**: Flow diagram
- **Data**: Relationships between sources and caller types
- **Shows**: How different sources convert to different caller types
- **Filtering**: Excludes "Unknown" values

### SQL Queries
```sql
-- Incoming calls data
SELECT * FROM incoming_calls 
WHERE created_at >= $startDate 
ORDER BY created_at DESC;
```

### Data Processing
- **Source Filtering**: Remove null/empty/"Unknown" sources
- **Caller Type Filtering**: Remove null/empty/"Unknown" caller types
- **Percentage Calculations**: Calculate percentages for chart displays

---

## FB Analysis

### Functional Requirements
- **Under Construction**: Currently placeholder content
- **Future State**: Facebook advertising analysis and metrics

---

## Salesman

### Functional Requirements
- **Revenue Metrics Display**: Show comprehensive revenue and performance metrics (moved from New Leads page)
- **Time Period Filter**: 30, 60, or 90 days selection
- **Performance Analytics**: Revenue tracking, conversion rates, and sales team metrics
- **Date-based Filtering**: Dynamic data filtering based on selected time periods

### UI/UX Behavior
- **Metrics Dashboard**: Clean dashboard layout with key performance indicators
- **Interactive Filters**: Dropdown time period selector
- **Loading States**: Show loading indicators while fetching data
- **Responsive Design**: Adapts to different screen sizes

---

## Database Schema

### Key Tables & Relationships

#### leads
- **Primary Key**: `lead_id`
- **Foreign Key**: `account_id` → `clients.account_id`
- **Key Fields**: `first_name`, `last_name`, `email`, `phone`, `service`, `how_soon` (formerly urgency), `created_at`, `assigned`, `setter_name`, `roof_age`, `payment_type`, `email_valid`, `source`, `score`, `status`

#### clients
- **Primary Key**: `account_id`
- **Related Data**: `house_value`, `distance_meters`, `house_url`, `full_address`, `duration_seconds`

#### communications
- **Primary Key**: `communication_id`
- **Foreign Key**: `account_id` → `clients.account_id`
- **Key Fields**: `message_type`, `summary`, `recording_url`, `created_at`

#### business_clients
- **Primary Key**: `business_id`
- **Key Fields**: `company_name`, `avatar_url` (for header logo)

#### leads_calls
- **Composite Relationship**: Links to `leads.lead_id`
- **Key Fields**: `assigned`, `duration`, `time_speed`, `created_at`

#### incoming_calls
- **Independent Table**: Call tracking data
- **Key Fields**: `source`, `caller_type`, `created_at`, `account_id`

---

## Error Handling & Edge Cases

### Authentication Errors
- **Failed Login**: Show error message, remain on login page
- **Session Expired**: Automatic logout, redirect to login
- **Network Issues**: Show connection error message

### Data Loading States
- **Initial Load**: Show loading spinners/skeletons
- **Empty States**: "No data found" messages with appropriate icons
- **Failed Requests**: Error messages with retry options

### Form Validation
- **Required Fields**: Highlight missing required fields
- **Invalid Data**: Show validation error messages
- **Network Errors**: Handle failed submissions gracefully

### Performance Considerations
- **Large Datasets**: Implement pagination where needed
- **Real-time Updates**: Optimize WebSocket connections
- **Image Loading**: Lazy loading for property images
- **Audio Files**: Progressive loading for recordings

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **JavaScript Required**: Graceful degradation for disabled JS
- **Mobile Responsive**: All layouts adapt to mobile screens

---

## Development Notes

### Technology Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: React Context API
- **Charts**: Custom chart components
- **Audio**: HTML5 Audio API

### Code Organization
- **Pages**: App Router structure in `/src/app/`
- **Components**: Reusable components in `/src/components/`
- **Hooks**: Custom hooks in `/src/hooks/`
- **Utils**: Utility functions in `/src/lib/`
- **Contexts**: React contexts in `/src/contexts/`

### Quality Assurance
- **Testing**: Component and integration testing required
- **Performance**: Monitor loading times and optimize as needed
- **Accessibility**: WCAG compliance for all interactive elements
- **Security**: Validate all inputs, sanitize outputs, protect against SQL injection

---

*This document serves as the definitive guide for development, testing, and feature validation.*