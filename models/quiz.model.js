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
    },
  },
  { timestamps: true }
);

quizSchema.index({ orgId: 1, scheduledDate: 1 }, { unique: true });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
