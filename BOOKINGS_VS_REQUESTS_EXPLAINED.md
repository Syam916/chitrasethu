# Bookings vs Requests - Complete Explanation

## Overview

In the ChitraSethu platform, there are two distinct concepts:
- **Requests**: Initial booking requests that are pending photographer approval
- **Bookings**: Confirmed, active, or completed photography sessions

This document explains how both work for photographers and customers.

---

## 📋 **REQUESTS** - Initial Booking Proposals

### What are Requests?

**Requests** are initial proposals from customers to photographers. They represent:
- A customer's desire to book a photographer for an event
- A pending proposal waiting for photographer's response
- The first step in the booking process

### Request Status Flow

```
pending → confirmed (when accepted) → becomes a Booking
         ↓
    cancelled (when declined)
```

**Status Values:**
- `pending`: Waiting for photographer's response
- `confirmed`: Photographer accepted → becomes a Booking
- `cancelled`: Photographer declined the request

---

## 📅 **BOOKINGS** - Confirmed Photography Sessions

### What are Bookings?

**Bookings** are confirmed photography sessions that have been accepted by the photographer. They represent:
- Active or scheduled photography work
- Confirmed commitments between customer and photographer
- Sessions that are in progress or completed

### Booking Status Flow

```
confirmed → in_progress → completed
     ↓
cancelled (rare, after confirmation)
```

**Status Values:**
- `confirmed`: Photographer accepted, event scheduled
- `in_progress`: Photography session is currently happening
- `completed`: Photography session finished
- `cancelled`: Booking was cancelled (rare after confirmation)

---

## 👤 **CUSTOMER PERSPECTIVE**

### Customer's "Requests" Page (`/requests`)

This page has **3 tabs**:

#### 1. **Browse Requests** Tab
- **Purpose**: View available photographers and their profiles
- **Action**: Create new booking requests
- **Note**: This is for discovering photographers, not managing requests

#### 2. **Post Request** Tab
- **Purpose**: Create a new booking request for a photographer
- **Fields Required**:
  - Select Photographer
  - Event Type (Wedding, Birthday, etc.)
  - Booking Date & Time
  - Duration
  - Location/Venue
  - Total Amount
  - Advance Amount (optional)
  - Special Requirements
- **What Happens**:
  - Creates a new request with status `pending`
  - Photographer receives notification
  - Customer can edit request while it's `pending`

#### 3. **My Requests** Tab
- **Purpose**: View and manage all requests created by the customer
- **Shows**:
  - All requests (pending, confirmed, cancelled)
  - Photographer name and details
  - Event details (date, location, budget)
  - Request status badge
- **Actions Available**:
  - **Edit Request**: Only for `pending` requests
  - **View Proposals**: (Future feature - when photographers send proposals)
- **Status Display**:
  - 🟠 **Pending**: Waiting for photographer response
  - 🟢 **Confirmed**: Photographer accepted → Now appears as a Booking
  - 🔴 **Cancelled**: Photographer declined

### Customer's Booking Flow

```
1. Customer creates Request (status: pending)
   ↓
2. Photographer sees request in their Requests page
   ↓
3. Photographer accepts → Request status: confirmed
   ↓
4. Customer receives email notification
   ↓
5. Request appears in "My Requests" with "Confirmed" status
   ↓
6. Request is now a Booking (visible to photographer in Bookings page)
```

---

## 📸 **PHOTOGRAPHER PERSPECTIVE**

### Photographer's "Requests" Page (`/photographer/requests`)

**Purpose**: Manage incoming booking requests from customers

#### What Photographers See:
- All booking requests sent to them
- Customer information (name, email, phone, avatar)
- Event details (type, date, time, location, duration)
- Budget range
- Special requirements
- Urgency indicator (high/medium/low based on date proximity)

#### Status Filters:
- **All Status**: Shows all requests
- **Pending**: Requests waiting for response
- **Confirmed**: Requests that were accepted (now Bookings)
- **Cancelled**: Requests that were declined

#### Actions Available:

**For Pending Requests:**
1. ✅ **Accept Request**
   - Changes status: `pending` → `confirmed`
   - Sends email to customer
   - Request becomes a Booking
   - Appears in Bookings page

2. ❌ **Decline Request**
   - Changes status: `pending` → `cancelled`
   - Sends email to customer
   - Request is closed

3. 💬 **Request More Info**
   - Sends message to customer asking for clarification
   - Request remains `pending`

**For Confirmed Requests:**
- Shows "Request Accepted - Booking Confirmed" badge
- "View Booking Details" button → Navigates to Bookings page

### Photographer's "Bookings" Page (`/photographer/bookings`)

**Purpose**: Manage confirmed, active, and completed photography sessions

#### What Photographers See:
- **Current Bookings**: Today's events or sessions in progress
- **Upcoming Bookings**: Future confirmed sessions
- **Past Bookings**: Completed sessions

#### Booking Information Displayed:
- Customer name, avatar, contact info
- Event type and details
- Date, time, location, duration
- Total amount and payment status
- Special requirements
- Days until event (for upcoming)
- Completion date (for past)

#### Actions Available:

**For Current Bookings:**
- Start Shoot
- View Details
- Contact Customer

**For Upcoming Bookings:**
- Prepare
- View Details
- Contact Customer
- Reschedule (future)

**For Past Bookings:**
- View Gallery
- Request Review

### Photographer's Booking Flow

```
1. Customer creates Request → Photographer sees in Requests page
   ↓
2. Photographer reviews request details
   ↓
3. Photographer accepts → Request status: confirmed
   ↓
4. Request becomes a Booking
   ↓
5. Booking appears in Bookings page (Upcoming tab)
   ↓
6. On event day → Status can change to in_progress
   ↓
7. After event → Status changes to completed
```

---

## 🔄 **KEY DIFFERENCES**

### Requests vs Bookings

| Aspect | Requests | Bookings |
|--------|----------|----------|
| **Status** | `pending`, `confirmed`, `cancelled` | `confirmed`, `in_progress`, `completed`, `cancelled` |
| **Who Creates** | Customer | System (auto-created when request accepted) |
| **Visibility** | Both parties see | Both parties see |
| **Editable** | Yes (while pending) | No (locked after confirmation) |
| **Purpose** | Initial proposal | Active/completed session |
| **Location** | Requests page | Bookings page |
| **Payment** | Not yet processed | Can track payment status |

### Status Transition

```
REQUEST (pending)
    ↓ [Photographer Accepts]
BOOKING (confirmed)
    ↓ [Event Day Arrives]
BOOKING (in_progress)
    ↓ [Event Completes]
BOOKING (completed)
```

---

## 📊 **DATABASE STRUCTURE**

### Requests and Bookings Use the Same Table

Both requests and bookings are stored in the `bookings` table, differentiated by status:

```sql
CREATE TYPE booking_status_enum AS ENUM (
  'pending',      -- Request waiting for response
  'confirmed',    -- Request accepted → Now a Booking
  'in_progress',  -- Booking: Session happening now
  'completed',    -- Booking: Session finished
  'cancelled',    -- Request declined or Booking cancelled
  'refunded'      -- Booking: Payment refunded
);
```

**Key Fields:**
- `status`: Determines if it's a Request or Booking
- `confirmed_at`: Timestamp when photographer accepted
- `completed_at`: Timestamp when session finished
- `cancelled_at`: Timestamp when declined/cancelled

---

## 🎯 **USE CASES**

### Scenario 1: Customer Wants to Book a Photographer

1. **Customer** goes to `/requests` → "Post Request" tab
2. Fills out form with event details
3. Submits → Creates Request (status: `pending`)
4. **Photographer** sees request in `/photographer/requests`
5. **Photographer** reviews and accepts
6. Request status → `confirmed`
7. **Customer** sees "Confirmed" in "My Requests"
8. **Photographer** sees booking in `/photographer/bookings` (Upcoming)

### Scenario 2: Photographer Manages Their Schedule

1. **Photographer** opens `/photographer/bookings`
2. Views "Upcoming" tab → Sees all confirmed future sessions
3. Sees "Current" tab → Today's events
4. Sees "Past" tab → Completed sessions
5. Can contact customers, prepare for events, track payments

### Scenario 3: Customer Tracks Their Bookings

1. **Customer** opens `/requests` → "My Requests" tab
2. Sees all their requests:
   - Pending: Waiting for response
   - Confirmed: Accepted by photographer
   - Cancelled: Declined by photographer
3. Can edit pending requests
4. Cannot edit confirmed requests (locked)

---

## 🔍 **WHERE TO FIND WHAT**

### For Customers:

| What You Want | Where to Go |
|--------------|-------------|
| Create new booking request | `/requests` → "Post Request" tab |
| View your requests | `/requests` → "My Requests" tab |
| Edit a pending request | `/requests` → "My Requests" → Click "Edit Request" |
| See confirmed bookings | `/requests` → "My Requests" → Filter by "Confirmed" |

### For Photographers:

| What You Want | Where to Go |
|--------------|-------------|
| View incoming requests | `/photographer/requests` |
| Accept/decline requests | `/photographer/requests` → Click buttons on request card |
| View confirmed bookings | `/photographer/bookings` → "Upcoming" tab |
| View today's bookings | `/photographer/bookings` → "Current" tab |
| View past bookings | `/photographer/bookings` → "Past" tab |
| Manage active sessions | `/photographer/bookings` → "Current" tab |

---

## 📧 **EMAIL NOTIFICATIONS**

### When Requests Change Status:

1. **Customer Creates Request**:
   - No email (request is pending)

2. **Photographer Accepts Request**:
   - ✅ Customer receives: "🎉 Your Booking Request Has Been Accepted!"
   - Includes event details and photographer name

3. **Photographer Declines Request**:
   - ❌ Customer receives: "Booking Request Declined"
   - Includes reason (if provided)

### When Bookings Change Status:

- Status changes are tracked but email notifications for `in_progress` and `completed` are future enhancements

---

## 🎨 **UI INDICATORS**

### Status Badges:

**Requests:**
- 🟠 **Pending**: Orange badge - "Pending"
- 🟢 **Confirmed**: Green badge - "Confirmed"
- 🔴 **Cancelled**: Red badge - "Cancelled"

**Bookings:**
- 🟢 **Confirmed**: Green badge - "Confirmed"
- 🔵 **In Progress**: Blue badge - "In Progress"
- 🟣 **Completed**: Purple badge - "Completed"
- 🔴 **Cancelled**: Red badge - "Cancelled"

### Payment Status Badges:

- 🟢 **Paid**: Green - Full payment received
- 🟡 **Partial**: Yellow - Partial payment received
- 🔴 **Unpaid**: Red - No payment received

---

## 🔐 **PERMISSIONS & RULES**

### Who Can Do What:

**Customers:**
- ✅ Create requests
- ✅ Edit their own pending requests
- ❌ Cannot edit confirmed requests
- ✅ View all their requests
- ✅ Cancel pending requests (future feature)

**Photographers:**
- ✅ View all requests sent to them
- ✅ Accept/decline requests
- ✅ Request more info from customers
- ✅ View all their bookings
- ✅ Update booking status (in_progress, completed) - future feature
- ❌ Cannot edit booking details after confirmation

---

## 📝 **SUMMARY**

### Requests:
- **What**: Initial proposals from customers
- **Status**: `pending` → `confirmed` or `cancelled`
- **Location**: Requests page
- **Editable**: Yes (while pending)
- **Purpose**: Get photographer approval

### Bookings:
- **What**: Confirmed photography sessions
- **Status**: `confirmed` → `in_progress` → `completed`
- **Location**: Bookings page
- **Editable**: No (locked after confirmation)
- **Purpose**: Manage active/completed work

### The Connection:
- **Request accepted** = **Booking created**
- Same database record, different status
- Request is the "proposal", Booking is the "commitment"

---

## 🚀 **FUTURE ENHANCEMENTS**

1. **Proposals**: Photographers can send custom proposals to customers
2. **Rescheduling**: Ability to reschedule confirmed bookings
3. **Cancellation**: Customers can cancel confirmed bookings (with penalties)
4. **Status Updates**: Automatic status changes based on event dates
5. **Payment Integration**: Track and process payments within bookings
6. **Reviews**: Customers can review photographers after completed bookings
7. **Calendar Integration**: Sync bookings with calendar apps
8. **Reminders**: Automated reminders before events

---

This system ensures clear communication between customers and photographers, with a smooth transition from initial request to confirmed booking to completed session.
