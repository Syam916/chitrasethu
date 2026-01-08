import axios from 'axios';
import { API_BASE_URL, handleApiError } from '@/config/api';

export interface PublicGallery {
  galleryId: number;
  eventName: string;
  privacy: 'public' | 'password' | 'private';
  expiryDate?: string;
  downloadEnabled: boolean;
  watermarkEnabled: boolean;
  coverPhotoUrl?: string;
  description?: string;
  photoCount: number;
  accessCount: number;
  createdAt: string;
  photos: GalleryPhoto[];
  requiresPassword?: boolean;
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

export async function getGalleryByQRCode(qrCode: string): Promise<PublicGallery> {
  try {
    const response = await axios.get(`${API_BASE_URL}/photo-booth/${qrCode}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Gallery not found');
    }
    if (error.response?.status === 410) {
      throw new Error('This gallery has expired');
    }
    throw new Error(handleApiError(error));
  }
}

export async function verifyPassword(qrCode: string, password: string): Promise<{ photos: GalleryPhoto[] }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/photo-booth/${qrCode}/verify-password`, {
      password,
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Incorrect password');
    }
    throw new Error(handleApiError(error));
  }
}

export async function trackAccess(qrCode: string): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/photo-booth/${qrCode}/access`);
  } catch (error) {
    // Don't throw - tracking is not critical
    console.error('Failed to track access:', error);
  }
}

export async function trackPhotoDownload(photoId: number): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/photo-booth/photos/${photoId}/download`);
  } catch (error) {
    // Don't throw - tracking is not critical
    console.error('Failed to track download:', error);
  }
}

