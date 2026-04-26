import asyncHandler from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userID) => {
    try {
        const user = await User.findById(userID);
        if (!user) throw new Error("User not found for token generation");

        // Debug: verify secrets are available
        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error("[TOKEN] ACCESS_TOKEN_SECRET is missing from env!");
            throw new Error("ACCESS_TOKEN_SECRET not configured");
        }

        const accessToken = user.generateAccessTokens();   // sync — returns string directly
        const refreshToken = user.generateRefreshTokens(); // sync — returns string directly

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("[TOKEN] Error generating tokens:", error.message, error.stack);
        throw new ApiError(500, `Something went wrong generating tokens: ${error.message}`)
    }
}

// ─── Register User ───────────────────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password, phone } = req.body

    if (!fullname || !email || !password) {
        throw new ApiError(400, "fullname, email, and password are required")
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { phone: phone ? phone : null }]
    })

    if (existedUser) {
        throw new ApiError(400, "User already exists with this email or phone number")
    }

    // Avatar upload is optional
    let avatarUrl = "";
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (avatarLocalPath) {
        const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
        if (avatarUpload) avatarUrl = avatarUpload.url;
    }

    const user = await User.create({
        avatar: avatarUrl,
        email,
        fullname,
        password,
        phone: phone || "",
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    // Auto-login: generate tokens right away
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, {
                user: createdUser,
                accessToken,
                refreshToken,
            }, "User registered successfully")
        )
})

// ─── Login User ───────────────────────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
    // Here 'email' field in req.body might actually contain a phone number or email string from the frontend.
    // The frontend can send the identifier as 'email' or a generic 'identifier' field. Let's check both or just 'email' & 'phone'.
    const identifier = req.body.email || req.body.phone || req.body.username; 

    if (!identifier) {
        throw new ApiError(400, "Email or phone number is required");
    }

    const password = req.body.password;

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            }, "User logged in successfully")
        )
})

// ─── Logout User ──────────────────────────────────────────────────────────────
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    )

    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

// ─── Get Profile ──────────────────────────────────────────────────────────────
const getUserProfile = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User profile fetched successfully")
    )
})

// ─── Refresh Access Token ─────────────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!incomingRefreshToken) {  // FIX: was inverted (if(token) instead of if(!token))
        throw new ApiError(401, "Unauthorized request — no refresh token")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET.trim()
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or already used")
        }

        const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

export { registerUser, loginUser, logoutUser, getUserProfile, refreshAccessToken }