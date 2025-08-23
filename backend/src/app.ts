import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './config';
import { RedisService } from './services/RedisService';
import { db, initializeDatabase } from './config/database';
import { errorHandler, notFoundHandler, handleUnhandledRejection, handleUncaughtException } from './middleware/errorHandler';
import { generalRateLimit } from './middleware/rateLimit';

// Import routes
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import certificateRoutes from './routes/certificates';
import userRoutes from './routes/users';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/uploads';

// Import services
import { JobService } from './services/JobService';
import { emailService } from './services/EmailService';
import { fileUploadService } from './services/FileUploadService';

// Initialize error handlers
handleUnhandledRejection();
handleUncaughtException();

class App {
  public app: express.Application;
  public server: any;
  public io!: SocketIOServer;
  private redis: RedisService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.redis = RedisService.getInstance();
    
    this.initializeSocketIO();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeSocketIO(): void {
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Socket.IO middleware for authentication
    this.io.use((socket, next) => {
      // Add authentication logic here if needed
      next();
    });

    // Socket.IO connection handling
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Join user-specific room for notifications
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined their notification room`);
      });

      // Join event-specific room for real-time updates
      socket.on('join-event-room', (eventId: string) => {
        socket.join(`event:${eventId}`);
        console.log(`Socket ${socket.id} joined event room: ${eventId}`);
      });

      // Leave event room
      socket.on('leave-event-room', (eventId: string) => {
        socket.leave(`event:${eventId}`);
        console.log(`Socket ${socket.id} left event room: ${eventId}`);
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      });
    });
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Request logging
    if (config.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    this.app.use('/api/', generalRateLimit.middleware);

    // Static file serving
    this.app.use('/uploads', express.static('uploads'));

    // Health check endpoint (before rate limiting)
    this.app.get('/health', async (req, res) => {
      try {
        const checks = {
          server: true,
          database: await this.checkDatabaseHealth(),
          redis: await this.redis.healthCheck(),
          timestamp: new Date().toISOString(),
        };

        const isHealthy = Object.values(checks).every(check => 
          typeof check === 'boolean' ? check : true
        );

        res.status(isHealthy ? 200 : 503).json({
          status: isHealthy ? 'healthy' : 'unhealthy',
          checks,
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          error: 'Health check failed',
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  private initializeRoutes(): void {
    // Register API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/events', eventRoutes);
    this.app.use('/api/certificates', certificateRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/notifications', notificationRoutes);
    this.app.use('/api/uploads', uploadRoutes);

    // Serve uploaded files statically
    this.app.use('/uploads', express.static('uploads'));

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Attestify API',
        version: '1.0.0',
        description: 'Blockchain-based attendance verification system',
        environment: config.NODE_ENV,
        endpoints: {
          authentication: '/api/auth',
          events: '/api/events',
          certificates: '/api/certificates',
          users: '/api/users',
          notifications: '/api/notifications',
          uploads: '/api/uploads'
        },
        health: '/health',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      if (config.NODE_ENV !== 'production' && process.env.REQUIRE_DB !== 'true') {
        return true; // Skip check in development
      }
      const client = await db.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting Attestify Backend Server...');
      console.log(`🔍 NODE_ENV: "${config.NODE_ENV}"`);
      console.log(`🔍 process.env.NODE_ENV: "${process.env.NODE_ENV}"`);
      console.log(`🔍 REQUIRE_DB: "${process.env.REQUIRE_DB}"`);

      // Initialize database connection (optional in development)
      if (config.NODE_ENV === 'production' || process.env.REQUIRE_DB === 'true') {
        console.log('📦 Connecting to PostgreSQL...');
        await initializeDatabase(db);
        console.log('✅ PostgreSQL connected successfully');
      } else {
        console.log('⚠️  Skipping PostgreSQL connection in development mode');
      }

      // Initialize Redis connection (optional in development)
      if (config.NODE_ENV === 'production' || process.env.REQUIRE_REDIS === 'true') {
        console.log('🔄 Connecting to Redis...');
        await this.redis.connect();
        console.log('✅ Redis connected successfully');
      } else {
        console.log('⚠️  Skipping Redis connection in development mode');
      }

      // Initialize background job service
      if (config.NODE_ENV === 'production' || process.env.REQUIRE_JOBS === 'true') {
        console.log('⚙️  Starting background job service...');
        const jobService = new JobService();
        await jobService.start();
        console.log('✅ Background job service started');
      } else {
        console.log('⚠️  Skipping background jobs in development mode');
      }

      // Test email service configuration
      if (config.EMAIL_USER && config.EMAIL_PASSWORD) {
        console.log('📧 Testing email configuration...');
        const emailTestResult = await emailService.testEmailConfiguration();
        if (emailTestResult) {
          console.log('✅ Email service configured successfully');
        } else {
          console.log('⚠️  Email service configuration test failed');
        }
      } else {
        console.log('⚠️  Email service not configured (missing credentials)');
      }

      // Start the server
      this.server.listen(config.PORT, () => {
        console.log(`🌟 Server running on port ${config.PORT}`);
        console.log(`🌍 Environment: ${config.NODE_ENV}`);
        console.log(`🔗 API Base URL: http://localhost:${config.PORT}/api`);
        console.log(`📡 Socket.IO enabled for real-time communication`);
        
        if (config.NODE_ENV === 'development') {
          console.log(`🔧 Development mode - detailed logging enabled`);
          console.log(`💡 To enable database: set REQUIRE_DB=true`);
          console.log(`💡 To enable Redis: set REQUIRE_REDIS=true`);
          console.log(`💡 To enable background jobs: set REQUIRE_JOBS=true`);
          console.log(`📁 File uploads directory: ${config.UPLOAD_DIR}`);
        }
      });

      // Graceful shutdown handling
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    console.log('🛑 Shutting down server gracefully...');

    try {
      // Close HTTP server
      await new Promise<void>((resolve) => {
        this.server.close(() => {
          console.log('✅ HTTP server closed');
          resolve();
        });
      });

      // Close Socket.IO
      this.io.close();
      console.log('✅ Socket.IO server closed');

      // Disconnect from Redis (if connected)
      if (this.redis.isClientConnected()) {
        await this.redis.disconnect();
        console.log('✅ Redis disconnected');
      }

      // Disconnect from database (if connected)
      try {
        await db.end();
        console.log('✅ Database disconnected');
      } catch (error) {
        console.log('⚠️  Database was not connected');
      }

      console.log('👋 Server shutdown complete');
      process.exit(0);

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start the application
const app = new App();
app.start().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

export default app;
