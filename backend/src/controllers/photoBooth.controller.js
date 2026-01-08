import { query } from '../config/database.js';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Helper: Get photographer_id from user_id
const getPhotographerId = async (userId) => {
  const result = await query(
    'SELECT photographer_id FROM photographers WHERE user_id = $1',
    [userId]
  );
  return result.length > 0 ? result[0].photographer_id : null;
};

// Helper: Transform gallery from snake_case to camelCase
const transformGallery = (gallery) => {
  const transformed = {
    galleryId: gallery.gallery_id,
    photographerId: gallery.photographer_id,
    bookingId: gallery.booking_id || null,
    eventName: gallery.event_name,
    qrCode: gallery.qr_code,
    qrCodeUrl: gallery.qr_code_url || null,
    galleryUrl: gallery.gallery_url,
    privacy: gallery.privacy,
    expiryDate: gallery.expiry_date || null,
    downloadEnabled: gallery.download_enabled !== undefined ? gallery.download_enabled : true,
    watermarkEnabled: gallery.watermark_enabled !== undefined ? gallery.watermark_enabled : false,
    coverPhotoUrl: gallery.cover_photo_url || null,
    description: gallery.description || null,
    photoCount: parseInt(gallery.photo_count) || 0,
    accessCount: parseInt(gallery.access_count) || 0,
    downloadCount: parseInt(gallery.download_count) || 0,
    isActive: gallery.is_active !== undefined ? gallery.is_active : true,
    createdAt: gallery.created_at,
    updatedAt: gallery.updated_at || null
  };
  
  // Never return password_hash to client
  if (gallery.password_hash) {
    // Don't include it - it's for internal use only
  }
  
  return transformed;
};

// Helper: Transform photo from snake_case to camelCase
const transformPhoto = (photo) => {
  return {
    photoId: photo.photo_id,
    photoUrl: photo.photo_url,
    thumbnailUrl: photo.thumbnail_url || null,
    displayOrder: photo.display_order,
    downloadCount: parseInt(photo.download_count) || 0,
    viewsCount: parseInt(photo.views_count) || 0,
    createdAt: photo.created_at || null
  };
};

// Helper: Generate unique QR code identifier
const generateUniqueQRCode = () => {
  const randomString = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `QR${randomString}`;
};

// Helper: Generate QR code image (base64)
const generateQRCodeImage = async (url) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 400,
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Create a new photo booth gallery
export const createGallery = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const photographerId = await getPhotographerId(userId);
    if (!photographerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can create galleries'
      });
    }

    const {
      bookingId,
      eventName,
      photoUrls,
      privacy = 'public',
      password,
      expiryDate,
      downloadEnabled = true,
      watermarkEnabled = false,
      coverPhotoUrl,
      description
    } = req.body;

    // Validation
    if (!eventName || !photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Event name and photo URLs are required'
      });
    }

    // Generate unique QR code
    const qrCode = generateUniqueQRCode();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const galleryUrl = `${baseUrl}/gallery/${qrCode}`;

    // Generate QR code image (base64 data URL can be very long, so we store as TEXT)
    const qrCodeUrl = await generateQRCodeImage(galleryUrl);

    // Hash password if provided
    let passwordHash = null;
    if (privacy === 'password' && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Insert gallery
    const galleryResult = await query(
      `INSERT INTO photo_booth_galleries (
        photographer_id, booking_id, event_name, qr_code, qr_code_url, gallery_url,
        privacy, password_hash, expiry_date, download_enabled, watermark_enabled,
        cover_photo_url, description, photo_count, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        photographerId,
        bookingId || null,
        eventName,
        qrCode,
        qrCodeUrl,
        galleryUrl,
        privacy,
        passwordHash,
        expiryDate || null,
        downloadEnabled,
        watermarkEnabled,
        coverPhotoUrl || null,
        description || null,
        photoUrls.length,
        true
      ]
    );

    const gallery = galleryResult[0];

    // Insert photos
    const photoInserts = photoUrls.map((photoUrl, index) => ({
      gallery_id: gallery.gallery_id,
      photo_url: photoUrl,
      display_order: index + 1
    }));

    for (const photo of photoInserts) {
      await query(
        `INSERT INTO photo_booth_gallery_photos (gallery_id, photo_url, display_order)
         VALUES ($1, $2, $3)`,
        [photo.gallery_id, photo.photo_url, photo.display_order]
      );
    }

    // Get full gallery with photos
    const photosResult = await query(
      `SELECT photo_id, photo_url, thumbnail_url, display_order, 
              download_count, views_count, created_at
       FROM photo_booth_gallery_photos
       WHERE gallery_id = $1
       ORDER BY display_order`,
      [gallery.gallery_id]
    );

    const transformedGallery = transformGallery(gallery);
    const transformedPhotos = photosResult.map(transformPhoto);

    res.status(201).json({
      status: 'success',
      data: {
        ...transformedGallery,
        photos: transformedPhotos
      }
    });
  } catch (error) {
    console.error('Create gallery error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create gallery',
      error: error.message
    });
  }
};

// Get all galleries for the authenticated photographer
export const getMyGalleries = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const photographerId = await getPhotographerId(userId);
    if (!photographerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can access galleries'
      });
    }

    const galleries = await query(
      `SELECT gallery_id, photographer_id, booking_id, event_name, qr_code,
              qr_code_url, gallery_url, privacy, expiry_date, download_enabled,
              watermark_enabled, cover_photo_url, description, photo_count,
              access_count, download_count, is_active, created_at, updated_at
       FROM photo_booth_galleries
       WHERE photographer_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [photographerId]
    );

    // Transform galleries to camelCase
    const transformedGalleries = galleries.map(gallery => {
      // Get photo count
      return transformGallery(gallery);
    });

    res.status(200).json({
      status: 'success',
      data: transformedGalleries
    });
  } catch (error) {
    console.error('Get galleries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch galleries'
    });
  }
};

// Get gallery by ID (for photographer)
export const getGalleryById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { galleryId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const photographerId = await getPhotographerId(userId);
    if (!photographerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can access galleries'
      });
    }

    const galleryResult = await query(
      `SELECT * FROM photo_booth_galleries
       WHERE gallery_id = $1 AND photographer_id = $2`,
      [galleryId, photographerId]
    );

    if (galleryResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery not found'
      });
    }

    const gallery = galleryResult[0];

    // Get photos
    const photos = await query(
      `SELECT photo_id, photo_url, thumbnail_url, display_order,
              download_count, views_count, created_at
       FROM photo_booth_gallery_photos
       WHERE gallery_id = $1
       ORDER BY display_order`,
      [galleryId]
    );

    const transformedGallery = transformGallery(gallery);
    const transformedPhotos = photos.map(transformPhoto);

    res.status(200).json({
      status: 'success',
      data: {
        ...transformedGallery,
        photos: transformedPhotos
      }
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch gallery'
    });
  }
};

// Update gallery
export const updateGallery = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { galleryId } = req.params;
    const {
      eventName,
      privacy,
      password,
      expiryDate,
      downloadEnabled,
      watermarkEnabled,
      coverPhotoUrl,
      description
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const photographerId = await getPhotographerId(userId);
    if (!photographerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can update galleries'
      });
    }

    // Verify gallery belongs to photographer
    const galleryResult = await query(
      'SELECT * FROM photo_booth_galleries WHERE gallery_id = $1 AND photographer_id = $2',
      [galleryId, photographerId]
    );

    if (galleryResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery not found'
      });
    }

    // Build update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (eventName) {
      updates.push(`event_name = $${paramIndex}`);
      params.push(eventName);
      paramIndex++;
    }
    if (privacy !== undefined) {
      updates.push(`privacy = $${paramIndex}`);
      params.push(privacy);
      paramIndex++;
    }
    if (password && privacy === 'password') {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex}`);
      params.push(passwordHash);
      paramIndex++;
    }
    if (expiryDate !== undefined) {
      updates.push(`expiry_date = $${paramIndex}`);
      params.push(expiryDate || null);
      paramIndex++;
    }
    if (downloadEnabled !== undefined) {
      updates.push(`download_enabled = $${paramIndex}`);
      params.push(downloadEnabled);
      paramIndex++;
    }
    if (watermarkEnabled !== undefined) {
      updates.push(`watermark_enabled = $${paramIndex}`);
      params.push(watermarkEnabled);
      paramIndex++;
    }
    if (coverPhotoUrl !== undefined) {
      updates.push(`cover_photo_url = $${paramIndex}`);
      params.push(coverPhotoUrl || null);
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description || null);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    params.push(galleryId);
    const updateQuery = `
      UPDATE photo_booth_galleries
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE gallery_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);
    const transformedGallery = transformGallery(result[0]);

    res.status(200).json({
      status: 'success',
      data: transformedGallery
    });
  } catch (error) {
    console.error('Update gallery error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update gallery'
    });
  }
};

// Delete gallery
export const deleteGallery = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { galleryId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const photographerId = await getPhotographerId(userId);
    if (!photographerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can delete galleries'
      });
    }

    // Verify gallery belongs to photographer
    const galleryResult = await query(
      'SELECT gallery_id FROM photo_booth_galleries WHERE gallery_id = $1 AND photographer_id = $2',
      [galleryId, photographerId]
    );

    if (galleryResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery not found'
      });
    }

    // Soft delete (set is_active = false)
    await query(
      'UPDATE photo_booth_galleries SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE gallery_id = $1',
      [galleryId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Gallery deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete gallery'
    });
  }
};

// Get public gallery by QR code (for customers)
export const getPublicGallery = async (req, res) => {
  try {
    const { qrCode } = req.params;

    const galleryResult = await query(
      `SELECT gallery_id, photographer_id, booking_id, event_name, qr_code, qr_code_url,
              gallery_url, privacy, expiry_date, download_enabled,
              watermark_enabled, cover_photo_url, description, photo_count,
              access_count, download_count, is_active, created_at, updated_at
       FROM photo_booth_galleries
       WHERE qr_code = $1 AND is_active = true`,
      [qrCode]
    );

    if (galleryResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery not found'
      });
    }

    const gallery = galleryResult[0];

    // Check expiry
    if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) {
      return res.status(410).json({
        status: 'error',
        message: 'This gallery has expired'
      });
    }

    // If password protected, require password verification
    if (gallery.privacy === 'password') {
      const transformedGallery = transformGallery(gallery);
      delete transformedGallery.passwordHash; // Remove password hash if it exists
      
      return res.status(200).json({
        status: 'success',
        data: {
          ...transformedGallery,
          requiresPassword: true,
          photos: []
        }
      });
    }

    // Get photos for public galleries
    const photos = await query(
      `SELECT photo_id, photo_url, thumbnail_url, display_order,
              download_count, views_count, created_at
       FROM photo_booth_gallery_photos
       WHERE gallery_id = $1
       ORDER BY display_order`,
      [gallery.gallery_id]
    );

    const transformedGallery = transformGallery(gallery);
    const transformedPhotos = photos.map(transformPhoto);

    // Track access
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    await query(
      `INSERT INTO photo_booth_access_logs (gallery_id, ip_address, user_agent)
       VALUES ($1, $2, $3)`,
      [gallery.gallery_id, ipAddress, userAgent]
    );

    // Update access count
    await query(
      'UPDATE photo_booth_galleries SET access_count = access_count + 1 WHERE gallery_id = $1',
      [gallery.gallery_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        ...transformedGallery,
        photos: transformedPhotos
      }
    });
  } catch (error) {
    console.error('Get public gallery error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch gallery'
    });
  }
};

// Verify password for password-protected galleries
export const verifyPassword = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    const galleryResult = await query(
      'SELECT gallery_id, password_hash, expiry_date FROM photo_booth_galleries WHERE qr_code = $1 AND is_active = true',
      [qrCode]
    );

    if (galleryResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery not found'
      });
    }

    const gallery = galleryResult[0];

    // Check expiry
    if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) {
      return res.status(410).json({
        status: 'error',
        message: 'This gallery has expired'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, gallery.password_hash);

    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect password'
      });
    }

    // Get photos
    const photos = await query(
      `SELECT photo_id, photo_url, thumbnail_url, display_order,
              download_count, views_count, created_at
       FROM photo_booth_gallery_photos
       WHERE gallery_id = $1
       ORDER BY display_order`,
      [gallery.gallery_id]
    );

    // Track access
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    await query(
      `INSERT INTO photo_booth_access_logs (gallery_id, ip_address, user_agent)
       VALUES ($1, $2, $3)`,
      [gallery.gallery_id, ipAddress, userAgent]
    );

    // Update access count
    await query(
      'UPDATE photo_booth_galleries SET access_count = access_count + 1 WHERE gallery_id = $1',
      [gallery.gallery_id]
    );

    const transformedPhotos = photos.map(transformPhoto);

    res.status(200).json({
      status: 'success',
      data: {
        galleryId: gallery.gallery_id,
        photos: transformedPhotos
      }
    });
  } catch (error) {
    console.error('Verify password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify password'
    });
  }
};

// Download QR code image
export const downloadQRCode = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { galleryId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const photographerId = await getPhotographerId(userId);
    if (!photographerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can download QR codes'
      });
    }

    const galleryResult = await query(
      'SELECT qr_code_url, gallery_url FROM photo_booth_galleries WHERE gallery_id = $1 AND photographer_id = $2',
      [galleryId, photographerId]
    );

    if (galleryResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery not found'
      });
    }

    const gallery = galleryResult[0];

    // Return QR code data URL
    res.status(200).json({
      status: 'success',
      data: {
        qrCodeUrl: gallery.qr_code_url,
        galleryUrl: gallery.gallery_url
      }
    });
  } catch (error) {
    console.error('Download QR code error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get QR code'
    });
  }
};

// Send gallery email to customers
export const sendGalleryEmail = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { galleryId } = req.params;
    const { customerEmails, customerNames, message } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const photographerId = await getPhotographerId(userId);
    if (!photographerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can send gallery emails'
      });
    }

    // Validate customer emails
    if (!customerEmails || (Array.isArray(customerEmails) && customerEmails.length === 0) || 
        (typeof customerEmails === 'string' && !customerEmails.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one customer email is required'
      });
    }

    // Get gallery details
    const galleryResult = await query(
      `SELECT gallery_id, event_name, qr_code, qr_code_url, gallery_url, 
              privacy, password_hash, expiry_date, description
       FROM photo_booth_galleries 
       WHERE gallery_id = $1 AND photographer_id = $2`,
      [galleryId, photographerId]
    );

    if (galleryResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery not found'
      });
    }

    const gallery = galleryResult[0];

    // Get photographer name
    const photographerResult = await query(
      `SELECT up.full_name, p.business_name
       FROM photographers p
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE p.photographer_id = $1`,
      [photographerId]
    );

    const photographer = photographerResult[0];
    const photographerName = photographer?.business_name || photographer?.full_name || 'Your Photographer';

    // Import email service
    const { sendPhotoBoothGalleryEmail } = await import('../utils/email.service.js');

    // Send email
    const emailResult = await sendPhotoBoothGalleryEmail({
      customerEmails,
      customerNames,
      photographerName,
      eventName: gallery.event_name,
      galleryUrl: gallery.gallery_url,
      qrCodeUrl: gallery.qr_code_url,
      qrCode: gallery.qr_code,
      description: gallery.description,
      expiryDate: gallery.expiry_date,
      password: gallery.privacy === 'password' ? '(Password provided separately)' : null
    });

    if (!emailResult.success && emailResult.failed === emailResult.sent + emailResult.failed) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send emails',
        details: emailResult
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Emails sent successfully to ${emailResult.sent} recipient(s)`,
      data: {
        sent: emailResult.sent,
        failed: emailResult.failed,
        results: emailResult.results
      }
    });
  } catch (error) {
    console.error('Send gallery email error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send gallery emails',
      error: error.message
    });
  }
};

// Track gallery access (public endpoint)
export const trackAccess = async (req, res) => {
  try {
    const { qrCode } = req.params;

    const galleryResult = await query(
      'SELECT gallery_id FROM photo_booth_galleries WHERE qr_code = $1 AND is_active = true',
      [qrCode]
    );

    if (galleryResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery not found'
      });
    }

    const gallery = galleryResult[0];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    await query(
      `INSERT INTO photo_booth_access_logs (gallery_id, ip_address, user_agent)
       VALUES ($1, $2, $3)`,
      [gallery.gallery_id, ipAddress, userAgent]
    );

    await query(
      'UPDATE photo_booth_galleries SET access_count = access_count + 1 WHERE gallery_id = $1',
      [gallery.gallery_id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Access tracked'
    });
  } catch (error) {
    console.error('Track access error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to track access'
    });
  }
};

// Track photo download
export const trackPhotoDownload = async (req, res) => {
  try {
    const { photoId } = req.params;

    const photoResult = await query(
      'SELECT gallery_id FROM photo_booth_gallery_photos WHERE photo_id = $1',
      [photoId]
    );

    if (photoResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Photo not found'
      });
    }

    const photo = photoResult[0];

    // Update photo download count
    await query(
      'UPDATE photo_booth_gallery_photos SET download_count = download_count + 1 WHERE photo_id = $1',
      [photoId]
    );

    // Update gallery download count
    await query(
      'UPDATE photo_booth_galleries SET download_count = download_count + 1 WHERE gallery_id = $1',
      [photo.gallery_id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Download tracked'
    });
  } catch (error) {
    console.error('Track photo download error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to track download'
    });
  }
};

