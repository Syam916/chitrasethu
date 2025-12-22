# Booking Acceptance Flow - Complete Guide

## What Happens When a Photographer Accepts a Booking Request

### Step-by-Step Process

#### 1. **Photographer Clicks "Accept Request"**
- Location: `/photographer/requests` page
- Action: Photographer clicks green "Accept Request" button on a pending booking request

#### 2. **Backend Processing**
- **API Call**: `PUT /api/photographer/requests/:id/accept`
- **Authentication**: Verifies photographer owns the request
- **Validation**: Checks if request status is 'pending'

#### 3. **Database Updates**
```sql
UPDATE bookings 
SET status = 'confirmed',
    confirmed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE booking_id = $1
```

**Changes:**
- ✅ Status: `'pending'` → `'confirmed'`
- ✅ `confirmed_at`: Set to current timestamp
- ✅ `updated_at`: Updated to current timestamp
- ✅ Booking remains in `bookings` table with new status

#### 4. **Email Notification**
- **Recipient**: Customer (who created the request)
- **Email Service**: `sendBookingAcceptedEmail()`
- **Subject**: "🎉 Your Booking Request Has Been Accepted!"
- **Content**: 
  - Congratulations message
  - Event details (type, date, time, location)
  - Photographer name
  - Next steps information

#### 5. **Frontend Updates**
- **Photographer's Requests Page**:
  - Request card shows green "Request Accepted - Booking Confirmed" badge
  - "View Booking Details" button appears
  - Request disappears from "pending" filter (if filtered)
  - Request appears in "confirmed" filter

- **Customer's My Requests Page**:
  - Request status changes to "Confirmed" (green badge)
  - Shows photographer name
  - "View Booking Details" button available
  - Can no longer edit the request

---

## What Happens Next - Booking Lifecycle

### Status Flow
```
pending → confirmed → in_progress → completed
                ↓
           cancelled (if declined)
```

### Current Status: `confirmed`

**What it means:**
- ✅ Booking is officially confirmed
- ✅ Photographer has committed to the event
- ✅ Customer has been notified
- ⏳ Waiting for event date to arrive

**What can happen:**
1. **Event Date Arrives** → Status can change to `'in_progress'`
2. **Event Completes** → Status changes to `'completed'`
3. **Cancellation** → Status changes to `'cancelled'` (rare after confirmation)

---

## Where Confirmed Bookings Appear

### For Photographer:

#### 1. **Requests Page** (`/photographer/requests`)
- Shows in "All Status" or "Accepted" filter
- Displays green "Confirmed" badge
- "View Booking Details" button → Navigates to `/photographer/bookings?bookingId=X`

#### 2. **Bookings Page** (`/photographer/bookings`) - *Currently using dummy data*
- Should appear in "Upcoming Bookings" tab
- Should show:
  - Customer name and contact
  - Event details (date, time, location)
  - Payment status
  - Preparation checklist
  - Action buttons (Prepare, Contact Customer, etc.)

**Note**: The Bookings page currently uses dummy data. To show real confirmed bookings, you need to:
- Add backend endpoint: `GET /api/photographer/bookings`
- Connect frontend to fetch real bookings
- Filter by status: `confirmed`, `in_progress`, `completed`

### For Customer:

#### 1. **My Requests Page** (`/requests` → "My Requests" tab)
- Shows booking with "Confirmed" status (green badge)
- Displays photographer name
- Shows event date, location, budget
- "View Booking Details" button (when implemented)
- Cannot edit confirmed bookings

---

## Database Fields After Acceptance

### Updated Fields:
```sql
status: 'confirmed'
confirmed_at: '2024-02-15 10:30:00' (timestamp)
updated_at: '2024-02-15 10:30:00' (timestamp)
```

### Unchanged Fields:
- `customer_id`: Original customer
- `photographer_id`: Original photographer
- `booking_date`: Event date
- `booking_time`: Event time
- `total_amount`: Agreed price
- `payment_status`: Still 'unpaid' or 'partial' (payment happens separately)
- All other booking details remain the same

---

## Email Notification Details

### Customer Receives:
- **Subject**: "🎉 Your Booking Request Has Been Accepted!"
- **Content**:
  - Personalized greeting
  - Event type confirmation
  - Event date and time
  - Location details
  - Photographer name
  - Next steps message

### Email Template Structure:
```html
🎉 Booking Confirmed!

Dear [Customer Name],

Great news! Your booking request has been accepted by [Photographer Name].

Event Details:
- Event Type: [Wedding/Portrait/etc.]
- Date: [March 15, 2024]
- Time: [10:00 AM]
- Location: [Venue Name]

Your photographer will be in touch with you soon...
```

---

## Next Steps After Acceptance

### For Photographer:
1. **View in Bookings Page**: Should see booking in "Upcoming" tab
2. **Prepare for Event**: 
   - Review customer requirements
   - Plan equipment needed
   - Contact customer if needed
3. **On Event Day**: 
   - Status can change to `'in_progress'`
   - Complete the photography session
4. **After Event**: 
   - Status changes to `'completed'`
   - Deliver photos
   - Request review from customer

### For Customer:
1. **Receive Confirmation Email**: Automatic notification
2. **View in My Requests**: See confirmed status
3. **Wait for Event**: Booking is locked in
4. **Contact Photographer**: Can message photographer if needed
5. **On Event Day**: Attend the photography session
6. **After Event**: Receive photos, leave review

---

## Current Implementation Status

### ✅ Implemented:
- ✅ Accept booking functionality
- ✅ Status update to 'confirmed'
- ✅ Email notification to customer
- ✅ Display in Requests page (photographer)
- ✅ Display in My Requests page (customer)
- ✅ "View Booking Details" button navigation

### ⚠️ Partially Implemented:
- ⚠️ Bookings page uses dummy data (needs real API connection)
- ⚠️ Status progression (in_progress, completed) not yet implemented
- ⚠️ Payment tracking separate from booking status

### 🔄 Future Enhancements:
- 🔄 Automatic status change on event date
- 🔄 Payment integration
- 🔄 Photo delivery tracking
- 🔄 Review system after completion
- 🔄 Calendar integration
- 🔄 Reminder notifications

---

## Technical Details

### Backend Endpoint:
```
PUT /api/photographer/requests/:id/accept
```

### Response:
```json
{
  "status": "success",
  "message": "Booking request accepted successfully",
  "data": {
    "bookingId": 123,
    "status": "confirmed"
  }
}
```

### Database Query:
```sql
UPDATE bookings 
SET status = 'confirmed', 
    confirmed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE booking_id = $1
```

### Email Service Call:
```javascript
sendBookingAcceptedEmail({
  customerEmail: 'customer@email.com',
  customerName: 'Customer Name',
  eventType: 'Wedding',
  eventDate: '2024-03-15',
  eventTime: '10:00 AM',
  location: 'Venue Name',
  photographerName: 'Photographer Name'
})
```

---

## Summary

**When a photographer accepts a booking:**

1. ✅ **Database**: Status changes to 'confirmed', timestamp recorded
2. ✅ **Email**: Customer receives acceptance notification
3. ✅ **UI Updates**: 
   - Photographer sees "Confirmed" badge in Requests page
   - Customer sees "Confirmed" status in My Requests
4. ✅ **Navigation**: "View Booking Details" button available
5. ⏳ **Next**: Booking appears in Bookings page (when connected to real data)
6. ⏳ **Future**: Status progresses through in_progress → completed

The booking is now **confirmed** and both parties are committed to the event!

