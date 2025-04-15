import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v >= new Date().setHours(0, 0, 0, 0);
        },
        message: 'Scheduled date must be in the future.',
      },
    },
    questionGenerationDate: {
      type: Date,
      default: null,
    },
    questionGenerationTimeline: {
      type: Number,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
    ],
    status: {
      type: String,
      enum: [
        'upcoming',
        'scheduled',
        'suspended',
        'cancelled',
        'live',
        'expired',
      ],
      required: true,
      default: 'scheduled',
    },
    genre: {
      type: String,
      enum: ['PnA', 'CAnIT', 'HRP'],
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

quizSchema.pre('save', function (next) {
  if (this.genre === 'CAnIT' && this.scheduledDate) {
    const scheduled = new Date(this.scheduledDate);
    scheduled.setUTCDate(scheduled.getUTCDate() - 1);
    this.questionGenerationDate = new Date(
      Date.UTC(
        scheduled.getUTCFullYear(),
        scheduled.getUTCMonth(),
        scheduled.getUTCDate(),
      ),
    );
  } else {
    this.questionGenerationDate = null;
  }

  next();
});

const Quiz = mongoose.model('Quiz', quizSchema, 'quizzes');

export default Quiz;
