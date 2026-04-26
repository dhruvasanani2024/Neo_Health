import asyncHandler from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { Hospital } from "../models/hospital.register.model.js";
import { Doctor } from "../models/doctor.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateHospitalTokens = async (hospitalId) => {
    try {
        const hospital = await Hospital.findById(hospitalId);
        const accessToken = hospital.generateAccessTokens();
        const refreshToken = hospital.generateRefreshTokens();

        hospital.refreshToken = refreshToken;
        await hospital.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("[TOKEN] Hospital token error:", error.message);
        throw new ApiError(500, `Something went wrong while generating tokens: ${error.message}`)
    }
}

// Register a new hospital
const registerHospital = asyncHandler(async (req, res) => {
    const {
        hospital_name, address, phone_number, specialities,
        admin_email, password, confirm_password,
        accreditations, facilities, insurancePartners, workingHours
    } = req.body || {};

    // Validate required fields
    if (!hospital_name || !address || !admin_email || !password) {
        throw new ApiError(400, "Hospital name, address, admin email and password are required")
    }

    if (!phone_number) {
        throw new ApiError(400, "Phone number is required")
    }

    // Validate password match
    if (confirm_password && password !== confirm_password) {
        throw new ApiError(400, "Passwords do not match")
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters")
    }

    // Check if hospital already exists
    const existedHospital = await Hospital.findOne({ admin_email })

    if (existedHospital) {
        throw new ApiError(400, "A hospital with this admin email already exists")
    }

    // Handle optional image upload
    let hospitalImageUrl = "";
    if (req.files?.hospital_image?.[0]?.path) {
        const imageUpload = await uploadOnCloudinary(req.files.hospital_image[0].path);
        if (imageUpload) hospitalImageUrl = imageUpload.url;
    }

    const hospital = await Hospital.create({
        hospital_name,
        address,
        phone_number,
        hospital_image: hospitalImageUrl || undefined,
        specialities: specialities || [],
        admin_email,
        password,
        accreditations: accreditations || [],
        facilities: facilities || [],
        insurancePartners: insurancePartners || [],
        workingHours: workingHours || {},
    })

    const createdHospitalObj = await Hospital.findById(hospital._id).select("-password -refreshToken")

    if (!createdHospitalObj) {
        throw new ApiError(500, "Something went wrong while registering the hospital")
    }

    const createdHospital = {
        ...createdHospitalObj.toObject(),
        doctors: []
    }

    // Auto-login after registration
    const { accessToken, refreshToken } = await generateHospitalTokens(hospital._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, {
                hospital: createdHospital,
                accessToken,
                refreshToken
            }, "Hospital registered successfully")
        )
})

// Login hospital admin
const loginHospital = asyncHandler(async (req, res) => {
    const { admin_email, password } = req.body || {};

    if (!admin_email) {
        throw new ApiError(400, "Admin email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const hospital = await Hospital.findOne({ admin_email })

    if (!hospital) {
        throw new ApiError(404, "Hospital not found with this admin email");
    }

    const isPasswordValid = await hospital.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid admin credentials");
    }

    const { accessToken, refreshToken } = await generateHospitalTokens(hospital._id);

    const loggedInHospitalObj = await Hospital.findById(hospital._id).select("-password -refreshToken");
    const doctors = await Doctor.find({ hospital: hospital._id }).select("-password -refreshToken");

    const loggedInHospital = {
        ...loggedInHospitalObj.toObject(),
        doctors
    };

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
                hospital: loggedInHospital,
                accessToken,
                refreshToken
            }, "Hospital admin logged in successfully")
        )
})

// Logout hospital admin
const logoutHospital = asyncHandler(async (req, res) => {
    await Hospital.findByIdAndUpdate(
        req.hospital._id,
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
            new ApiResponse(200, {}, "Hospital admin logged out successfully")
        )
})

// Get hospital profile (for logged-in hospital admin)
const getHospitalProfile = asyncHandler(async (req, res) => {
    // Also populate the doctors that belong to this hospital
    const doctors = await Doctor.find({ hospital: req.hospital._id }).select("-password -refreshToken")

    const hospitalData = {
        ...req.hospital.toObject(),
        doctors
    }

    return res.status(200).json(
        new ApiResponse(200, hospitalData, "Hospital profile fetched successfully")
    )
})

// Get all hospitals (public - for user homepage)
const getAllHospitals = asyncHandler(async (req, res) => {
    const hospitals = await Hospital.find({}).select("-password -refreshToken")

    // Populate doctors for each hospital
    const hospitalsWithDoctors = await Promise.all(
        hospitals.map(async (hospital) => {
            const doctors = await Doctor.find({ hospital: hospital._id }).select("-password -refreshToken")
            return {
                ...hospital.toObject(),
                doctors
            }
        })
    )

    return res.status(200).json(
        new ApiResponse(200, hospitalsWithDoctors, "All hospitals fetched successfully")
    )
})

// Get single hospital by ID (public - for hospital detail page)
const getHospitalById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const hospital = await Hospital.findById(id).select("-password -refreshToken")

    if (!hospital) {
        throw new ApiError(404, "Hospital not found")
    }

    const doctors = await Doctor.find({ hospital: id }).select("-password -refreshToken")

    const hospitalData = {
        ...hospital.toObject(),
        doctors
    }

    return res.status(200).json(
        new ApiResponse(200, hospitalData, "Hospital details fetched successfully")
    )
})

// Update hospital settings
const updateHospitalSettings = asyncHandler(async (req, res) => {
    const {
        hospital_name, address, phone_number, specialities,
        openNow, accreditations, facilities, insurancePartners, workingHours
    } = req.body || {};

    const updateData = {};
    if (hospital_name) updateData.hospital_name = hospital_name;
    if (address) updateData.address = address;
    if (phone_number) updateData.phone_number = phone_number;
    if (specialities) updateData.specialities = specialities;
    if (openNow !== undefined) updateData.openNow = openNow;
    if (accreditations) updateData.accreditations = accreditations;
    if (facilities) updateData.facilities = facilities;
    if (insurancePartners) updateData.insurancePartners = insurancePartners;
    if (workingHours) updateData.workingHours = workingHours;

    // Handle image upload if provided
    if (req.files?.hospital_image?.[0]?.path) {
        const imageUpload = await uploadOnCloudinary(req.files.hospital_image[0].path);
        if (imageUpload) updateData.hospital_image = imageUpload.url;
    }

    const hospital = await Hospital.findByIdAndUpdate(
        req.hospital._id,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, hospital, "Hospital settings updated successfully")
    )
})

export {
    registerHospital,
    loginHospital,
    logoutHospital,
    getHospitalProfile,
    getAllHospitals,
    getHospitalById,
    updateHospitalSettings
}