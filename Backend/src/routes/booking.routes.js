import { Router } from "express";
import {
    createBooking,
    getUserBookings,
    cancelBooking,
    getHospitalBookings,
    getDoctorBookings,
    updateBooking
} from "../controllers/booking.controller.js";
import { verifyJWT, verifyHospitalJWT, verifyDoctorJWT } from "../middleware/auth.middleware.js";

const router = Router();

// User booking routes
router.route("/").post(verifyJWT, createBooking);
router.route("/my").get(verifyJWT, getUserBookings);
router.route("/:id/cancel").patch(verifyJWT, cancelBooking);

// Hospital admin booking routes
router.route("/hospital").get(verifyHospitalJWT, getHospitalBookings);
router.route("/hospital/:id").patch(verifyHospitalJWT, updateBooking);

// Doctor booking routes
router.route("/doctor").get(verifyDoctorJWT, getDoctorBookings);
router.route("/doctor/:id").patch(verifyDoctorJWT, updateBooking);

export default router
