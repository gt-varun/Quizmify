import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  full_name: {
    type: String,
    trim: true,
  },
  age_category: {
    type: String,
    enum: ['under-18', '18-25', '26-35', '36-50', '50+', ''],
    default: '',
  },
  resetOTP: {
    type: String,
    default: null,
  },
  resetOTPExpiry: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toProfile = function () {
  return {
    id: this._id,
    email: this.email,
    full_name: this.full_name,
    age_category: this.age_category,
  };
};

export default mongoose.model('User', userSchema);
