import mongoose from 'mongoose';

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
    multiplier: {
      type: {
        value: {
          type: Number,
          required: true,
          default: 1,
        },
        reason: {
          type: String,
          required: true,
        }
      },
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
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Badge',
          required: true,
          earnedAt: {
            type: Date,
            default: Date.now,
            required: true,
          },
        },
      ],
      default: [],
    },
    submittedQuestion: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'usedQuestion',
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
