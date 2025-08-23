import { Pool } from 'pg';
import Redis from 'ioredis';
import config from './index';

// PostgreSQL Database Configuration
export const createPostgreSQLPool = (): Pool => {
  const pool = new Pool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err);
  });

  return pool;
};

// Redis Configuration
export const createRedisClient = (): Redis => {
  const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on('error', (err: Error) => {
    console.error('Redis error:', err);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  return redis;
};

// Database Schema Initialization
export const initializeDatabase = async (pool: Pool): Promise<void> => {
  try {
    console.log('🔄 Initializing database schema...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_address VARCHAR(66) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE,
        email VARCHAR(255) UNIQUE,
        profile_image_url TEXT,
        bio TEXT,
        social_links JSONB DEFAULT '{}',
        reputation_score INTEGER DEFAULT 0,
        total_events_attended INTEGER DEFAULT 0,
        total_validations_received INTEGER DEFAULT 0,
        total_certificates_earned INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation_score DESC);
    `);

    // Create events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        location TEXT NOT NULL,
        organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        max_attendees INTEGER DEFAULT 100,
        registration_fee DECIMAL(10, 2) DEFAULT 0,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        requires_approval BOOLEAN DEFAULT false,
        validation_window_hours INTEGER DEFAULT 72,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
      CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
      CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
    `);

    // Create event_registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        registration_status VARCHAR(20) DEFAULT 'registered',
        checked_in BOOLEAN DEFAULT false,
        check_in_time TIMESTAMP WITH TIME ZONE,
        check_in_location TEXT,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
      CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_registrations_status ON event_registrations(registration_status);
    `);

    // Create peer_validations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS peer_validations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        validator_id UUID REFERENCES users(id) ON DELETE CASCADE,
        validated_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        validation_type VARCHAR(50) DEFAULT 'attendance',
        validation_message TEXT,
        is_verified BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, validator_id, validated_user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_validations_event ON peer_validations(event_id);
      CREATE INDEX IF NOT EXISTS idx_validations_validator ON peer_validations(validator_id);
      CREATE INDEX IF NOT EXISTS idx_validations_validated_user ON peer_validations(validated_user_id);
    `);

    // Create certificates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        tier VARCHAR(20) NOT NULL CHECK (tier IN ('Bronze', 'Silver', 'Gold')),
        token_id BIGINT,
        transaction_hash VARCHAR(100),
        is_minted BOOLEAN DEFAULT false,
        mint_transaction_hash VARCHAR(100),
        metadata_url TEXT,
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        minted_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(event_id, user_id, tier)
      );
      
      CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
      CREATE INDEX IF NOT EXISTS idx_certificates_event ON certificates(event_id);
      CREATE INDEX IF NOT EXISTS idx_certificates_tier ON certificates(tier);
      CREATE INDEX IF NOT EXISTS idx_certificates_minted ON certificates(is_minted);
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT false,
        is_sent BOOLEAN DEFAULT false,
        send_email BOOLEAN DEFAULT true,
        email_sent BOOLEAN DEFAULT false,
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        scheduled_for TIMESTAMP WITH TIME ZONE,
        sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for);
    `);

    // Create job_queue table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_type VARCHAR(100) NOT NULL,
        job_data JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
        priority INTEGER DEFAULT 5,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_queue(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_type ON job_queue(job_type);
      CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON job_queue(scheduled_for);
      CREATE INDEX IF NOT EXISTS idx_jobs_priority ON job_queue(priority DESC);
    `);

    // Create file_uploads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_id VARCHAR(100) UNIQUE NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_url TEXT NOT NULL,
        thumbnail_url TEXT,
        mime_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
        upload_category VARCHAR(50) DEFAULT 'general',
        is_public BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_uploads_file_id ON file_uploads(file_id);
      CREATE INDEX IF NOT EXISTS idx_uploads_user ON file_uploads(uploaded_by);
      CREATE INDEX IF NOT EXISTS idx_uploads_category ON file_uploads(upload_category);
      CREATE INDEX IF NOT EXISTS idx_uploads_public ON file_uploads(is_public);
    `);

    // Create analytics_events table for tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB DEFAULT '{}',
        session_id VARCHAR(100),
        ip_address INET,
        user_agent TEXT,
        referrer TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
    `);

    // Create updated_at trigger function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    const tablesWithUpdatedAt = ['users', 'events', 'job_queue'];
    for (const table of tablesWithUpdatedAt) {
      await pool.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
};

// Check database connection
export const checkDatabaseConnection = async (pool: Pool): Promise<boolean> => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ PostgreSQL connected successfully at:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    return false;
  }
};

// Check Redis connection
export const checkRedisConnection = async (redis: Redis): Promise<boolean> => {
  try {
    await redis.ping();
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
};

// Create database connection instances
export const db = createPostgreSQLPool();
export const redis = createRedisClient();
