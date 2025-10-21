import {MongoClient} from "mongodb";

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/survey-website';

async function resetDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Get database name from URI
    const dbName = MONGODB_URI.includes('mongodb.net')
      ? 'clasbridge' // Use new name for Atlas
      : MONGODB_URI.split('/').pop().split('?')[0]; // Extract from local URI

    const db = client.db(dbName);

    console.log(`Dropping database: ${dbName}`);

    // Drop the entire database
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

// Run the reset
resetDatabase();