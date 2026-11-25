const mongoose = require('mongoose');

module.exports = async () => {
  mongoose.set('strictQuery', true);
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizly';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`MongoDB connected (${mongoose.connection.name})`);
};
