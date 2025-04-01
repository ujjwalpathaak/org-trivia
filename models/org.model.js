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
      default: null,
    },
    file: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      enum: ['AI', 'Employee'],
      required: true,
      default: 'AI',
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
      companyCurrentAffairsTimeline: {
        type: Number,
        default: 4,
        min: 1,
        max: 4,
      },
      currentGenre: { type: Number, default: 0, min: 0, max: 3 },
      unavailableGenre: {
        type: [String],
        default: ['PnA', 'HRD', 'CAnIT'],
        set: (arr) => [...new Set(arr)],
      },
      selectedGenre: {
        type: [String],
        default: ['PnA', 'HRD', 'CAnIT'],
        set: function (arr) {
          return arr.filter((genre) => !this.unavailableGenre.includes(genre));
        },
      },
    },
    default: () => ({
      isTriviaEnabled: false,
      currentGenre: 0,
      selectedGenre: ['PnA', 'HRD', 'CAnIT'],
      unavailableGenre: [],
    }),
  },
});

// Middleware to update selectedGenre before saving
orgSchema.pre('save', function (next) {
  if (this.settings) {
    this.settings.unavailableGenre = [
      ...new Set(this.settings.unavailableGenre),
    ];
    this.settings.selectedGenre = this.settings.selectedGenre.filter(
      (genre) => !this.settings.unavailableGenre.includes(genre),
    );
  }
  next();
});

const Org = mongoose.model('Org', orgSchema);

export default Org;
