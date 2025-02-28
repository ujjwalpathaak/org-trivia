import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  isTriviaEnabled: { type: Boolean, default: false },
  currentGenre: { type: Number, default: 0, min: 0, max: 3 },
  selectedGenre: { type: [String], default: ['PnA', 'HRD', 'CAnIT'] },
});

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
    type: settingsSchema,
    default: () => ({}),
  },
});

const Org = mongoose.model('Org', orgSchema);

export default Org;
