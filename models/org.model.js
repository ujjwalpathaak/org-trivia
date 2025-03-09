import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const orgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  questionsPnA: {
    type: [questionSchema],
    default: [],
  },
  questionsHRD: {
    type: [questionSchema],
    default: [],
  },
  questionsCAnIT: {
    type: [questionSchema],
    default: [],
  },
  admins: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admins' }],
    default: [],
  },
  employees: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employees' }],
    default: [],
  },
  settings: {
    type: {
      isTriviaEnabled: { type: Boolean, default: false },
      currentGenre: { type: Number, default: 0, min: 0, max: 3 },
      selectedGenre: { type: [String], default: ['PnA', 'HRD', 'CAnIT'] },
    },
    default: () => ({
      isTriviaEnabled: false,
      currentGenre: 0,
      selectedGenre: ['PnA', 'HRD', 'CAnIT'],
    }),
  },
});

const Org = mongoose.model('Org', orgSchema);

export default Org;
