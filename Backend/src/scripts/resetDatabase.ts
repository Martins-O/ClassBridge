import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_URI = 'mongodb://localhost:27017/survey-website';
const MONGODB_URI = process.env.MONGODB_URI ?? DEFAULT_URI;

async function resetDatabase(): Promise<void> {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const dbName = MONGODB_URI.includes('mongodb.net')
      ? 'clasbridge'
      : MONGODB_URI.split('/').pop()?.split('?')[0] ?? 'survey-website';

    const db = client.db(dbName);

    console.log(`Dropping database: ${dbName}`);
    await db.dropDatabase();

    console.log('Database dropped successfully!');
    console.log('Database has been reset and is ready for fresh data.');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

void resetDatabase();
