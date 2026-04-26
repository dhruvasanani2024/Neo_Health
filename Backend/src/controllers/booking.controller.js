import asyncHandler from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { Booking } from "../models/booking.model.js";
import { Doctor } from "../models/doctor.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a booking (user)
const createBooking = asyncHandler(async (req, res) => {
    const {
        doctorId, hospitalId, slotTime, appointmentType,
        patientType, patientName, fee, date
    } = req.body || {};

    if (!doctorId || !hospitalId || !slotTime || !date) {
        throw new ApiError(400, "Doctor, hospital, slot time and date are required")
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found")
    }

    // Check for duplicate booking to avoid multiple bookings at the exact same slot for the same patient
    const existingBooking = await Booking.findOne({
        patient: req.user._id,
        doctor: doctorId,
        date,
        slotTime,
        patientName: patientName || req.user.fullname,
        status: { $ne: "cancelled" }
    });

    if (existingBooking) {
        throw new ApiError(400, `An appointment is already booked with this doctor for ${patientName || req.user.fullname} on ${date} at ${slotTime}.`);
    }

    const booking = await Booking.create({
        patient: req.user._id,
        doctor: doctorId,
        hospital: hospitalId,
        slotTime,
        appointmentType: appointmentType || "in-person",
        patientType: patientType || "normal",
        patientName: patientName || req.user.fullname,
        fee: fee || doctor.fee,
        date,
    })

    const populatedBooking = await Booking.findById(booking._id)
        .populate("doctor", "name specialty image fee")
        .populate("hospital", "hospital_name address")
        .populate("patient", "fullname email")

    return res.status(201).json(
        new ApiResponse(201, populatedBooking, "Appointment booked successfully")
    )
})

// Get user's bookings
const getUserBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ patient: req.user._id })
        .populate("doctor", "name specialty image fee qualification")
        .populate("hospital", "hospital_name address hospital_image")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, bookings, "Bookings fetched successfully")
    )
})

// Cancel a booking
const cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
        throw new ApiError(404, "Booking not found")
    }

    // Ensure the user owns this booking
    if (booking.patient.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to cancel this booking")
    }

    if (booking.status === "cancelled") {
        throw new ApiError(400, "Booking is already cancelled")
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json(
        new ApiResponse(200, booking, "Booking cancelled successfully")
    )
})

// Get hospital's bookings (hospital admin)
const getHospitalBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ hospital: req.hospital._id })
        .populate("doctor", "name specialty image")
        .populate("patient", "fullname email phone")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, bookings, "Hospital bookings fetched successfully")
    )
})

// Get doctor's bookings
const getDoctorBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ doctor: req.doctor._id })
        .populate("patient", "fullname email phone")
        .populate("hospital", "hospital_name address")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, bookings, "Doctor bookings fetched successfully")
    )
})

// Update booking (e.g. prescription, status) - Hospital/Doctor
const updateBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, prescription } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    // Verify ownership (Doctor or Hospital)
    const isDoctor = req.doctor && booking.doctor.toString() === req.doctor._id.toString();
    const isHospital = req.hospital && booking.hospital.toString() === req.hospital._id.toString();

    if (!isDoctor && !isHospital) {
        throw new ApiError(403, "You do not have permission to update this booking");
    }

    if (status) booking.status = status;
    if (prescription) {
        // Replace existing prescription or push to it.
        // Assuming we are updating the full prescription list for now
        booking.prescription = Array.isArray(prescription) ? prescription : [prescription];
    }

    await booking.save();

    return res.status(200).json(
        new ApiResponse(200, booking, "Booking updated successfully")
    )
})

export {
    createBooking,
    getUserBookings,
    cancelBooking,
    getHospitalBookings,
    getDoctorBookings,
    updateBooking
}
