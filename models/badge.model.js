import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    shieldUrl: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
