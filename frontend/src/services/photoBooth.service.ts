import axios from 'axios';
import { API_BASE_URL, getAuthHeader, handleApiError } from '@/config/api';

export interface PhotoBoothGallery {
  galleryId: number;
  photographerId: number;
  bookingId?: number;
  eventName: string;
  qrCode: string;
  qrCodeUrl: string;
  galleryUrl: string;
  privacy: 'public' | 'password' | 'private';
  expiryDate?: string;
  downloadEnabled: boolean;
  watermarkEnabled: boolean;
  coverPhotoUrl?: string;
  description?: string;
  photoCount: number;
  accessCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt?: string;
  photos?: GalleryPhoto[];
}

export interface GalleryPhoto {
  photoId: number;
  photoUrl: string;
  thumbnailUrl?: string;
  displayOrder: number;
  downloadCount?: number;
  viewsCount?: number;
  createdAt?: string;
}

export interface CreateGalleryRequest {
  bookingId?: number;
  eventName: string;
  photoUrls: string[];
  privacy: 'public' | 'password' | 'private';
  password?: string;
  expiryDate?: string;
  downloadEnabled?: boolean;
  watermarkEnabled?: boolean;
  coverPhotoUrl?: string;
  description?: string;
}

export interface UpdateGalleryRequest {
  eventName?: string;
  privacy?: 'public' | 'password' | 'private';
  password?: string;
  expiryDate?: string;
  downloadEnabled?: boolean;
  watermarkEnabled?: boolean;
  coverPhotoUrl?: string;
  description?: string;
}

class PhotoBoothService {
  private baseUrl = `${API_BASE_URL}/photographer/photo-booth`;

  async createGallery(data: CreateGalleryRequest): Promise<PhotoBoothGallery> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate`, data, {
        headers: getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyGalleries(): Promise<PhotoBoothGallery[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/galleries`, {
        headers: getAuthHeader(),
      });
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getGalleryById(galleryId: number): Promise<PhotoBoothGallery> {
    try {
      const response = await axios.get(`${this.baseUrl}/${galleryId}`, {
        headers: getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateGallery(galleryId: number, data: UpdateGalleryRequest): Promise<PhotoBoothGallery> {
    try {
      const response = await axios.put(`${this.baseUrl}/${galleryId}`, data, {
        headers: getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteGallery(galleryId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${galleryId}`, {
        headers: getAuthHeader(),
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async downloadQRCode(galleryId: number): Promise<{ qrCodeUrl: string; galleryUrl: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/${galleryId}/qr-code`, {
        headers: getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async sendGalleryEmail(
    galleryId: number, 
    customerEmails: string | string[], 
    customerNames?: string | string[],
    message?: string
  ): Promise<{ sent: number; failed: number; results: Array<{ email: string; success: boolean; error?: string }> }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${galleryId}/send-email`,
        { customerEmails, customerNames, message },
        {
          headers: getAuthHeader(),
        }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new PhotoBoothService();

