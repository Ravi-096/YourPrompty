import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  userId:       { type: String, required: true, unique: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, select: false },
  profilePhoto: { type: String, default: null }, // S3 URL
  bio:          { type: String, default: '' },
  followers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified:   { type: Boolean, default: false },
}, { timestamps: true });

// Hash password before save

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);