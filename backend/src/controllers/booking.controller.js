import { query } from '../config/database.js';
import { sendBookingAcceptedEmail, sendBookingDeclinedEmail } from '../utils/email.service.js';

// Create a booking request (customer creates request for a photographer)
export const createBookingRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      photographer_id,
      event_type,
      booking_date,
      booking_time,
      duration_hours,
      location,
      venue_name,
      total_amount,
      advance_amount,
      special_requirements,
      urgency,
      event_id
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Validate required fields
    if (!photographer_id || !event_type || !booking_date || !total_amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: photographer_id, event_type, booking_date, and total_amount are required'
      });
    }

    // Verify photographer exists
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE photographer_id = $1',
      [photographer_id]
    );

    if (photographerResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }

    // Calculate pending amount
    const pendingAmount = total_amount - (advance_amount || 0);

    // Verify event exists if event_id is provided
    if (event_id) {
      const eventResult = await query(
        'SELECT event_id FROM events WHERE event_id = $1',
        [event_id]
      );
      if (eventResult.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Event not found'
        });
      }
    }

    // Create booking with status 'pending'
    const result = await query(
      `INSERT INTO bookings (
        customer_id,
        photographer_id,
        event_id,
        booking_date,
        booking_time,
        duration_hours,
        location,
        venue_name,
        event_type,
        total_amount,
        advance_amount,
        pending_amount,
        currency,
        status,
        payment_status,
        special_requirements,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING booking_id`,
      [
        userId,
        photographer_id,
        event_id || null,
        booking_date,
        booking_time || null,
        duration_hours || null,
        location || null,
        venue_name || null,
        event_type,
        total_amount,
        advance_amount || 0,
        pendingAmount,
        'INR',
        'pending',
        advance_amount && advance_amount > 0 ? 'partial' : 'unpaid',
        special_requirements || null
      ]
    );

    const bookingId = result[0].booking_id;

    res.status(201).json({
      status: 'success',
      message: 'Booking request created successfully',
      data: {
        bookingId,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Create booking request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking request'
    });
  }
};

// Get all booking requests for a customer (their own requests)
export const getCustomerBookings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { status } = req.query;

    // Build query to get customer's bookings
    let sql = `
      SELECT 
        b.booking_id,
        b.customer_id,
        b.photographer_id,
        b.booking_date,
        b.booking_time,
        b.duration_hours,
        b.location,
        b.venue_name,
        b.event_type,
        b.total_amount,
        b.advance_amount,
        b.pending_amount,
        b.currency,
        b.status,
        b.payment_status,
        b.special_requirements,
        b.created_at,
        b.updated_at,
        -- Photographer info
        p.business_name as photographer_business_name,
        up.full_name as photographer_name,
        up.avatar_url as photographer_avatar,
        -- Calculate budget range
        CASE 
          WHEN b.total_amount > 0 THEN 
            '₹' || ROUND(b.total_amount * 0.8)::text || ' - ₹' || ROUND(b.total_amount * 1.2)::text
          ELSE 'Not specified'
        END as budget_range,
        -- Calculate urgency
        CASE 
          WHEN b.booking_date - CURRENT_DATE < 7 THEN 'high'
          WHEN b.booking_date - CURRENT_DATE < 14 THEN 'medium'
          ELSE 'low'
        END as urgency,
        -- Count proposals (for future implementation)
        0 as proposals_count
      FROM bookings b
      LEFT JOIN photographers p ON b.photographer_id = p.photographer_id
      LEFT JOIN users u_photographer ON p.user_id = u_photographer.user_id
      LEFT JOIN user_profiles up ON u_photographer.user_id = up.user_id
      WHERE b.customer_id = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    // Add status filter
    if (status && status !== 'all') {
      sql += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY b.created_at DESC`;

    const bookings = await query(sql, params);

    // Format response
    const requests = bookings.map(booking => {
      const budgetMin = booking.total_amount ? Math.round(booking.total_amount * 0.8) : null;
      const budgetMax = booking.total_amount ? Math.round(booking.total_amount * 1.2) : null;
      const budgetRange = budgetMin && budgetMax 
        ? `₹${budgetMin.toLocaleString('en-IN')} - ₹${budgetMax.toLocaleString('en-IN')}`
        : 'Not specified';

      return {
        requestId: booking.booking_id,
        photographerId: booking.photographer_id,
        photographerName: booking.photographer_business_name || booking.photographer_name || 'Photographer',
        photographerAvatar: booking.photographer_avatar || null,
        eventType: booking.event_type || 'Event',
        eventDate: booking.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : null,
        eventTime: booking.booking_time || 'Not specified',
        eventLocation: booking.location || booking.venue_name || 'Not specified',
        duration: booking.duration_hours || 0,
        budgetRange: budgetRange,
        requirements: booking.special_requirements || 'No special requirements',
        urgency: booking.urgency || 'medium',
        status: booking.status,
        paymentStatus: booking.payment_status,
        proposalsCount: booking.proposals_count || 0,
        requestedAt: booking.created_at
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        requests,
        totalCount: requests.length
      }
    });
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your booking requests'
    });
  }
};

// Update a booking request (customer edits their request)
export const updateBookingRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const {
      event_type,
      booking_date,
      booking_time,
      duration_hours,
      location,
      venue_name,
      total_amount,
      advance_amount,
      special_requirements
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Verify booking belongs to customer and is still pending
    const bookingResult = await query(
      `SELECT booking_id, status FROM bookings 
       WHERE booking_id = $1 AND customer_id = $2`,
      [id, userId]
    );

    if (bookingResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking request not found'
      });
    }

    const booking = bookingResult[0];

    if (booking.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot edit booking request that is not pending'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (event_type) {
      updates.push(`event_type = $${paramIndex}`);
      params.push(event_type);
      paramIndex++;
    }
    if (booking_date) {
      updates.push(`booking_date = $${paramIndex}`);
      params.push(booking_date);
      paramIndex++;
    }
    if (booking_time !== undefined) {
      updates.push(`booking_time = $${paramIndex}`);
      params.push(booking_time || null);
      paramIndex++;
    }
    if (duration_hours !== undefined) {
      updates.push(`duration_hours = $${paramIndex}`);
      params.push(duration_hours || null);
      paramIndex++;
    }
    if (location) {
      updates.push(`location = $${paramIndex}`);
      params.push(location);
      paramIndex++;
    }
    if (venue_name !== undefined) {
      updates.push(`venue_name = $${paramIndex}`);
      params.push(venue_name || null);
      paramIndex++;
    }
    if (total_amount) {
      updates.push(`total_amount = $${paramIndex}`);
      params.push(total_amount);
      paramIndex++;
      // Recalculate pending amount
      const advance = advance_amount || 0;
      updates.push(`pending_amount = $${paramIndex}`);
      params.push(total_amount - advance);
      paramIndex++;
    }
    if (advance_amount !== undefined) {
      updates.push(`advance_amount = $${paramIndex}`);
      params.push(advance_amount || 0);
      paramIndex++;
    }
    if (special_requirements !== undefined) {
      updates.push(`special_requirements = $${paramIndex}`);
      params.push(special_requirements || null);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    await query(
      `UPDATE bookings 
       SET ${updates.join(', ')}
       WHERE booking_id = $${paramIndex}`,
      params
    );

    res.status(200).json({
      status: 'success',
      message: 'Booking request updated successfully',
      data: {
        bookingId: parseInt(id)
      }
    });
  } catch (error) {
    console.error('Update booking request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking request'
    });
  }
};

// Get all booking requests for a photographer
export const getPhotographerRequests = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get photographer_id from user_id
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'User is not a photographer'
      });
    }

    const photographerId = photographerResult[0].photographer_id;
    const { status, urgency } = req.query;

    // Build query with filters
    let sql = `
      SELECT 
        b.booking_id,
        b.customer_id,
        b.photographer_id,
        b.event_id,
        b.booking_date,
        b.booking_time,
        b.duration_hours,
        b.location,
        b.venue_name,
        b.event_type,
        b.total_amount,
        b.advance_amount,
        b.pending_amount,
        b.currency,
        b.status,
        b.payment_status,
        b.special_requirements,
        b.created_at,
        b.updated_at,
        -- Customer info
        u.email as customer_email,
        up.full_name as customer_name,
        up.avatar_url as customer_avatar,
        up.phone as customer_phone,
        -- Extract budget range from total_amount (we'll use this as budget range)
        CASE 
          WHEN b.total_amount > 0 THEN 
            '₹' || ROUND(b.total_amount * 0.8)::text || ' - ₹' || ROUND(b.total_amount * 1.2)::text
          ELSE 'Not specified'
        END as budget_range,
        -- Calculate urgency based on booking_date proximity (high if < 7 days, medium if < 14 days, low otherwise)
        CASE 
          WHEN b.booking_date - CURRENT_DATE < 7 THEN 'high'
          WHEN b.booking_date - CURRENT_DATE < 14 THEN 'medium'
          ELSE 'low'
        END as urgency
      FROM bookings b
      JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE b.photographer_id = $1
    `;

    const params = [photographerId];
    let paramIndex = 2;

    // Add status filter
    if (status && status !== 'all') {
      sql += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    // If status is 'all' or not provided, show all statuses (no filter)

    // Add urgency filter (calculated urgency)
    if (urgency && urgency !== 'all') {
      sql += ` AND (
        CASE 
          WHEN b.booking_date - CURRENT_DATE < 7 THEN 'high'
          WHEN b.booking_date - CURRENT_DATE < 14 THEN 'medium'
          ELSE 'low'
        END
      ) = $${paramIndex}`;
      params.push(urgency);
      paramIndex++;
    }

    sql += ` ORDER BY b.created_at DESC`;

    const bookings = await query(sql, params);

    // Format response
    const requests = bookings.map(booking => {
      // Parse budget from total_amount if needed
      const budgetMin = booking.total_amount ? Math.round(booking.total_amount * 0.8) : null;
      const budgetMax = booking.total_amount ? Math.round(booking.total_amount * 1.2) : null;
      const budgetRange = budgetMin && budgetMax 
        ? `₹${budgetMin.toLocaleString('en-IN')} - ₹${budgetMax.toLocaleString('en-IN')}`
        : 'Not specified';

      return {
        requestId: booking.booking_id,
        customerId: booking.customer_id,
        customerName: booking.customer_name || 'Customer',
        customerAvatar: booking.customer_avatar || null,
        customerPhone: booking.customer_phone || booking.customer_email || 'Not provided',
        customerEmail: booking.customer_email || 'Not provided',
        eventType: booking.event_type || 'Event',
        eventDate: booking.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : null,
        eventTime: booking.booking_time || 'Not specified',
        eventLocation: booking.location || booking.venue_name || 'Not specified',
        duration: booking.duration_hours || 0,
        guestCount: null, // Not in bookings table, could be added later
        budgetRange: budgetRange,
        requirements: booking.special_requirements || 'No special requirements',
        urgency: booking.urgency || 'medium',
        status: booking.status,
        requestedAt: booking.created_at
      };
    });

    // Get counts
    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    res.status(200).json({
      status: 'success',
      data: {
        requests,
        totalCount: requests.length,
        pendingCount
      }
    });
  } catch (error) {
    console.error('Get photographer requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking requests'
    });
  }
};

// Accept a booking request
export const acceptBookingRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get photographer_id
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'User is not a photographer'
      });
    }

    const photographerId = photographerResult[0].photographer_id;

    // Get booking details and photographer name
    const bookingResult = await query(
      `SELECT b.*, 
              u.email as customer_email, 
              up.full_name as customer_name,
              p.business_name as photographer_business_name,
              up_photographer.full_name as photographer_name
       FROM bookings b
       JOIN users u ON b.customer_id = u.user_id
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       JOIN photographers p ON b.photographer_id = p.photographer_id
       JOIN users u_photographer ON p.user_id = u_photographer.user_id
       LEFT JOIN user_profiles up_photographer ON u_photographer.user_id = up_photographer.user_id
       WHERE b.booking_id = $1 AND b.photographer_id = $2`,
      [id, photographerId]
    );

    if (bookingResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking request not found'
      });
    }

    const booking = bookingResult[0];

    if (booking.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Booking request is already ${booking.status}`
      });
    }

    // Update booking status to confirmed
    await query(
      `UPDATE bookings 
       SET status = 'confirmed', 
           confirmed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $1`,
      [id]
    );

    // Send acceptance email
    try {
      await sendBookingAcceptedEmail({
        customerEmail: booking.customer_email,
        customerName: booking.customer_name || 'Customer',
        eventType: booking.event_type || 'Event',
        eventDate: booking.booking_date,
        eventTime: booking.booking_time,
        location: booking.location || booking.venue_name || 'TBD',
        photographerName: booking.photographer_business_name || booking.photographer_name || 'Photographer'
      });
    } catch (emailError) {
      console.error('Failed to send acceptance email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'Booking request accepted successfully',
      data: {
        bookingId: parseInt(id),
        status: 'confirmed'
      }
    });
  } catch (error) {
    console.error('Accept booking request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to accept booking request'
    });
  }
};

// Decline a booking request
export const declineBookingRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get photographer_id
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'User is not a photographer'
      });
    }

    const photographerId = photographerResult[0].photographer_id;

    // Get booking details
    const bookingResult = await query(
      `SELECT b.*, u.email as customer_email, up.full_name as customer_name
       FROM bookings b
       JOIN users u ON b.customer_id = u.user_id
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE b.booking_id = $1 AND b.photographer_id = $2`,
      [id, photographerId]
    );

    if (bookingResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking request not found'
      });
    }

    const booking = bookingResult[0];

    if (booking.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Booking request is already ${booking.status}`
      });
    }

    // Update booking status to cancelled (declined)
    await query(
      `UPDATE bookings 
       SET status = 'cancelled', 
           cancellation_reason = $1,
           cancelled_by = $2,
           cancelled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $3`,
      [reason || 'Declined by photographer', userId, id]
    );

    // Send decline email
    try {
      await sendBookingDeclinedEmail({
        customerEmail: booking.customer_email,
        customerName: booking.customer_name || 'Customer',
        eventType: booking.event_type || 'Event',
        eventDate: booking.booking_date,
        reason: reason || 'Unfortunately, we are unable to accommodate this booking at this time.'
      });
    } catch (emailError) {
      console.error('Failed to send decline email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'Booking request declined successfully',
      data: {
        bookingId: parseInt(id),
        status: 'cancelled'
      }
    });
  } catch (error) {
    console.error('Decline booking request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to decline booking request'
    });
  }
};

// Get photographer's bookings (confirmed, in_progress, completed)
export const getPhotographerBookings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get photographer_id from user_id
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'User is not a photographer'
      });
    }

    const photographerId = photographerResult[0].photographer_id;
    const { status } = req.query;

    // Build query to get photographer's bookings (confirmed, in_progress, completed)
    let sql = `
      SELECT 
        b.booking_id,
        b.customer_id,
        b.photographer_id,
        b.booking_date,
        b.booking_time,
        b.duration_hours,
        b.location,
        b.venue_name,
        b.event_type,
        b.total_amount,
        b.advance_amount,
        b.pending_amount,
        b.currency,
        b.status,
        b.payment_status,
        b.special_requirements,
        b.confirmed_at,
        b.completed_at,
        b.created_at,
        b.updated_at,
        -- Customer info
        u.email as customer_email,
        up.full_name as customer_name,
        up.avatar_url as customer_avatar,
        up.phone as customer_phone
      FROM bookings b
      JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE b.photographer_id = $1
        AND b.status IN ('confirmed', 'in_progress', 'completed')
    `;

    const params = [photographerId];
    let paramIndex = 2;

    // Add status filter if provided
    if (status && status !== 'all') {
      sql += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Order by booking date (upcoming first, then past)
    sql += ` ORDER BY 
      CASE 
        WHEN b.booking_date >= CURRENT_DATE THEN 0 
        ELSE 1 
      END,
      b.booking_date ASC,
      b.booking_time ASC`;

    const bookings = await query(sql, params);

    // Format response
    const formattedBookings = bookings.map(booking => {
      const bookingDate = booking.booking_date ? new Date(booking.booking_date) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let bookingStatus = 'upcoming';
      if (booking.status === 'completed') {
        bookingStatus = 'past';
      } else if (booking.status === 'in_progress') {
        bookingStatus = 'current';
      } else if (bookingDate && bookingDate < today) {
        bookingStatus = 'past';
      } else if (bookingDate && bookingDate.toDateString() === today.toDateString()) {
        bookingStatus = 'current';
      }

      // Calculate days until event
      let daysUntil = null;
      if (bookingDate && bookingDate >= today) {
        const diffTime = bookingDate.getTime() - today.getTime();
        daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        bookingId: booking.booking_id,
        customerId: booking.customer_id,
        customerName: booking.customer_name || 'Customer',
        customerAvatar: booking.customer_avatar || null,
        customerPhone: booking.customer_phone || booking.customer_email || 'Not provided',
        customerEmail: booking.customer_email || 'Not provided',
        eventType: booking.event_type || 'Event',
        eventDate: booking.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : null,
        eventTime: booking.booking_time || 'Not specified',
        eventLocation: booking.location || booking.venue_name || 'Not specified',
        duration: booking.duration_hours || 0,
        price: parseFloat(booking.total_amount) || 0,
        advanceAmount: parseFloat(booking.advance_amount) || 0,
        pendingAmount: parseFloat(booking.pending_amount) || 0,
        currency: booking.currency || 'INR',
        status: booking.status,
        bookingStatus: bookingStatus, // 'current', 'upcoming', 'past'
        paymentStatus: booking.payment_status || 'unpaid',
        requirements: booking.special_requirements || '',
        confirmedAt: booking.confirmed_at,
        completedAt: booking.completed_at,
        daysUntil: daysUntil,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      };
    });

    // Group bookings by status
    const currentBookings = formattedBookings.filter(b => b.bookingStatus === 'current');
    const upcomingBookings = formattedBookings.filter(b => b.bookingStatus === 'upcoming');
    const pastBookings = formattedBookings.filter(b => b.bookingStatus === 'past');

    res.status(200).json({
      status: 'success',
      data: {
        bookings: formattedBookings,
        current: currentBookings,
        upcoming: upcomingBookings,
        past: pastBookings,
        counts: {
          current: currentBookings.length,
          upcoming: upcomingBookings.length,
          past: pastBookings.length,
          total: formattedBookings.length
        }
      }
    });
  } catch (error) {
    console.error('Get photographer bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
};

// Send message from photographer to customer
export const sendMessageToCustomer = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    // Get photographer_id
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'User is not a photographer'
      });
    }

    const photographerId = photographerResult[0].photographer_id;

    // Get booking details and customer/photographer info
    const bookingResult = await query(
      `SELECT 
        b.booking_id,
        b.event_type,
        b.booking_date,
        b.status,
        u_customer.email as customer_email,
        up_customer.full_name as customer_name,
        u_photographer.email as photographer_email,
        p.business_name as photographer_business_name,
        up_photographer.full_name as photographer_name
       FROM bookings b
       JOIN users u_customer ON b.customer_id = u_customer.user_id
       LEFT JOIN user_profiles up_customer ON u_customer.user_id = up_customer.user_id
       JOIN photographers p ON b.photographer_id = p.photographer_id
       JOIN users u_photographer ON p.user_id = u_photographer.user_id
       LEFT JOIN user_profiles up_photographer ON u_photographer.user_id = up_photographer.user_id
       WHERE b.booking_id = $1 AND b.photographer_id = $2`,
      [id, photographerId]
    );

    if (bookingResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    const booking = bookingResult[0];

    // Send email to customer
    try {
      const { sendPhotographerMessageEmail } = await import('../utils/email.service.js');
      await sendPhotographerMessageEmail({
        customerEmail: booking.customer_email,
        customerName: booking.customer_name || 'Customer',
        photographerName: booking.photographer_business_name || booking.photographer_name || 'Photographer',
        photographerEmail: booking.photographer_email,
        message: message.trim(),
        eventType: booking.event_type || 'Event',
        eventDate: booking.booking_date
      });
    } catch (emailError) {
      console.error('Failed to send message email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.status(200).json({
      status: 'success',
      message: 'Message sent to customer successfully',
      data: {
        bookingId: parseInt(id),
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Send message to customer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message to customer'
    });
  }
};

// Request more info (creates a message/notification)
export const requestMoreInfo = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get photographer_id
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'User is not a photographer'
      });
    }

    const photographerId = photographerResult[0].photographer_id;

    // Get booking details
    const bookingResult = await query(
      `SELECT b.*, u.email as customer_email, up.full_name as customer_name
       FROM bookings b
       JOIN users u ON b.customer_id = u.user_id
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE b.booking_id = $1 AND b.photographer_id = $2`,
      [id, photographerId]
    );

    if (bookingResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking request not found'
      });
    }

    const booking = bookingResult[0];

    // TODO: Create a message/notification to the customer
    // For now, we'll just return success
    // In the future, this could create a message thread or notification

    res.status(200).json({
      status: 'success',
      message: 'Information request sent to customer',
      data: {
        bookingId: parseInt(id)
      }
    });
  } catch (error) {
    console.error('Request more info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send information request'
    });
  }
};

