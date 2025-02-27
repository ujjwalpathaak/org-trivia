import mongoose from 'mongoose';

const earnedBadgeSchema = new mongoose.Schema(
  {
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
    },
  },
  { timestamps: true },
);

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    currentPoints: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: 'Employee',
      enum: ['Employee'],
      immutable: true,
    },
    badges: {
      type: [earnedBadgeSchema],
      default: [],
    },
    submittedQuestion: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'usedQuestion',
      default: [],
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      immutable: true,
      required: true,
    },
  },
  { timestamps: true },
);

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
