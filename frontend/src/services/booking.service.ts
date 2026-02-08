import axios from 'axios';
import { API_BASE_URL, getAuthHeader, handleApiError } from '@/config/api';

export interface BookingRequest {
  requestId: number;
  customerId: number;
  customerName: string;
  customerAvatar?: string | null;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  eventDate: string | null;
  eventTime: string;
  eventLocation: string;
  duration: number;
  guestCount: number | null;
  budgetRange: string;
  requirements: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'pending' | 'confirmed' | 'cancelled' | 'in_progress' | 'completed' | 'refunded';
  requestedAt: string;
}

export interface BookingRequestsResponse {
  status: string;
  data: {
    requests: BookingRequest[];
    totalCount: number;
    pendingCount: number;
  };
}

export interface CreateBookingRequestData {
  photographer_id: number;
  event_type: string;
  booking_date: string;
  booking_time?: string;
  duration_hours?: number;
  location?: string;
  venue_name?: string;
  total_amount: number;
  advance_amount?: number;
  special_requirements?: string;
  urgency?: 'high' | 'medium' | 'low';
  event_id?: number;
}

export interface Booking {
  bookingId: number;
  customerId: number;
  customerName: string;
  customerAvatar?: string | null;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  eventDate: string | null;
  eventTime: string;
  eventLocation: string;
  duration: number;
  price: number;
  advanceAmount: number;
  pendingAmount: number;
  currency: string;
  status: 'confirmed' | 'in_progress' | 'completed';
  bookingStatus: 'current' | 'upcoming' | 'past';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  requirements: string;
  confirmedAt: string | null;
  completedAt: string | null;
  daysUntil: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingsResponse {
  status: string;
  data: {
    bookings: Booking[];
    current: Booking[];
    upcoming: Booking[];
    past: Booking[];
    counts: {
      current: number;
      upcoming: number;
      past: number;
      total: number;
    };
  };
}

class BookingService {
  // Create a booking request (customer creates request for photographer)
  async createRequest(data: CreateBookingRequestData): Promise<{ bookingId: number; status: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/bookings`,
        data,
        { headers: getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get all booking requests for the authenticated photographer
  async getRequests(status?: string, urgency?: string): Promise<BookingRequestsResponse> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (urgency && urgency !== 'all') params.append('urgency', urgency);

      const response = await axios.get(
        `${API_BASE_URL}/photographer/requests?${params.toString()}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Accept a booking request
  async acceptRequest(requestId: number): Promise<void> {
    try {
      await axios.put(
        `${API_BASE_URL}/photographer/requests/${requestId}/accept`,
        {},
        { headers: getAuthHeader() }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Decline a booking request
  async declineRequest(requestId: number, reason?: string): Promise<void> {
    try {
      await axios.put(
        `${API_BASE_URL}/photographer/requests/${requestId}/decline`,
        { reason },
        { headers: getAuthHeader() }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Request more info from customer
  async requestMoreInfo(requestId: number, message: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/photographer/requests/${requestId}/request-info`,
        { message },
        { headers: getAuthHeader() }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get customer's own booking requests
  async getMyRequests(status?: string): Promise<BookingRequestsResponse> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);

      const response = await axios.get(
        `${API_BASE_URL}/bookings/my-requests?${params.toString()}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Update a booking request
  async updateRequest(requestId: number, data: Partial<CreateBookingRequestData>): Promise<void> {
    try {
      await axios.put(
        `${API_BASE_URL}/bookings/${requestId}`,
        data,
        { headers: getAuthHeader() }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get photographer's bookings (confirmed, in_progress, completed)
  async getBookings(status?: string): Promise<BookingsResponse> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);

      const response = await axios.get(
        `${API_BASE_URL}/photographer/bookings?${params.toString()}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Send message from photographer to customer
  async sendMessageToCustomer(bookingId: number, message: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/photographer/bookings/${bookingId}/message`,
        { message },
        { headers: getAuthHeader() }
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new BookingService();

