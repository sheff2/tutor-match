import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutor-match');
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Server will continue without database connection.');
    console.warn('   Authentication will not work until MongoDB is connected.');
    console.warn('   Install MongoDB locally or use MongoDB Atlas (cloud).');
    // Don't exit - allow server to run without DB for development
  }
};
