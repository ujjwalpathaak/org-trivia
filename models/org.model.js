import mongoose from 'mongoose';

const orgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  questionsPnA: {
    type: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        isUsed: {
          type: Boolean,
          default: false,
        },
        category: {
          type: String,
          enum: ['BloodRelation', 'Direction', 'Analytical', 'Arithmetic'],
          required: true,
          default: 'PnA',
        },
      },
    ],
    default: [],
  },
  questionsHRD: {
    type: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
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
    ],
    default: [],
  },
  questionsCAnIT: {
    type: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        isUsed: {
          type: Boolean,
          default: false,
        },
        category: {
          type: String,
        },
      },
    ],
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
