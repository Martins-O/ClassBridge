import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/survey-website';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

declare global {
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  } | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    if (!cached) {
      cached = global.mongoose = { conn: null, promise: null };
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    if (cached) {
      cached.conn = await cached.promise;
    }
  } catch (e) {
    if (cached) {
      cached.promise = null;
    }
    throw e;
  }

  return cached?.conn;
}

export async function withTransaction<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const connection = mongoose.connection;
  
  if (!connection) {
    throw new Error('Database connection not established');
  }

  const session = await connection.startSession();
  
  try {
    let result: T;
    
    try {
      await session.withTransaction(async () => {
        result = await operation(session);
      }, {
        readPreference: 'primary',
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' }
      });
    } catch (transactionError: any) {
      // Fallback for standalone MongoDB instances (no replica set)
      const isStandalone = 
        transactionError.message.includes('replSet') || 
        transactionError.message.includes('replica set') ||
        transactionError.code === 20 || // IllegalOperation
        transactionError.codeName === 'CommandNotFound';

      if (isStandalone) {
        console.warn('MongoDB Transactions not supported (Standalone mode). Falling back to non-transactional execution.');
        result = await operation(session);
      } else {
        throw transactionError;
      }
    }
    
    return result!;
  } finally {
    await session.endSession();
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
}

export default connectDB;