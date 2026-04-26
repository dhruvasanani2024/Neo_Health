import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const doctorSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    specialty: {
        type: String,
        required: true,
        trim: true,
    },
    qualification: {
        type: String,
        default: "",
    },
    experience: {
        type: String,
        default: "",
    },
    rating: {
        type: Number,
        default: 4.0,
    },
    totalRatings: {
        type: Number,
        default: 0,
    },
    fee: {
        type: Number,
        required: true,
    },
    virtualFee: {
        type: Number,
        default: 0,
    },
    offersVirtual: {
        type: Boolean,
        default: false,
    },
    languages: {
        type: [String],
        default: ["English"],
    },
    education: {
        type: [String],
        default: [],
    },
    about: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    available: {
        type: Boolean,
        default: true,
    },
    nextAvailable: {
        type: String,
        default: "Today",
    },
    slots: {
        type: [String],
        default: [],
    },
    virtualSlots: {
        type: [String],
        default: [],
    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    refreshToken: {
        type: String,
    },
}, { timestamps: true })


doctorSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

doctorSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

doctorSchema.methods.generateAccessTokens = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        role: "doctor",
    },
        process.env.ACCESS_TOKEN_SECRET.trim(),
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY.trim(),
        }
    )
}

doctorSchema.methods.generateRefreshTokens = function () {
    return jwt.sign({
        _id: this._id,
        role: "doctor",
    },
        process.env.REFRESH_TOKEN_SECRET.trim(),
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY.trim(),
        }
    )
}

export const Doctor = mongoose.model("Doctor", doctorSchema)
