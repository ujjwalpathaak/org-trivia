import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
    // need to add fields
}, { timestamps: true });

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

export default Leaderboard;