import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    id: {
        type: UUID,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    current_streak: {
        type: Number, // no. of days
        default: 0
    },
    current_points: {
        type: Number,
        default: 0
    },
    badges: {
        type: [Object],
        default: []
    },
    submitted_question: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;