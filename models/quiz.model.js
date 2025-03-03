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
    genre: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Quiz = mongoose.model('Quiz', quizSchema, 'quizzes');

export default Quiz;
