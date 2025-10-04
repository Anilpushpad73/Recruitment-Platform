import mongoose from 'mongoose';

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/recruitment_platform_dev';
const MAX_RETRIES = Number(process.env.DB_CONNECT_RETRIES || 3);
const RETRY_BASE_MS = 1500;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const connectDB = async (attempt = 0) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const rawUri = process.env.MONGODB_URI;
    const mongoUri = rawUri ? rawUri.trim() : (isProduction ? null : DEFAULT_LOCAL_URI);

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: false,
      // useNewUrlParser and useUnifiedTopology are defaults in modern mongoose
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    // event litseners for better error, disconnection, reconnection
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown if use cntr+c in terminel
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
      } catch (err) {
        console.error('Error closing MongoDB connection on SIGINT:', err);
      } finally {
        process.exit(0);
      }
    });

    return conn;
  } catch (error) {
    const nextAttempt = attempt + 1;
    console.error(`Database connection failed (attempt ${nextAttempt}):`, error.message);

    // Retry logic for transient errors (only in non-production or when URI provided)
    if (nextAttempt <= MAX_RETRIES && (process.env.NODE_ENV !== 'production')) {
      const delay = RETRY_BASE_MS * nextAttempt;
      console.log(`Retrying to connect in ${delay}ms (attempt ${nextAttempt}/${MAX_RETRIES})`);
      await sleep(delay);
      return connectDB(nextAttempt);
    }

    // In production, exit so platform (PM2, systemd, container) can restart
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting process due to failed DB connection in production.');
      process.exit(1);
    }

    // In development, throw so caller (nodemon) shows error but process can keep running on file changes
    throw error;
  }
};

export default connectDB;