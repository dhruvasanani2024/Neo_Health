import { Router } from "express";
import {
    registerHospital,
    loginHospital,
    logoutHospital,
    getHospitalProfile,
    getAllHospitals,
    getHospitalById,
    updateHospitalSettings,
} from "../controllers/hospital.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyHospitalJWT } from "../middleware/auth.middleware.js";

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
router.route("/").get(getAllHospitals);
router.route("/register").post(
    optionalUpload([{ name: "hospital_image", maxCount: 1 }]),
    registerHospital
);
router.route("/login").post(loginHospital);

// Protected routes (hospital admin only) — MUST be before /:id
router.route("/logout").post(verifyHospitalJWT, logoutHospital);
router.route("/profile").get(verifyHospitalJWT, getHospitalProfile);
router.route("/settings").patch(
    verifyHospitalJWT,
    optionalUpload([{ name: "hospital_image", maxCount: 1 }]),
    updateHospitalSettings
);

// Dynamic param route — MUST be last
router.route("/:id").get(getHospitalById);

export default router
