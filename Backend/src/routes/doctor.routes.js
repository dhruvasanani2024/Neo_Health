import { Router } from "express";
import {
    addDoctor,
    loginDoctor,
    logoutDoctor,
    getDoctorProfile,
    updateDoctorSlots,
    updateDoctorSlotsByHospital,
    getDoctorsByHospital,
} from "../controllers/doctor.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyHospitalJWT, verifyDoctorJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Wrapper to make multer optional
const optionalUpload = (fields) => {
    const multerMiddleware = upload.fields(fields);
    return (req, res, next) => {
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
            return multerMiddleware(req, res, next);
        }
        next();
    };
};

// Public routes
router.route("/login").post(loginDoctor);
router.route("/hospital/:hospitalId").get(getDoctorsByHospital);

// Hospital admin routes
router.route("/add").post(
    verifyHospitalJWT,
    optionalUpload([{ name: "image", maxCount: 1 }]),
    addDoctor
);
router.route("/slots/:id").patch(verifyHospitalJWT, updateDoctorSlotsByHospital);


// Doctor protected routes
router.route("/logout").post(verifyDoctorJWT, logoutDoctor);
router.route("/profile").get(verifyDoctorJWT, getDoctorProfile);
router.route("/slots").patch(verifyDoctorJWT, updateDoctorSlots);

export default router
