import { Router } from "express";
import { registerUser, loginUser, logoutUser, getUserProfile, refreshAccessToken } from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Wrapper to make multer optional (allows JSON requests without multipart)
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
router.route("/register").post(
    optionalUpload([{ name: "avatar", maxCount: 1 }]),
    registerUser
)

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken)

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/profile").get(verifyJWT, getUserProfile)

export default router