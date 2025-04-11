import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    default: 'Admin',
    enum: ['Admin'],
    immutable: true,
  },
  password: {
    type: String,
    required: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
    immutable: true,
    required: true,
  },
},{
  timestamps: false,
  versionKey: false,
});

adminSchema.pre('save', function (next) {
  if (!this.isNew) {
    if (this.isModified('role')) {
      return next(new Error('Role cannot be changed'));
    }
    if (this.isModified('orgId')) {
      return next(new Error('Organization ID cannot be changed'));
    }
  }
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
