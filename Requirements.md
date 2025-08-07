# Dominate Local Leads - Project Requirements

## Table of Contents
- [Authentication & User Management](#authentication--user-management)
- [Universal Header](#universal-header)
- [Home Page](#home-page)
- [Dashboard](#dashboard)
- [New Leads](#new-leads)
- [Lead Details](#lead-details)
- [Communications](#communications)
- [Incoming Calls](#incoming-calls)
- [Salesman](#salesman)
- [FB Analysis](#fb-analysis)
- [Settings](#settings)
- [Loading System](#loading-system)
- [Database Schema](#database-schema)
- [Error Handling & Edge Cases](#error-handling--edge-cases)

---

## Authentication & User Management

### Functional Requirements
- **Login System**: Users authenticate via Supabase Auth with email/password
- **Session Management**: Persistent sessions with automatic token refresh
- **Protected Routes**: All pages except login require authentication via ProtectedLayout
- **User Roles**: Support for different user roles including Super Admin (role 0)
- **Business Association**: Each user associated with business data from `business_clients` table
- **Profile Management**: Users can update profile information and avatar

### UI/UX Behavior
- **Login Redirect**: Unauthenticated users redirect to login page
- **Post-Auth Redirect**: Successful login redirects to `/home` page
- **Loading States**: Show loading indicators during auth state changes
- **User Profile**: Header displays user email initial in circular avatar
- **Sign Out**: Dropdown menu with sign out option
- **Business Switcher**: Super Admins can switch between businesses (dropdown in header)

### Authentication Flow
1. User lands on login page (`/` route)
2. Users can sign in regardless of email confirmation status
3. After successful authentication, redirect to `/home`
4. Protected pages use `ProtectedLayout` wrapper
5. `AuthContext` manages global auth state
6. Business data loaded automatically after authentication

### SQL Queries
```sql
-- Fetch user profile
SELECT * FROM profiles WHERE id = $userId;

-- Fetch business data for authenticated user
SELECT * FROM business_clients WHERE business_id = $businessId;

-- Super Admin: Fetch all businesses with avatars
SELECT * FROM business_clients WHERE avatar_url IS NOT NULL;
```

### Edge Cases
- **Failed Authentication**: Show error message, remain on login page
- **Session Expiry**: Automatic logout and redirect to login
- **Missing Business Data**: Show loading state until business data loads
- **Super Admin**: Show business switcher if multiple businesses available

---

## Universal Header

### Functional Requirements
- **Company Logo**: Display business logo from `business_clients.avatar_url`
- **Navigation Menu**: Links to all main sections with active state highlighting
- **User Profile**: Show authenticated user info with dropdown menu
- **Business Switcher**: For Super Admins with multiple businesses
- **Settings Access**: Settings link in user dropdown

### UI/UX Behavior
- **Static Display**: Header remains completely static during navigation (no logo flickering)
- **Logo Loading**: Business logo loads directly without loading states or placeholders
- **Fixed Height**: Logo maintains `h-12` height for consistency
- **Responsive**: Navigation collapses on mobile (hidden md:flex)
- **Hover States**: Interactive elements have hover effects
- **Active State**: Current page highlighted in navigation

### Navigation Links (in order)
1. **Dashboard** - Overview and key metrics
2. **New Leads** - Lead management with metrics and appointment setters  
3. **Salesman** - Revenue metrics and performance analytics
4. **Incoming Calls** - Call analytics and visualizations
5. **FB Analysis** - Facebook advertising analysis (placeholder)

### Business Switcher (Super Admin Only)
- **Trigger**: Shows when user has role 0 and multiple businesses available
- **Display**: Dropdown with business names and avatars
- **Functionality**: Switch active business context
- **Visual**: Current business highlighted

### Edge Cases
- **Page Refresh**: Entire header waits for logo before showing (no partial rendering)
- **Missing Logo**: Show loading placeholder until business data available
- **Long Company Names**: Truncate if necessary
- **Single Business**: No switcher shown even for Super Admin

---

## Home Page

### Functional Requirements
- **Welcome Interface**: Clean landing page after authentication
- **Property Showcase**: Hero section with property imagery
- **Navigation**: Clear path to main application sections

### UI/UX Behavior
- **Hero Layout**: Split layout with content left, image right
- **Professional Design**: Clean, modern real estate focused design
- **Call to Action**: Engaging copy and imagery
- **Responsive**: Adapts to all screen sizes

### Content Elements
- **Headline**: Property management focused messaging
- **Description**: Value proposition for lead management
- **Property Image**: High-quality house imagery
- **Navigation**: Easy access to main application features

---

## Dashboard

### Functional Requirements
- **Under Construction**: Currently shows placeholder content
- **Future State**: Will display key metrics and overview charts
- **Protected Access**: Requires authentication

### UI/UX Behavior
- **Centered Layout**: Simple centered message indicating development status
- **Protected Route**: Uses ProtectedLayout wrapper
- **Navigation**: Accessible from header navigation

---

## New Leads

### Functional Requirements
- **Lead Metrics Display**: Show total leads, contacted leads, booked leads, contact rate, booking rate
- **Appointment Setters Carousel**: Display appointment setter performance with vertical navigation
- **Recent Leads Table**: Display leads with clickable rows for navigation
- **Time Period Filter**: 30, 60, or 90 days selection
- **Lead Navigation**: Click on lead to open Lead Details view

### UI/UX Behavior
- **Grid Layout**: 2x2 grid with LeadsTable spanning full width at bottom
- **Loading States**: Show loading indicators while fetching data
- **Metrics Cards**: Display key performance indicators in card format
- **Interactive Table**: Hover effects on table rows, click to navigate
- **Date Filter**: Dropdown selector in top-right corner

### Layout Structure
- **Top Left**: `LeadMetrics` component
- **Top Right**: `AppointmentSetters` component  
- **Bottom**: `LeadsTable` component (full width)

### SQL Queries
```sql
-- Main leads query with time filter
SELECT l.*, c.full_address, c.house_value, c.house_url, c.distance_meters, c.duration_seconds
FROM leads l
LEFT JOIN clients c ON l.account_id = c.account_id
WHERE l.created_at >= $startDateISO 
AND l.business_id = $businessId
ORDER BY l.created_at DESC;

-- Calculate metrics from leads data
-- Total leads: COUNT(*)
-- Contacted leads: COUNT WHERE contacted = true
-- Booked leads: COUNT WHERE start_time IS NOT NULL
-- Contact rate: (contacted/total) * 100
-- Booking rate: (booked/contacted) * 100
```

### Recent Leads Table Columns
1. **Lead Name**: Color-coded score circle + formatted name (`first_name + last_name`)
2. **How Soon**: Urgency indicator with color coding (red/orange/blue/gray)
3. **Service**: Service type needed
4. **Date**: Created date formatted in business timezone (from business_clients.time_zone)
5. **Notes**: Lead notes/comments (moved from Score column)
6. **Status**: Current lead status badge

### Appointment Setters Component
- **Type**: Vertical carousel (single item display)
- **Navigation**: Up/down arrows with pagination counter ("1/3") 
- **Sorting**: Performance-based (booked appointments descending)
- **Structure**: Mirrors LeadMetrics layout exactly for visual symmetry
- **Fixed Height**: Uses `h-full` class to maintain layout balance
- **Data Source**: `leads_calls` table joined with `leads` table for business filtering
- **Statistics**: Leads, contacted, booked, contact rate, booking rate, average response time, total call time per setter
- **Metrics Calculated**:
  - Total unique leads called per setter (from `leads_calls.lead_id`)
  - Contacted/booked counts (from `leads` table status fields)
  - Contact and booking rates (calculated percentages)
  - Average response time (from `leads_calls.time_speed` in seconds)
  - Total call time (from `leads_calls.duration`, only for `working_hours = true` leads)

### Data Transformations
- **Name Formatting**: `first_name + " " + last_name` or `first_name` only if last_name missing
- **Urgency Colors**: Red (ASAP/urgent), Orange (week), Blue (month), Gray (default)
- **Score Colors**: Red (0-33%), Yellow (34-66%), Green (67-100%) - displayed in circular avatar
- **Score Display**: Score shown in color-coded circle next to name instead of separate column
- **Status Display**: Standardized status badges

### Edge Cases
- **No Data**: Show "No leads found" message
- **Loading**: Show loading spinners in each component
- **Missing Fields**: Handle null values gracefully (show "N/A" or "Unknown")
- **Empty Setters**: Show message when no appointment setters available

---

## Lead Details

### Functional Requirements
- **Lead Information Display**: Complete lead profile with score component
- **Property Information**: Display property details and image with location data
- **Communications History**: Show all communications with audio playback
- **Chat Interface**: Send new messages (UI only)
- **Navigation**: Back button to return to New Leads

### UI/UX Behavior
- **Two-Column Layout**: Lead info left + Property image/score right on top row
- **Score Display**: Right column below property image with color-coded backgrounds
- **Communications Table**: Expandable table with audio controls
- **Back Navigation**: Arrow button to return to New Leads page
- **Responsive**: Adapts layout for mobile screens

### Lead Information Fields (Left Column)
- **Basic Info**: Name, email with validation icon (✓/✗), phone
- **Location Data**: Distance and duration below phone number
- **Address**: Property address without label, with Google Maps link
- **Service Details**: Service needed, urgency ("How Soon")
- **Lead Metadata**: setter_name, roof_age, payment_type, source (Assigned section removed)
- **Appointment**: Scheduled appointment time display

### Property Information (Right Column)
- **Property Image**: Display from `house_url` or fallback to `/images/noIMAGE.png` at top
- **Lead Score**: Color-coded percentage score below image (Red: 0-33%, Yellow: 34-66%, Green: 67-100%)
- **Score Summary**: Detailed explanation text below score percentage
- **Address Handling**: Uses `property_address` (from `clients.full_address`) with fallback to constructed address from individual components

### SQL Queries
```sql
-- Main lead query with property data
SELECT l.*, c.house_value, c.distance_meters, c.house_url, c.full_address, c.duration_seconds
FROM leads l
LEFT JOIN clients c ON l.account_id = c.account_id
WHERE l.lead_id = $leadId;

-- Communications for this lead
SELECT * FROM communications 
WHERE account_id = $accountId 
ORDER BY created_at ASC;
```

### Edge Cases
- **Missing Property Data**: Show fallback values ("N/A", default image)
- **No Communications**: Show "No communications recorded" message
- **Invalid Lead ID**: Show "Lead not found" with back button
- **Missing Score**: Handle null/undefined scores gracefully

---

## Communications

### Functional Requirements
- **Communications Display**: Chronological list of all communications
- **Audio Playback**: Play recording files with progress bars and seek functionality
- **Message Type Indicators**: Color-coded badges for different communication types
- **Time Display**: Formatted timestamps
- **Progress Control**: Visual progress bars with click-to-seek

### UI/UX Behavior
- **No Internal Scroll**: Table expands vertically based on content
- **Audio Controls**: Play/pause buttons with seek functionality
- **Progress Visualization**: Current time display and total duration
- **Type Badges**: Color-coded badges for message types
- **Hover Effects**: Row highlighting on hover

### Table Columns
1. **Type**: Message type with color-coded badge
2. **Summary**: Communication summary or content
3. **Created**: Date/time formatted in business timezone (from business_clients.time_zone)
4. **Audio**: Play/pause controls with progress bar and seek functionality

### Message Type Colors
- **Email**: Blue (`bg-blue-50 text-blue-600 border-blue-200`)
- **SMS/Text**: Green (`bg-green-50 text-green-600 border-green-200`)  
- **Call/Phone**: Purple (`bg-purple-50 text-purple-600 border-purple-200`)
- **Voicemail**: Orange (`bg-orange-50 text-orange-600 border-orange-200`)
- **Default**: Gray (`bg-gray-50 text-gray-600 border-gray-200`)

### Audio Functionality
- **Progress Bars**: Visual representation of playback progress
- **Seek Control**: Click on progress bar to jump to specific time
- **Time Display**: Current time / total duration
- **Multiple Audio**: Individual state management per communication
- **Error Handling**: Graceful handling of missing/failed audio files

### Edge Cases
- **No Communications**: Show placeholder message
- **Missing Audio**: Disable play button, show grayed out icon
- **Audio Playback Errors**: Handle failed audio loading gracefully
- **Long Summaries**: Wrap text appropriately

---

## Incoming Calls

### Functional Requirements
- **Call Analytics Dashboard**: Visual charts and data analysis
- **Source Distribution Chart**: Pie chart showing call sources
- **Caller Type Distribution Chart**: Pie chart showing caller types
- **Sankey Flow Diagram**: Flow from sources to caller types
- **Recent Calls Table**: List of recent incoming calls
- **Time Period Filter**: 30, 60, or 90 days selection

### UI/UX Behavior
- **Dashboard Layout**: Charts arranged in responsive grid
- **Interactive Charts**: Hover effects and tooltips using Recharts
- **Data Table**: Clean table with call details
- **Filter Controls**: Time period dropdown in header

### Charts & Visualizations

#### Source Distribution Chart
- **Type**: Pie chart using Recharts
- **Data**: Call counts aggregated by source
- **Filtering**: Excludes null/empty/"Unknown" sources
- **Colors**: Custom color palette for segments

#### Caller Type Distribution Chart
- **Type**: Pie chart using Recharts  
- **Data**: Call counts aggregated by caller type
- **Filtering**: Excludes null/empty/"Unknown" caller types
- **Colors**: Custom color palette for segments

#### Sankey Flow Diagram
- **Type**: Flow diagram using D3 and d3-sankey
- **Data**: Relationships between sources and caller types
- **Filtering**: Excludes "Unknown" values from both dimensions
- **Interactive**: Hover effects and tooltips

### SQL Queries
```sql
-- Incoming calls data with time filtering
SELECT * FROM incoming_calls 
WHERE created_at >= $startDate 
ORDER BY created_at DESC;
```

### Data Processing
- **Source Aggregation**: Group by source, count occurrences
- **Caller Type Aggregation**: Group by caller_type, count occurrences
- **Sankey Data**: Create source-to-caller-type relationships
- **Filtering**: Remove null/empty/"Unknown" values
- **Percentage Calculations**: Calculate percentages for chart displays

### Edge Cases
- **No Data**: Show "No calls found" message in charts and table
- **Loading**: Show loading spinners while fetching data
- **Missing Fields**: Handle null sources/caller types gracefully
- **Chart Rendering**: Handle empty datasets without errors

---

## Salesman

### Functional Requirements
- **Revenue Metrics Display**: Comprehensive revenue and performance analytics
- **Time Period Filter**: 30, 60, or 90 days selection
- **Performance Tracking**: Revenue, conversion rates, sales team metrics
- **Date-based Filtering**: Dynamic data updates based on selected time period

### UI/UX Behavior
- **Metrics Dashboard**: Clean layout with key performance indicators
- **Interactive Filters**: Time period dropdown selector
- **Loading States**: Show loading indicators while fetching data
- **Card Layout**: Metrics displayed in organized card components

### Metrics Display
- **Revenue Tracking**: Total revenue and trends
- **Conversion Rates**: Lead to sale conversion percentages
- **Performance Analytics**: Team and individual performance metrics
- **Time Comparisons**: Period-over-period analysis

### Edge Cases
- **No Data**: Show appropriate empty state messages
- **Loading**: Loading indicators during data fetch
- **Missing Metrics**: Handle null/undefined values gracefully

---

## FB Analysis

### Functional Requirements
- **Under Construction**: Currently placeholder content
- **Future State**: Facebook advertising analysis and ROI metrics
- **Protected Access**: Requires authentication

### UI/UX Behavior
- **Placeholder Layout**: Simple centered message
- **Future Integration**: Will integrate with Facebook Marketing API
- **Navigation**: Accessible from header navigation

---

## Settings

### Functional Requirements
- **Two-Section Layout**: Settings and General sections in vertical menu
- **Profile Management**: Edit user profile information in Settings section
- **Avatar Upload**: Upload and manage profile pictures
- **Account Deletion**: Delete Profile functionality in General section
- **Form Validation**: Validate inputs before submission

### UI/UX Behavior
- **Vertical Menu**: Left sidebar with grouped sections (Settings, General)
- **Form Layout**: Clean form design with proper spacing
- **Image Upload**: Drag and drop or click to upload avatar
- **Validation**: Real-time form validation with error messages
- **Save States**: Loading indicators during save operations
- **Confirmation Flow**: Two-step confirmation for profile deletion

### Settings Section
- **Edit Profile Info**: Form for updating user information
- **Full Name**: Text input for display name
- **Email**: Email input (read-only from auth)
- **Avatar**: Image upload with preview
- **Telegram ID**: Read-only system field
- **GHL ID**: Read-only system field

### General Section
- **Delete Profile**: Account deletion with safety confirmation
- **Confirmation Required**: User must type "DELETE" to confirm
- **Immediate Cleanup**: Removes profile data and signs out user
- **Warning Display**: Clear warnings about data loss

### Delete Profile Flow
1. User clicks "Delete My Profile" button
2. Confirmation form appears requiring "DELETE" text input
3. User types "DELETE" and clicks "Permanently Delete Profile"
4. System removes user from profiles table
5. User is signed out and redirected to login page

### Edge Cases
- **Upload Errors**: Handle image upload failures gracefully
- **Validation Errors**: Show specific error messages
- **Save Failures**: Handle network errors during save operations
- **Delete Failures**: Show specific error messages with retry option
- **Incomplete Confirmation**: Disable delete button until "DELETE" is typed

---

## Loading System

### Functional Requirements
- **Animated Loading Screens**: Custom house roof repair themed animations
- **Multiple Component Types**: Full-screen overlay, page-level, and inline loaders
- **Performance Optimized**: Lightweight SVG animations with minimal performance impact
- **Business Branding**: Visual theme reflects roofing/construction business focus
- **Progressive Loading**: Staggered animation sequence with smooth transitions

### UI/UX Behavior
- **7-Phase Animation Sequence**: Construction worker, sliding shingles, completion effects
- **Modern Color Palette**: Purple/violet gradients (#6366f1 to #8b5cf6) with coral accents (#f87171)
- **Smooth Transitions**: Cubic-bezier easing for realistic construction motion
- **Responsive Sizing**: Three size variants (sm, md, lg) for different contexts
- **Atmospheric Effects**: Background particles, shimmer effects, and glow animations

### Component Architecture

#### LoadingScreen Component
- **Sizes**: `sm`, `md`, `lg` with proportional scaling
- **Customization**: Optional messages, visibility controls
- **Animation Phases**:
  1. Construction worker appears (500ms, bouncing animation)
  2. Top center shingle slides in with glow effect (1000ms)
  3. Second row shingles slide from left/right simultaneously (1400ms)
  4. Third row shingles with staggered timing (1800ms)
  5. Bottom row shingles complete the roof (2200ms)
  6. Success glow + sparkle effects around completed house (2600ms)
  7. Final shimmer effect sweeps across structure (3000ms, then resets at 3500ms)

#### LoadingOverlay Component
- **Full-Screen Coverage**: Fixed positioning with z-index management
- **Enhanced Background**: Gradient overlays, animated background shapes
- **Floating Elements**: Construction-themed particles, geometric accents
- **Blur Effects**: Optional backdrop blur for layering over existing content
- **Contextual Messaging**: Different messages for login, navigation, etc.

#### InlineLoader Component
- **Compact Design**: Simplified house icon for buttons and inline use
- **Three Sizes**: `xs`, `sm`, `md` for different inline contexts
- **Subtle Animation**: Pulse effects with sparkle accents
- **Integration Ready**: Easy to embed in buttons, forms, and components

### Implementation Coverage

#### Post-Authentication Flow
- **ProtectedLayout**: "Setting up your workspace..." during auth loading
- **Post-Login**: "Welcome back! Preparing your dashboard..." for smooth transition
- **Business Switching**: Loading state when switching between businesses

#### Page-Level Loading
- **New Leads**: "Loading lead metrics..." with full LoadingScreen
- **Salesman**: "Loading revenue metrics..." with full LoadingScreen  
- **Incoming Calls**: Custom loading fallbacks for chart components
- **Settings**: "Loading profile settings..." for form initialization

#### Component-Level Loading
- **Forms**: InlineLoader in save buttons during submission
- **Tables**: LoadingScreen fallbacks for data fetching
- **Charts**: Individual loading states for lazy-loaded components
- **Images**: Progressive loading with placeholder states

### Performance Specifications
- **Pure CSS Animations**: Hardware-accelerated transforms and opacity changes
- **SVG Graphics**: Vector-based for crisp scaling at all resolutions  
- **Minimal JavaScript**: State management limited to animation phase tracking
- **No Navigation Impact**: Loading animations don't block or slow page transitions
- **Memory Efficient**: Automatic cleanup with timeout management

### Visual Design Elements
- **Construction Theme**: House with damaged roof being progressively repaired
- **Worker Animation**: Bouncing construction worker with hard hat and tool
- **Sliding Shingles**: Realistic slide-in motion from left and right sides
- **Glow Effects**: Success highlighting with gradient borders
- **Shimmer Sweep**: Final light effect passing over completed structure
- **Background Trees**: Animated coral trees matching reference design
- **Floating Particles**: Construction dust and sparkle effects

### Error Handling
- **Component Failures**: Graceful fallbacks with retry functionality
- **Loading Timeouts**: Automatic recovery from stuck loading states
- **Error Boundaries**: Isolated error handling preventing cascade failures
- **Network Issues**: Timeout protection (15-30 seconds) with fallback content

### Accessibility & Standards
- **Screen Readers**: Proper ARIA labels for loading states
- **Reduced Motion**: Respects user motion preferences
- **Keyboard Navigation**: No interference with navigation during loading
- **Color Contrast**: Sufficient contrast ratios for all text and indicators
- **Focus Management**: Proper focus handling during loading transitions

---

## Database Schema

### Key Tables & Relationships

#### leads
- **Primary Key**: `lead_id`
- **Foreign Key**: `account_id` → `clients.account_id`
- **Key Fields**: 
  - `first_name`, `last_name` - Lead name
  - `email`, `phone` - Contact information
  - `service` - Service needed
  - `how_soon` - Urgency indicator
  - `score`, `status` - Lead quality and current status
  - `created_at` - Lead creation timestamp
  - `assigned`, `setter_name` - Assignment information
  - `roof_age`, `payment_type`, `email_valid`, `source` - Additional metadata
  - `business_id` - Business association

#### clients
- **Primary Key**: `account_id`
- **Related Data**: 
  - `full_address` - Property address
  - `house_value` - Property value
  - `house_url` - Property image URL
  - `distance_meters`, `duration_seconds` - Location data

#### communications
- **Primary Key**: `communication_id`
- **Foreign Key**: `account_id` → `clients.account_id`
- **Key Fields**:
  - `message_type` - Type of communication
  - `summary` - Communication content
  - `recording_url` - Audio recording URL
  - `created_at` - Communication timestamp

#### business_clients
- **Primary Key**: `business_id`
- **Key Fields**:
  - `company_name` - Business name
  - `avatar_url` - Business logo URL
  - `time_zone` - Business timezone for date/time display
  - `city`, `state` - Business location
  - Configuration and settings fields

#### profiles
- **Primary Key**: `id` (UUID from auth.users)
- **Key Fields**:
  - `email`, `full_name` - User information
  - `avatar_url` - User profile picture
  - `role` - User role (0 = Super Admin)
  - `business_id` - Associated business

#### incoming_calls
- **Primary Key**: `incoming_call_id`
- **Key Fields**:
  - `source` - Call source
  - `caller_type` - Type of caller
  - `created_at` - Call timestamp
  - `account_id` - Optional lead association

### Common Query Patterns
```sql
-- Lead with property data
SELECT l.*, c.full_address, c.house_value, c.house_url, c.distance_meters, c.duration_seconds
FROM leads l
LEFT JOIN clients c ON l.account_id = c.account_id
WHERE l.lead_id = ?;

-- Communications for lead
SELECT * FROM communications 
WHERE account_id = (SELECT account_id FROM leads WHERE lead_id = ?)
ORDER BY created_at ASC;

-- User profile with business
SELECT p.*, bc.company_name, bc.avatar_url
FROM profiles p
JOIN business_clients bc ON p.business_id = bc.business_id
WHERE p.id = ?;
```

---

## Error Handling & Edge Cases

### Authentication Errors
- **Failed Login**: Show error message, remain on login page
- **Session Expired**: Automatic logout, redirect to login
- **Network Issues**: Show connection error with retry option

### Data Loading States
- **Initial Load**: Show loading spinners/skeletons
- **Empty States**: "No data found" messages with appropriate context
- **Failed Requests**: Error messages with retry buttons
- **Partial Failures**: Handle partial data loads gracefully

### Form Validation
- **Required Fields**: Highlight missing required fields
- **Invalid Data**: Show specific validation error messages
- **Network Errors**: Handle failed submissions with retry options
- **File Uploads**: Validate file types and sizes

### Performance Considerations
- **Large Datasets**: Implement pagination where needed
- **Real-time Updates**: Optimize Supabase real-time subscriptions
- **Image Loading**: Lazy loading for property and profile images
- **Audio Files**: Progressive loading for communication recordings

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **JavaScript Required**: Graceful degradation for disabled JS
- **Mobile Responsive**: All layouts adapt to mobile screens
- **Touch Interfaces**: Proper touch targets and gestures

---

## Development Notes

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **State Management**: React Context API (AuthContext)
- **Charts**: Recharts (pie charts), D3 + d3-sankey (flow diagrams)
- **Audio**: HTML5 Audio API with custom controls
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom components
- **Loading System**: Custom animated loading screens with house roof repair theme

### Code Organization
- **Pages**: App Router structure in `/src/app/`
- **Components**: Reusable components in `/src/components/`
- **Hooks**: Custom hooks in `/src/hooks/`
- **Utils**: Utility functions in `/src/lib/`
- **Contexts**: React contexts in `/src/contexts/`
- **Types**: TypeScript interfaces and types
- **UI Components**: Reusable UI components in `/src/components/ui/`

### Quality Standards
- **TypeScript**: Strict typing throughout application
- **Component Structure**: Consistent component patterns
- **Error Boundaries**: Proper error handling
- **Loading States**: Consistent loading indicators
- **Accessibility**: WCAG compliance for interactive elements
- **Security**: Input validation, sanitization, XSS protection

### Performance Optimizations
- **Bundle Size**: Tree shaking and code splitting
- **Image Optimization**: Next.js Image component where appropriate
- **Database Queries**: Optimized queries with proper indexing
- **Caching**: Appropriate caching strategies
- **Real-time**: Efficient Supabase subscriptions

---

*This document serves as the definitive guide for development, testing, and feature validation. All implementations should align with these specifications.*