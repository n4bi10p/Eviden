import { Router, Request, Response } from 'express';
import { fileUploadService, FileUploadOptions } from '../services/FileUploadService';
import { authenticateToken } from '../middleware/auth';
import { RateLimiter } from '../middleware/rateLimit';

const router = Router();

// Upload file middleware with rate limiting
const uploadLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 uploads per window
  message: 'Too many upload attempts. Try again later.'
}).middleware;

// Upload single file
router.post('/upload', uploadLimiter, authenticateToken, async (req: Request, res: Response) => {
  try {
    const options: FileUploadOptions = {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      generateThumbnail: true,
      thumbnailSize: { width: 300, height: 300 }
    };

    const uploader = fileUploadService.getMulterConfig(options);
    
    uploader.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          error: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }

      // Validate file
      const validationError = fileUploadService.validateFile(req.file, options);
      if (validationError) {
        await fileUploadService.deleteFile(req.file.path);
        return res.status(400).json({ 
          success: false, 
          error: validationError 
        });
      }

      try {
        const uploadedFile = await fileUploadService.processUploadedFile(
          req.file, 
          req.user?.id || 'anonymous', 
          options
        );

        res.json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            fileId: uploadedFile.id,
            fileName: uploadedFile.fileName,
            originalName: uploadedFile.originalName,
            url: uploadedFile.url,
            thumbnailUrl: uploadedFile.thumbnailUrl,
            size: uploadedFile.size,
            mimeType: uploadedFile.mimeType
          }
        });
      } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to process uploaded file' 
        });
      }
    });
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Upload failed' 
    });
  }
});

// Upload event image
router.post('/upload/event', uploadLimiter, authenticateToken, async (req: Request, res: Response) => {
  try {
    const options: FileUploadOptions = {
      maxSize: 10 * 1024 * 1024, // 10MB for event images
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      generateThumbnail: true,
      thumbnailSize: { width: 600, height: 400 }
    };

    const uploader = fileUploadService.getMulterConfig(options);
    
    uploader.single('eventImage')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          error: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No event image uploaded' 
        });
      }

      try {
        const uploadedFile = await fileUploadService.processUploadedFile(
          req.file, 
          req.user?.id || 'anonymous', 
          options
        );

        res.json({
          success: true,
          message: 'Event image uploaded successfully',
          data: {
            fileId: uploadedFile.id,
            url: uploadedFile.url,
            thumbnailUrl: uploadedFile.thumbnailUrl
          }
        });
      } catch (error) {
        console.error('Event image upload error:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to upload event image' 
        });
      }
    });
  } catch (error) {
    console.error('Event image upload route error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Event image upload failed' 
    });
  }
});

// Upload profile image
router.post('/upload/profile', uploadLimiter, authenticateToken, async (req: Request, res: Response) => {
  try {
    const options: FileUploadOptions = {
      maxSize: 3 * 1024 * 1024, // 3MB for profile images
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      generateThumbnail: true,
      thumbnailSize: { width: 200, height: 200 }
    };

    const uploader = fileUploadService.getMulterConfig(options);
    
    uploader.single('profileImage')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          error: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No profile image uploaded' 
        });
      }

      try {
        const uploadedFile = await fileUploadService.processUploadedFile(
          req.file, 
          req.user?.id || 'anonymous', 
          options
        );

        res.json({
          success: true,
          message: 'Profile image uploaded successfully',
          data: {
            fileId: uploadedFile.id,
            url: uploadedFile.url,
            thumbnailUrl: uploadedFile.thumbnailUrl
          }
        });
      } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to upload profile image' 
        });
      }
    });
  } catch (error) {
    console.error('Profile image upload route error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Profile image upload failed' 
    });
  }
});

// Get file by ID
router.get('/file/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const file = await fileUploadService.getFileById(fileId);

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get file information' 
    });
  }
});

// Get user's files
router.get('/my-files', authenticateToken, async (req: Request, res: Response) => {
  try {
    const files = await fileUploadService.getFilesByUser(req.user?.id || 'anonymous');

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user files' 
    });
  }
});

// Delete file
router.delete('/file/:fileId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    
    // Check if file belongs to user (implement ownership check)
    const file = await fileUploadService.getFileById(fileId);
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }

    if (file.uploadedBy !== req.user?.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only delete your own files' 
      });
    }

    const deleted = await fileUploadService.deleteFileById(fileId);

    if (deleted) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete file' 
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete file' 
    });
  }
});

// Get upload statistics (admin only)
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin check
    const stats = await fileUploadService.getUploadStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get upload stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get upload statistics' 
    });
  }
});

// Health check for file upload service
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'File upload service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
