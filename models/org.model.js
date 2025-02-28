import mongoose from 'mongoose';

const orgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  questions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Question',
    default: [],
  },
  admins: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Admins',
    default: [],
  },
  employees: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Employees',
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
