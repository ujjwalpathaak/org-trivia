import mongoose from "mongoose";

const rankingSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const leaderboardSchema = new mongoose.Schema({
    rankings: {
        type: [rankingSchema],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });


const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

export default Leaderboard;