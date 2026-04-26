import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const hospital_registerSchema = new Schema({
    hospital_name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    phone_number: {
        type: String,
        required: true,
        trim: true,
    },
    hospital_image: {
        type: String,
    },
    specialities: {
        type: [String],
        default: [],
    },
    // Admin credentials
    admin_email: {
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
    // Hospital metadata (matches frontend mock data structure)
    rating: {
        type: Number,
        default: 4.0,
    },
    totalRatings: {
        type: Number,
        default: 0,
    },
    distance: {
        type: String,
        default: "2.0 km",
    },
    estimatedTime: {
        type: String,
        default: "20 min",
    },
    openNow: {
        type: Boolean,
        default: true,
    },
    promoted: {
        type: Boolean,
        default: false,
    },
    accreditations: {
        type: [String],
        default: [],
    },
    facilities: {
        type: [String],
        default: [],
    },
    insurancePartners: {
        type: [String],
        default: [],
    },
    workingHours: {
        type: Map,
        of: String,
        default: {},
    },
    reviews: [{
        name: String,
        rating: Number,
        date: String,
        comment: String,
    }],
    refreshToken: {
        type: String,
    },
}, { timestamps: true })


hospital_registerSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

hospital_registerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

hospital_registerSchema.methods.generateAccessTokens = function () {
    return jwt.sign({
        _id: this._id,
        email: this.admin_email,
        hospital_name: this.hospital_name,
        role: "hospital",
    },
        process.env.ACCESS_TOKEN_SECRET.trim(),
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY.trim(),
        }
    )
}

hospital_registerSchema.methods.generateRefreshTokens = function () {
    return jwt.sign({
        _id: this._id,
        role: "hospital",
    },
        process.env.REFRESH_TOKEN_SECRET.trim(),
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY.trim(),
        }
    )
}
export const Hospital = mongoose.model("Hospital", hospital_registerSchema)