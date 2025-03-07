import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['AI', 'Employee', 'Admin'],
      immutable: true,
      required: true,
      default: 'AI',
    },
    category: {
      type: String,
      enum: ['CCnHnFF', 'CAnIT', 'HRD', 'PnA'],
      immutable: true,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    question: {
      type: String,
      trim: true,
      required: true,
    },
    answer: {
      type: Number,
      required: true,
      immutable: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 4;
        },
        message: 'Options array must have exactly 4 items.',
      },
    },
    status: {
      type: String,
      enum: ['done', 'extra', 'live'],
      required: true,
      default: 'extra',
    },
    config: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

const weeklyQuestionSchema = new mongoose.Schema(
  {
    isApproved: {
      type: Boolean,
      required: true,
      default: false,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    question: questionSchema,
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      immutable: true,
      required: true,
    },
  },
  { timestamps: true },
);

const WeeklyQuestion = mongoose.model('WeeklyQuestion', weeklyQuestionSchema);

export default WeeklyQuestion;
