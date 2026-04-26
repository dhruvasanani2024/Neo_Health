import asyncHandler from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { Doctor } from "../models/doctor.model.js";
import { Hospital } from "../models/hospital.register.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateDoctorTokens = async (doctorId) => {
    try {
        const doctor = await Doctor.findById(doctorId);
        const accessToken = doctor.generateAccessTokens();
        const refreshToken = doctor.generateRefreshTokens();

        doctor.refreshToken = refreshToken;
        await doctor.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("[TOKEN] Doctor token error:", error.message);
        throw new ApiError(500, `Something went wrong while generating tokens: ${error.message}`)
    }
}

// Add a new doctor (hospital admin only)
const addDoctor = asyncHandler(async (req, res) => {
    const {
        name, email, password, specialty, qualification, experience,
        fee, virtualFee, offersVirtual, languages, education,
        about, slots, available
    } = req.body || {};

    if (!name || !email || !password || !specialty || !fee) {
        throw new ApiError(400, "Name, email, password, specialty and fee are required")
    }

    // Check if doctor email is already taken
    const existedDoctor = await Doctor.findOne({ email })
    if (existedDoctor) {
        throw new ApiError(400, "A doctor with this email already exists")
    }

    // Handle optional image upload
    let imageUrl = "";
    if (req.files?.image?.[0]?.path) {
        const imageUpload = await uploadOnCloudinary(req.files.image[0].path);
        if (imageUpload) imageUrl = imageUpload.url;
    }

    const doctor = await Doctor.create({
        name,
        email,
        password,
        specialty,
        qualification: qualification || "",
        experience: experience || "",
        fee,
        virtualFee: virtualFee || 0,
        offersVirtual: offersVirtual || false,
        languages: languages || ["English"],
        education: education || [],
        about: about || "",
        image: imageUrl || "",
        slots: slots || [],
        available: available !== undefined ? available : true,
        hospital: req.hospital._id,
    })

    const createdDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken")

    return res.status(201).json(
        new ApiResponse(201, createdDoctor, "Doctor added successfully")
    )
})

// Doctor login
const loginDoctor = asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const doctor = await Doctor.findOne({ email })

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const isPasswordValid = await doctor.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateDoctorTokens(doctor._id);

    const loggedInDoctor = await Doctor.findById(doctor._id)
        .select("-password -refreshToken")
        .populate("hospital", "-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                doctor: loggedInDoctor,
                accessToken,
                refreshToken
            }, "Doctor logged in successfully")
        )
})

// Doctor logout
const logoutDoctor = asyncHandler(async (req, res) => {
    await Doctor.findByIdAndUpdate(
        req.doctor._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "Doctor logged out successfully")
        )
})

// Get doctor profile
const getDoctorProfile = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.doctor._id)
        .select("-password -refreshToken")
        .populate("hospital", "-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, doctor, "Doctor profile fetched successfully")
    )
})

// Update doctor time slots (Doctor action)
const updateDoctorSlots = asyncHandler(async (req, res) => {
    const { slots, virtualSlots, available } = req.body || {};

    const updateData = {};
    if (slots) updateData.slots = slots;
    if (virtualSlots) updateData.virtualSlots = virtualSlots;
    if (available !== undefined) updateData.available = available;

    const doctor = await Doctor.findByIdAndUpdate(
        req.doctor._id,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, doctor, "Doctor slots updated successfully")
    )
})

// Update doctor time slots (Hospital admin action)
const updateDoctorSlotsByHospital = asyncHandler(async (req, res) => {
    const { id } = req.params; // doctor ID
    const { slots, virtualSlots, available } = req.body || {};

    const doctor = await Doctor.findById(id);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    if (doctor.hospital.toString() !== req.hospital._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this doctor");
    }

    const updateData = {};
    if (slots) updateData.slots = slots;
    if (virtualSlots) updateData.virtualSlots = virtualSlots;
    if (available !== undefined) updateData.available = available;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, updatedDoctor, "Doctor slots updated successfully by hospital")
    )
})

// Get all doctors for a hospital (public)
const getDoctorsByHospital = asyncHandler(async (req, res) => {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
        throw new ApiError(404, "Hospital not found")
    }

    const doctors = await Doctor.find({ hospital: hospitalId }).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, doctors, "Doctors fetched successfully")
    )
})

export {
    addDoctor,
    loginDoctor,
    logoutDoctor,
    getDoctorProfile,
    updateDoctorSlots,
    updateDoctorSlotsByHospital,
    getDoctorsByHospital,
}
