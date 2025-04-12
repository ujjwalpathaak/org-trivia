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
      default: Date.now,
      required: true,
    },
  },
  { _id: false },
);

const questionsSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    state: {
      type: String,
      enum: ['submitted', 'approved', 'rejected'],
      default: 'submitted',
      required: true,
    },
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
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    streak: {
      type: Number,
      default: 0,
    },
    score: {
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
      type: [badgeSchema],
      default: [],
    },
    submittedQuestions: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
      default: [],
    },
    questions: {
      type: [questionsSchema],
      default: [],
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      immutable: true,
      required: true,
    },
    quizGiven: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
