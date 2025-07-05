// lib/pinataUploader.ts - Enhanced Pinata upload utility
import { PinataSDK } from "pinata";

const pinataGateway = process.env.NEXT_PUBLIC_PAT_PET_PINATA_GATEWAY;

// Initialize Pinata SDK
const initializePinata = () => {
  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!pinataJwt) {
    throw new Error('PINATA_JWT environment variable is required');
  }

  if (!pinataGateway) {
    throw new Error('PINATA_GATEWAY environment variable is required');
  }

  return new PinataSDK({
    pinataJwt,
    pinataGateway,
  });
};

export interface EvidenceUploadResult {
  ipfsHash: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: number;
  gatewayUrl: string;
}

export class PinataEvidenceUploader {
  /**
   * Upload milestone evidence file to Pinata
   */
  static async uploadEvidenceFile(
    file: File,
    milestoneId: string,
    goalId: string,
    userAddress: string
  ): Promise<EvidenceUploadResult> {
    try {
      console.log('🚀 Starting evidence upload to Pinata...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        milestoneId,
        goalId,
      });

      // Validate file
      this.validateEvidenceFile(file);

      const pinata = initializePinata();

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `milestone_${milestoneId}_${timestamp}_${sanitizedName}`;

      console.log('📤 Uploading evidence file to Pinata...');

      // Upload file with comprehensive metadata
      const upload = await pinata.upload.public
        .file(file)
        .name(uniqueFileName)
        .keyvalues({
          type: 'milestone_evidence',
          milestone_id: milestoneId,
          goal_id: goalId,
          submitter: userAddress,
          file_type: file.type,
          file_size: file.size.toString(),
          original_name: file.name,
          uploaded_at: timestamp.toString(),
          version: '1.0.0',
        });

      console.log('✅ Pinata upload successful:', upload);

      const ipfsHash = upload.cid;

      if (!ipfsHash) {
        throw new Error('No CID returned from Pinata SDK');
      }

      const result: EvidenceUploadResult = {
        ipfsHash,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: timestamp,
        gatewayUrl: `${pinataGateway}/ipfs/${ipfsHash}`,
      };

      console.log('✅ Evidence uploaded successfully:', result);

      return result;

    } catch (error) {
      console.error('❌ Failed to upload evidence to Pinata:', error);
      throw error;
    }
  }

  /**
   * Validate evidence file before upload
   */
  private static validateEvidenceFile(file: File) {
    // Maximum file size: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File size too large. Maximum allowed: 10MB`);
    }

    // Allowed file types
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/webm',
      'video/mov',
      'video/avi',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      // Archives
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type not supported. Allowed types: Images, Videos, PDFs, Documents`);
    }

    // Minimum file size: 1KB
    if (file.size < 1024) {
      throw new Error('File too small. Minimum size: 1KB');
    }
  }

  /**
   * Get evidence file from IPFS
   */
  static async getEvidenceFile(ipfsHash: string) {
    try {
      const pinata = initializePinata();
      const data = await pinata.gateways.public.get(ipfsHash);
      return data;
    } catch (error) {
      console.warn('⚠️ Pinata SDK fetch failed, falling back to direct gateway');
      
      const response = await fetch(`${pinataGateway}/ipfs/${ipfsHash}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch evidence: ${response.statusText}`);
      }
      return response.blob();
    }
  }

  /**
   * Generate evidence preview URL
   */
  static getEvidencePreviewUrl(ipfsHash: string): string {
    return `${pinataGateway}/ipfs/${ipfsHash}`;
  }

  /**
   * Check if file type is image for preview
   */
  static isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  /**
   * Check if file type is video for preview
   */
  static isVideoFile(fileType: string): boolean {
    return fileType.startsWith('video/');
  }

  /**
   * Get file type icon emoji
   */
  static getFileTypeIcon(fileType: string): string {
    if (this.isImageFile(fileType)) return '🖼️';
    if (this.isVideoFile(fileType)) return '🎥';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('zip')) return '📦';
    if (fileType.includes('text')) return '📃';
    return '📎';
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}




