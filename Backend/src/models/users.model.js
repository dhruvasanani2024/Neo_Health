import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname:{
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String,
        default: "",  // Not required — NeoHealth doesn't need mandatory Cloudinary avatar
    },
    phone: {
        type: String,
        default: "",
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
}, {timestamps: true})


UserSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// NOT async — jwt.sign() is synchronous; calling async without await returns a Promise object (bug!)
UserSchema.methods.generateAccessTokens = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            role: "user",
        },
        process.env.ACCESS_TOKEN_SECRET.trim(),
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY.trim(),
        }
    )
}

UserSchema.methods.generateRefreshTokens = function() {
    return jwt.sign(
        {
            _id: this._id,
            role: "user",
        },
        process.env.REFRESH_TOKEN_SECRET.trim(),
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY.trim(),
        }
    )
}

export const User = mongoose.model("User", UserSchema)