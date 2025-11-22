import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class QrCodeService {
  private readonly qrCodeDir = path.join(process.cwd(), 'public', 'qrcodes');

  constructor() {
    // Ensure directory exists
    if (!fs.existsSync(this.qrCodeDir)) {
      mkdir(this.qrCodeDir, { recursive: true }).catch(console.error);
    }
  }

  async generateQrCode(data: string, fileName: string): Promise<string> {
    try {
      const filePath = path.join(this.qrCodeDir, `${fileName}.png`);
      
      await QRCode.toFile(filePath, data, {
        errorCorrectionLevel: 'H',  // High error correction
        type: 'png',
        margin: 1,
        scale: 8,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return `/qrcodes/${fileName}.png`;
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw new Error('Failed to generate QR code');
    }
  }

  async getQrCodeUrl(inventoryNumber: string): Promise<string> {
    const fileName = `inventory-${inventoryNumber}`;
    const filePath = path.join(this.qrCodeDir, `${fileName}.png`);
    
    if (!fs.existsSync(filePath)) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const qrData = `${frontendUrl}/inventory/qr/${inventoryNumber}`;
      return this.generateQrCode(qrData, fileName);
    }
    
    return `/qrcodes/${fileName}.png`;
  }
}
