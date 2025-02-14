import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    // need to add fields
}, { timestamps: true });

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;