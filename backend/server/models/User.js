import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  badges: {
    type: [String],
    default: []
  }
});

const User = mongoose.model('User', userSchema);

export default User;