# Requests Page Guide

## 📋 Overview

The **Requests Page** (`/photographer/requests`) is a dashboard for photographers to manage customer booking requests. It provides a comprehensive interface for viewing, filtering, and responding to booking requests from customers.

---

## 🎯 What is the Requests Page?

The Requests Page is a management interface where photographers can:

- **View** all incoming booking requests from customers
- **Filter** requests by status (Pending, Accepted, Declined) and urgency (High, Medium, Low)
- **Accept** or **Decline** booking requests
- **Request More Info** from customers
- **Contact** customers directly (phone, email, message)
- **Track** request statistics (total requests, pending count)

### Key Features

1. **Request Cards Display**
   - Customer information (name, avatar, contact details)
   - Event details (type, date, time, location, duration)
   - Budget range and requirements
   - Status and urgency indicators
   - Action buttons (Accept, Decline, Request More Info)

2. **Filtering System**
   - Filter by status: All, Pending, Accepted, Declined
   - Filter by urgency: All, High, Medium, Low Priority

3. **Status Management**
   - Visual status badges (color-coded)
   - Real-time status updates
   - Confirmation messages for accepted/declined requests

---

## 📁 File Structure

```
frontend/src/
├── components/
│   └── photographer/
│       └── PhotographerRequestsPage.tsx    # Main requests page component
├── pages/
│   └── photographer/
│       └── Requests.tsx                    # Route wrapper
└── data/
    └── photographerDummyData.ts            # Mock data for requests
```

**Location**: `frontend/src/components/photographer/PhotographerRequestsPage.tsx`

**Route**: `/photographer/requests`

---

## 🔧 How It Works

### Component Structure

```typescript
PhotographerRequestsPage
├── PhotographerNavbar          # Navigation bar
├── Hero Section                 # Page title and filters
├── Request Statistics           # Total requests, pending count
└── Requests List                # Cards for each request
    ├── Customer Info            # Avatar, name, contact buttons
    ├── Request Details         # Event type, date, location, budget
    ├── Status Badges           # Urgency and status indicators
    └── Action Buttons          # Accept, Decline, Request More Info
```

### Data Flow

1. **Load Requests**: Component loads booking requests (currently from dummy data)
2. **Filter Requests**: User applies filters (status, urgency)
3. **Display Requests**: Filtered requests are shown in card format
4. **User Actions**: Photographer accepts/declines requests
5. **Update Status**: Request status updates in UI (and should update backend)

### Current Implementation

```typescript
// State Management
const [requests, setRequests] = useState(photographerBookingRequests);
const [filterStatus, setFilterStatus] = useState('all');
const [filterUrgency, setFilterUrgency] = useState('all');

// Filter Logic
const filteredRequests = requests.filter(req => {
  const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
  const matchesUrgency = filterUrgency === 'all' || req.urgency === filterUrgency;
  return matchesStatus && matchesUrgency;
});

// Action Handlers
const handleAcceptRequest = (requestId: number) => {
  setRequests(prev => prev.map(req => 
    req.requestId === requestId ? { ...req, status: 'accepted' } : req
  ));
  // TODO: API call to accept request
};

const handleDeclineRequest = (requestId: number) => {
  setRequests(prev => prev.map(req => 
    req.requestId === requestId ? { ...req, status: 'declined' } : req
  ));
  // TODO: API call to decline request
};
```

---

## 💡 How to Use in Your Project

### 1. **For Job Applications Management**

You can adapt this pattern for managing job applications in your Analysis tab:

#### Similarities

| Requests Page | Job Applications |
|--------------|------------------|
| Booking requests from customers | Job applications from applicants |
| Accept/Decline buttons | Accept/Reject buttons |
| Status: Pending/Accepted/Declined | Status: Pending/Accepted/Rejected |
| Filter by status | Filter by application status |
| Customer contact info | Applicant contact info |
| Event details | Job details + application info |

#### Implementation Example

```typescript
// In your Analysis tab, you can use similar structure:

{analysis.recentApplications.map((app) => (
  <Card key={app.applicationId}>
    {/* Applicant Info (similar to Customer Info) */}
    <Avatar>
      <AvatarImage src={app.applicantAvatar} />
      <AvatarFallback>{app.applicantName[0]}</AvatarFallback>
    </Avatar>
    
    {/* Application Details (similar to Request Details) */}
    <div>
      <h3>{app.applicantName}</h3>
      <p>{app.jobTitle}</p>
      <Badge>{app.status}</Badge>
    </div>
    
    {/* Action Buttons (similar to Accept/Decline) */}
    {app.status === 'pending' && (
      <div>
        <Button onClick={() => handleAccept(app.applicationId)}>
          Accept
        </Button>
        <Button onClick={() => handleReject(app.applicationId)}>
          Reject
        </Button>
      </div>
    )}
  </Card>
))}
```

### 2. **For Backend Integration**

Currently, the Requests page uses dummy data. To connect it to your backend:

#### Step 1: Create API Service

```typescript
// frontend/src/services/booking.service.ts
class BookingService {
  async getRequests(filters?: {
    status?: string;
    urgency?: string;
  }): Promise<BookingRequest[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.urgency) params.append('urgency', filters.urgency);
    
    const response = await fetch(`${API_BASE_URL}/photographer/requests?${params}`);
    return response.json();
  }
  
  async acceptRequest(requestId: number): Promise<void> {
    await fetch(`${API_BASE_URL}/photographer/requests/${requestId}/accept`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
  }
  
  async declineRequest(requestId: number, reason?: string): Promise<void> {
    await fetch(`${API_BASE_URL}/photographer/requests/${requestId}/decline`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
      body: JSON.stringify({ reason })
    });
  }
}
```

#### Step 2: Update Component

```typescript
// Replace dummy data with API calls
useEffect(() => {
  const fetchRequests = async () => {
    const data = await bookingService.getRequests({
      status: filterStatus !== 'all' ? filterStatus : undefined,
      urgency: filterUrgency !== 'all' ? filterUrgency : undefined
    });
    setRequests(data);
  };
  fetchRequests();
}, [filterStatus, filterUrgency]);

// Update handlers
const handleAcceptRequest = async (requestId: number) => {
  await bookingService.acceptRequest(requestId);
  // Refresh requests
  const updated = await bookingService.getRequests();
  setRequests(updated);
};
```

### 3. **Reusable Component Pattern**

You can create a reusable component for managing items with accept/reject functionality:

```typescript
// components/shared/ItemManagementCard.tsx
interface ItemManagementCardProps<T> {
  item: T;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  getStatus: (item: T) => string;
  getTitle: (item: T) => string;
  getDetails: (item: T) => React.ReactNode;
}

export const ItemManagementCard = <T,>({
  item,
  onAccept,
  onReject,
  getStatus,
  getTitle,
  getDetails
}: ItemManagementCardProps<T>) => {
  const status = getStatus(item);
  
  return (
    <Card>
      <CardContent>
        <h3>{getTitle(item)}</h3>
        <Badge>{status}</Badge>
        {getDetails(item)}
        {status === 'pending' && (
          <div>
            <Button onClick={() => onAccept(item.id)}>Accept</Button>
            <Button onClick={() => onReject(item.id)}>Reject</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

Then use it for both requests and applications:

```typescript
// For Booking Requests
<ItemManagementCard
  item={request}
  onAccept={handleAcceptRequest}
  onReject={handleDeclineRequest}
  getStatus={(r) => r.status}
  getTitle={(r) => r.eventType}
  getDetails={(r) => <RequestDetails request={r} />}
/>

// For Job Applications
<ItemManagementCard
  item={application}
  onAccept={handleAcceptApplication}
  onReject={handleRejectApplication}
  getStatus={(a) => a.status}
  getTitle={(a) => a.applicantName}
  getDetails={(a) => <ApplicationDetails application={a} />}
/>
```

---

## 🎨 UI Components Used

The Requests page uses these UI components:

- **Card** - Container for each request
- **Badge** - Status and urgency indicators
- **Button** - Action buttons (Accept, Decline, etc.)
- **Avatar** - Customer profile picture
- **Select** - Filter dropdowns
- **Icons** - Lucide React icons (Calendar, MapPin, Clock, etc.)

---

## 📊 Data Structure

### Request Object

```typescript
interface BookingRequest {
  requestId: number;
  customerName: string;
  customerAvatar?: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  duration: number; // hours
  guestCount: number;
  budgetRange: string;
  requirements: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: string;
}
```

---

## 🔄 Integration with Backend

### Required API Endpoints

```typescript
// Get all requests for photographer
GET /api/photographer/requests
Query params: ?status=pending&urgency=high

// Accept a request
PUT /api/photographer/requests/:id/accept

// Decline a request
PUT /api/photographer/requests/:id/decline
Body: { reason?: string }

// Request more info (opens message thread)
POST /api/photographer/requests/:id/request-info
Body: { message: string }
```

### Backend Controller Example

```javascript
// backend/src/controllers/booking.controller.js
export const getPhotographerRequests = async (req, res) => {
  const photographerId = req.user.photographerId;
  const { status, urgency } = req.query;
  
  // Query database for requests
  const requests = await query(`
    SELECT * FROM booking_requests 
    WHERE photographer_id = $1 
    AND (status = $2 OR $2 IS NULL)
    AND (urgency = $3 OR $3 IS NULL)
  `, [photographerId, status || null, urgency || null]);
  
  res.json({ requests });
};

export const acceptRequest = async (req, res) => {
  const { id } = req.params;
  // Update status, send email, create booking
  await query('UPDATE booking_requests SET status = $1 WHERE id = $2', ['accepted', id]);
  // Send acceptance email
  // Create booking record
  res.json({ success: true });
};
```

---

## 🚀 Enhancement Ideas

### 1. **Add Search Functionality**

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredRequests = requests.filter(req => {
  const matchesSearch = searchQuery === '' || 
    req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.eventType.toLowerCase().includes(searchQuery.toLowerCase());
  // ... other filters
  return matchesSearch && matchesStatus && matchesUrgency;
});
```

### 2. **Add Sorting Options**

```typescript
const [sortBy, setSortBy] = useState('date'); // date, urgency, budget

const sortedRequests = [...filteredRequests].sort((a, b) => {
  switch(sortBy) {
    case 'date': return new Date(b.requestedAt) - new Date(a.requestedAt);
    case 'urgency': return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    case 'budget': return parseBudget(b.budgetRange) - parseBudget(a.budgetRange);
    default: return 0;
  }
});
```

### 3. **Add Bulk Actions**

```typescript
const [selectedRequests, setSelectedRequests] = useState<number[]>([]);

const handleBulkAccept = async () => {
  await Promise.all(selectedRequests.map(id => acceptRequest(id)));
  setSelectedRequests([]);
};
```

### 4. **Add Calendar View**

```typescript
// Show requests on a calendar
<Calendar
  events={requests.map(r => ({
    date: r.eventDate,
    title: r.eventType,
    status: r.status
  }))}
/>
```

---

## 📝 Best Practices

1. **State Management**
   - Use React hooks for local state
   - Consider Context API for global request state
   - Use React Query or SWR for server state

2. **Error Handling**
   - Show error messages for failed API calls
   - Provide retry mechanisms
   - Handle network errors gracefully

3. **Loading States**
   - Show loading indicators while fetching
   - Disable buttons during actions
   - Provide skeleton loaders

4. **User Feedback**
   - Show success/error toasts
   - Update UI optimistically
   - Provide confirmation dialogs for destructive actions

5. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels
   - Ensure keyboard navigation
   - Provide screen reader support

---

## 🔗 Related Files

- **Component**: `frontend/src/components/photographer/PhotographerRequestsPage.tsx`
- **Route**: `frontend/src/pages/photographer/Requests.tsx`
- **Data**: `frontend/src/data/photographerDummyData.ts`
- **Navbar**: `frontend/src/components/photographer/PhotographerNavbar.tsx`

---

## 📚 Similar Patterns in Your Project

### Job Applications (Analysis Tab)

Your job applications feature in the Analysis tab follows a similar pattern:

- **View applications** → Similar to viewing requests
- **Accept/Reject** → Similar to Accept/Decline
- **Status badges** → Same visual pattern
- **Filter by status** → Same filtering logic

You can enhance your Analysis tab by borrowing UI elements from the Requests page!

---

## 🎯 Quick Start

1. **View the page**: Navigate to `/photographer/requests`
2. **Filter requests**: Use the status and urgency dropdowns
3. **Accept/Decline**: Click buttons on pending requests
4. **View details**: Check customer contact info and event details

---

## 💻 Code Example: Complete Integration

```typescript
// Complete example of integrating Requests page with backend

import { useState, useEffect } from 'react';
import bookingService from '@/services/booking.service';

const PhotographerRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterUrgency]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getRequests({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        urgency: filterUrgency !== 'all' ? filterUrgency : undefined
      });
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await bookingService.acceptRequest(requestId);
      await fetchRequests(); // Refresh
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  const handleDecline = async (requestId: number) => {
    try {
      await bookingService.declineRequest(requestId);
      await fetchRequests(); // Refresh
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  // ... rest of component
};
```

---

## 📞 Support

For questions or issues:
- Check the component file: `PhotographerRequestsPage.tsx`
- Review the route configuration in `App.tsx`
- Check dummy data structure in `photographerDummyData.ts`

---

**Last Updated**: December 2025
**Version**: 1.0.0
