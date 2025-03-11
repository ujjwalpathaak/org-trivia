import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    earnedAt: {
      type: Date,
      default: new Date(),
      required: true,
    }
  },
  { _id: false },
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
    lastQuizScore: {
      type: Number,
      default: 0,
    },
    lastQuizDate: {
      type: Date,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    role: {
      type: String,
      default: 'Employee',
      enum: ['Employee'],
      immutable: true,
    },
    badges: {
      type: [badgeSchema],
      default: [],
    },
    submittedQuestion: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
      default: [],
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      immutable: true,
      required: true,
    },
    isQuizGiven: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
