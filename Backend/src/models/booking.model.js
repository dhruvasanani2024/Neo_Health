import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    slotTime: {
        type: String,
        required: true,
    },
    appointmentType: {
        type: String,
        enum: ["virtual", "in-person"],
        default: "in-person",
    },
    patientType: {
        type: String,
        default: "normal",
    },
    patientName: {
        type: String,
        required: true,
    },
    fee: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["upcoming", "completed", "cancelled"],
        default: "upcoming",
    },
    date: {
        type: String,
        required: true,
    },
    prescription: [{
        medicine: String,
        dosage: String,
        days: Number,
        cost: Number,
    }],
}, { timestamps: true })

export const Booking = mongoose.model("Booking", bookingSchema)
