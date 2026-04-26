import "dotenv/config"
import connection_db from "../src/db/index.js"
import { app } from "../src/app.js"

// Connect to MongoDB once (cached across warm serverless invocations)
let dbConnected = false

const handler = async (req, res) => {
    if (!dbConnected) {
        try {
            // Log env diagnostics (values are NOT logged, only presence)
            console.log("[Vercel] ENV check:", {
                MONGODB_URI: !!process.env.MONGODB_URI,
                MONGODB_URI_length: (process.env.MONGODB_URI || '').trim().length,
                ACCESS_TOKEN_SECRET: !!process.env.ACCESS_TOKEN_SECRET,
                NODE_ENV: process.env.NODE_ENV,
            })
            await connection_db()
            dbConnected = true
            console.log("[Vercel] MongoDB connected successfully")
        } catch (err) {
            console.error("[Vercel] MongoDB connection failed:", err.message)
            dbConnected = false  // reset so next warm invocation retries
            return res.status(500).json({
                error: "Database connection failed",
                message: err.message,
                hint: "Check that MONGODB_URI is set correctly in Vercel Environment Variables and that MongoDB Atlas allows connections from 0.0.0.0/0"
            })
        }
    }
    return app(req, res)
}

export default handler

