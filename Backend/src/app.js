import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// Updated CORS to support local dev + deployed Vercel frontends
const allowedLocalOrigins = [
    'http://localhost:5173', 'http://localhost:5174',
    'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'
]

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile, curl, server-to-server)
        if (!origin) return callback(null, true)
        // Allow localhost
        if (allowedLocalOrigins.includes(origin)) return callback(null, true)
        // Allow any Vercel deployment
        if (origin.endsWith('.vercel.app')) return callback(null, true)
        // Allow custom CORS_ORIGIN from env
        if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
            const custom = process.env.CORS_ORIGIN.split(',').map(o => o.trim())
            if (custom.includes(origin)) return callback(null, true)
        }
        callback(null, true) // Allow all for now; tighten in production
    },
    credentials: true
}))

app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({extended : true, limit : "16kb"}));

app.use(express.static("public"));
app.use(cookieParser());

// importing routers
import userRouter from "./routes/user.routes.js"
import hospitalRouter from "./routes/hospital.routes.js"
import doctorRouter from "./routes/doctor.routes.js"
import bookingRouter from "./routes/booking.routes.js"
import chatRouter from "./routes/chat.routes.js"

// Request logger (debug)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Health check
app.get("/api/v1/ping", (req, res) => {
    res.json({ status: "ok", message: "Server is alive" });
});

// registering routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/hospitals", hospitalRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/chat", chatRouter);

// Global error handler — CRITICAL: without this, ApiError thrown by asyncHandler
// gets swallowed by Express default handler and returns HTML 404/500
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`[ERROR] ${statusCode}: ${message}`);
    return res.status(statusCode).json({
        success: false,
        statuscode: statusCode,
        message,
        errors: err.errors || [],
        data: null,
    });
});

export { app }