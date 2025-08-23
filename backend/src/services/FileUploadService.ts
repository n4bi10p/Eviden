import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import config from '../config';

// File upload types
export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  thumbnailSize?: { width: number; height: number };
}

export class FileUploadService {
  private uploadDir: string;
  private allowedImageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  constructor() {
    this.uploadDir = path.resolve(config.UPLOAD_DIR);
    this.initializeUploadDirectory();
  }

  private async initializeUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      await fs.mkdir(this.uploadDir, { recursive: true });
      console.log(`✅ Created upload directory: ${this.uploadDir}`);
    }

    // Create subdirectories
    const subdirs = ['events', 'profiles', 'certificates', 'thumbnails'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(this.uploadDir, subdir);
      try {
        await fs.access(subdirPath);
      } catch (error) {
        await fs.mkdir(subdirPath, { recursive: true });
      }
    }
  }

  // Configure multer for file uploads
  getMulterConfig(options: FileUploadOptions = {}): multer.Multer {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        // Determine subdirectory based on field name or request path
        let subdir = 'events'; // default
        if (file.fieldname.includes('profile')) subdir = 'profiles';
        if (file.fieldname.includes('certificate')) subdir = 'certificates';
        if (req.path.includes('profile')) subdir = 'profiles';
        
        const uploadPath = path.join(this.uploadDir, subdir);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
        cb(null, fileName);
      }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedTypes = options.allowedTypes || this.allowedImageTypes;
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: options.maxSize || config.MAX_FILE_SIZE
      }
    });
  }

  // Process uploaded file and create database record
  async processUploadedFile(
    file: Express.Multer.File, 
    uploadedBy: string, 
    options: FileUploadOptions = {}
  ): Promise<UploadedFile> {
    try {
      const fileId = this.generateFileId();
      const fileUrl = this.getFileUrl(file.filename, file.destination);
      
      const uploadedFile: UploadedFile = {
        id: fileId,
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
        uploadedAt: new Date(),
        uploadedBy
      };

      // Generate thumbnail for images
      if (options.generateThumbnail && this.isImage(file.mimetype)) {
        uploadedFile.thumbnailUrl = await this.generateThumbnail(
          file.path, 
          file.filename,
          options.thumbnailSize || { width: 300, height: 300 }
        );
      }

      // TODO: Save to database
      await this.saveFileRecord(uploadedFile);

      console.log(`✅ File processed successfully: ${file.originalname}`);
      return uploadedFile;
    } catch (error) {
      console.error('❌ Error processing uploaded file:', error);
      // Clean up file if processing failed
      await this.deleteFile(file.path);
      throw error;
    }
  }

  // Generate thumbnail for images
  private async generateThumbnail(
    originalPath: string, 
    originalFilename: string,
    size: { width: number; height: number }
  ): Promise<string> {
    try {
      const thumbnailDir = path.join(this.uploadDir, 'thumbnails');
      const thumbnailFilename = `thumb_${originalFilename}`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

      await sharp(originalPath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return this.getFileUrl(thumbnailFilename, thumbnailDir);
    } catch (error) {
      console.error('❌ Error generating thumbnail:', error);
      throw error;
    }
  }

  // Get file URL
  private getFileUrl(filename: string, directory: string): string {
    const relativePath = path.relative(this.uploadDir, path.join(directory, filename));
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }

  // Check if file is an image
  private isImage(mimeType: string): boolean {
    return this.allowedImageTypes.includes(mimeType);
  }

  // Generate unique file ID
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save file record to database (mock for now)
  private async saveFileRecord(file: UploadedFile): Promise<void> {
    // TODO: Implement database storage
    // For now, save to a JSON file as backup
    try {
      const recordsFile = path.join(this.uploadDir, 'file_records.json');
      let records: UploadedFile[] = [];
      
      try {
        const data = await fs.readFile(recordsFile, 'utf-8');
        records = JSON.parse(data);
      } catch (error) {
        // File doesn't exist, start with empty array
      }
      
      records.push(file);
      await fs.writeFile(recordsFile, JSON.stringify(records, null, 2));
    } catch (error) {
      console.error('❌ Error saving file record:', error);
    }
  }

  // Get file by ID
  async getFileById(fileId: string): Promise<UploadedFile | null> {
    try {
      const recordsFile = path.join(this.uploadDir, 'file_records.json');
      const data = await fs.readFile(recordsFile, 'utf-8');
      const records: UploadedFile[] = JSON.parse(data);
      return records.find(record => record.id === fileId) || null;
    } catch (error) {
      console.error('❌ Error getting file by ID:', error);
      return null;
    }
  }

  // Get files by user
  async getFilesByUser(userId: string): Promise<UploadedFile[]> {
    try {
      const recordsFile = path.join(this.uploadDir, 'file_records.json');
      const data = await fs.readFile(recordsFile, 'utf-8');
      const records: UploadedFile[] = JSON.parse(data);
      return records.filter(record => record.uploadedBy === userId);
    } catch (error) {
      console.error('❌ Error getting files by user:', error);
      return [];
    }
  }

  // Delete file
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      return false;
    }
  }

  // Delete file by ID
  async deleteFileById(fileId: string): Promise<boolean> {
    try {
      const file = await this.getFileById(fileId);
      if (!file) return false;

      // Delete physical file
      await this.deleteFile(file.filePath);
      
      // Delete thumbnail if exists
      if (file.thumbnailUrl) {
        const thumbnailPath = path.join(this.uploadDir, file.thumbnailUrl.replace('/uploads/', ''));
        await this.deleteFile(thumbnailPath);
      }

      // Remove from records
      const recordsFile = path.join(this.uploadDir, 'file_records.json');
      const data = await fs.readFile(recordsFile, 'utf-8');
      const records: UploadedFile[] = JSON.parse(data);
      const updatedRecords = records.filter(record => record.id !== fileId);
      await fs.writeFile(recordsFile, JSON.stringify(updatedRecords, null, 2));

      console.log(`✅ File deleted successfully: ${file.originalName}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting file by ID:', error);
      return false;
    }
  }

  // Validate file before upload
  validateFile(file: Express.Multer.File, options: FileUploadOptions = {}): string | null {
    // Check file size
    const maxSize = options.maxSize || config.MAX_FILE_SIZE;
    if (file.size > maxSize) {
      return `File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`;
    }

    // Check file type
    const allowedTypes = options.allowedTypes || this.allowedImageTypes;
    if (!allowedTypes.includes(file.mimetype)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Check filename
    if (!file.originalname || file.originalname.length > 255) {
      return 'Invalid filename';
    }

    return null; // Valid
  }

  // Get upload stats
  async getUploadStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    recentUploads: UploadedFile[];
  }> {
    try {
      const recordsFile = path.join(this.uploadDir, 'file_records.json');
      const data = await fs.readFile(recordsFile, 'utf-8');
      const records: UploadedFile[] = JSON.parse(data);

      const totalFiles = records.length;
      const totalSize = records.reduce((sum, file) => sum + file.size, 0);
      
      const filesByType = records.reduce((acc, file) => {
        acc[file.mimeType] = (acc[file.mimeType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentUploads = records
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, 10);

      return {
        totalFiles,
        totalSize,
        filesByType,
        recentUploads
      };
    } catch (error) {
      console.error('❌ Error getting upload stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        filesByType: {},
        recentUploads: []
      };
    }
  }

  // Clean up old files (older than specified days)
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const recordsFile = path.join(this.uploadDir, 'file_records.json');
      const data = await fs.readFile(recordsFile, 'utf-8');
      const records: UploadedFile[] = JSON.parse(data);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const filesToDelete = records.filter(
        record => new Date(record.uploadedAt) < cutoffDate
      );

      let deletedCount = 0;
      for (const file of filesToDelete) {
        const deleted = await this.deleteFileById(file.id);
        if (deleted) deletedCount++;
      }

      console.log(`🧹 Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up old files:', error);
      return 0;
    }
  }
}

export const fileUploadService = new FileUploadService();
