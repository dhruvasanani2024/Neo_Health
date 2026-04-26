import mongoose from "mongoose";

// NOTE: MONGODB_URI in .env already contains the database name (/NeoHealth).
// Do NOT append DB_NAME again — that would create an invalid path like:
// mongodb+srv://...neohealth.bv4m3pr.mongodb.net/NeoHealth/NeoHealth

const connection_db = async () => {
    try {
        // Trim the URI to remove any trailing whitespace/newlines
        // (common issue when pasting into Vercel dashboard)
        const uri = (process.env.MONGODB_URI || '').trim()
        if (!uri) {
            throw new Error('MONGODB_URI environment variable is not set or empty')
        }
        const connectionInstance = await mongoose.connect(uri);
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`MongoDB Connection Error:`, error);
        // Do NOT call process.exit() in serverless — it kills the container
        // before a response can be sent. Throw so the caller can handle it.
        throw error
    }
}

export default connection_db
