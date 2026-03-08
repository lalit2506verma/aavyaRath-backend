const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME
    });

    console.log(`MongoDB connected: ${conn.connection.host}/${process.env.DB_NAME}`);
  } catch (error) {
    console.log('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;