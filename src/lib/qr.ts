// QR Code utilities for Schedula
import QRCode from 'qrcode';
import { QRData } from './types';

export const generateQRData = (
  eventId: string,
  userId: string,
  rsvpId: string
): QRData => {
  return {
    eventId,
    userId,
    rsvpId,
    timestamp: Date.now(),
  };
};

export const generateQRCode = async (data: QRData): Promise<string> => {
  try {
    const qrString = JSON.stringify(data);
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#262883', // Primary color
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const parseQRData = (qrString: string): QRData | null => {
  try {
    const data = JSON.parse(qrString);
    
    // Validate required fields
    if (!data.eventId || !data.userId || !data.rsvpId || !data.timestamp) {
      console.error('Invalid QR data structure:', data);
      return null;
    }

    // Check if QR code is not too old (24 hours)
    const now = Date.now();
    const qrAge = now - data.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (qrAge > maxAge) {
      console.error('QR code has expired');
      return null;
    }

    return data as QRData;
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
};

export const validateQRCode = (qrData: QRData): boolean => {
  // Basic validation
  if (!qrData.eventId || !qrData.userId || !qrData.rsvpId) {
    return false;
  }

  // Check timestamp is reasonable (not in future, not too old)
  const now = Date.now();
  if (qrData.timestamp > now || qrData.timestamp < now - 24 * 60 * 60 * 1000) {
    return false;
  }

  return true;
};

// Generate a simple QR code for testing
export const generateSimpleQR = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: '#262883',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating simple QR code:', error);
    throw error;
  }
};