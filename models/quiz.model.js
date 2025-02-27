import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      required: true,
    },
    questions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Questions',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
