import mongoose from "mongoose";

const orgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  questions: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: []
  },
  admins: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admins",
      default: []
  },
  employees: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Employees",
    default: []
  },
});

const Org = mongoose.model("Org", orgSchema);

export default Org;
