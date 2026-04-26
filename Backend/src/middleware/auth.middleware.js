import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/users.model.js";
import { Hospital } from "../models/hospital.register.model.js";
import { Doctor } from "../models/doctor.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET.trim());
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "User Credentials are not valid")
    }
})

export const verifyHospitalJWT = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization") || req.header("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized hospital request - Missing token");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET.trim());
        const hospital = await Hospital.findById(decodedToken?._id).select("-password -refreshToken");

        if (!hospital) {
            throw new ApiError(401, "Invalid Hospital Access Token");
        }

        req.hospital = hospital;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Hospital Credentials are not valid");
    }
});

export const verifyDoctorJWT = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization") || req.header("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized doctor request - Missing token");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET.trim());
        const doctor = await Doctor.findById(decodedToken?._id).select("-password -refreshToken");

        if (!doctor) {
            throw new ApiError(401, "Invalid Doctor Access Token");
        }

        req.doctor = doctor;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Doctor Credentials are not valid");
    }
});