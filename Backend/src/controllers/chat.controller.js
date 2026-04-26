import asyncHandler from "../utils/AsyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import OpenAI from "openai"

// Support both GROQ_API_KEY and GEMINI_API_KEY (for backward compat with Vercel env)
const apiKey = (process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY)?.trim()
console.log("[Healix] Groq key loaded:", apiKey ? `${apiKey.substring(0, 8)}...` : "MISSING!")

if (!apiKey) {
    console.error("[Healix] ⚠️  GROQ_API_KEY is not set! Chat will not work.")
    console.error("[Healix] Set it in Vercel Dashboard → Settings → Environment Variables")
}

// Groq uses OpenAI-compatible API
const groq = apiKey ? new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
}) : null

// System prompt to make the bot a healthcare assistant
const SYSTEM_PROMPT = `You are Healix, a friendly and knowledgeable AI health assistant for NeoHealth — a hospital and healthcare platform. You help users with:
- Understanding symptoms and when to seek medical attention
- General health and wellness advice
- Navigating the NeoHealth platform (booking appointments, finding doctors, etc.)
- Medication information and reminders
- First-aid guidance

Rules:
- Always be empathetic, warm, and professional
- NEVER diagnose conditions — always recommend consulting a doctor for serious concerns
- Keep responses concise (2-4 sentences max unless the user asks for detail)
- Use simple language, avoid heavy medical jargon
- If someone describes a medical emergency, tell them to call 108 (ambulance) or use the SOS button immediately
- You can use emojis sparingly to be friendly
- Start your first response with a warm greeting mentioning your name Healix`

// Models to try in order — Groq model names
const PRIMARY_MODEL = "llama-3.3-70b-versatile"
const FALLBACK_MODEL = "mixtral-8x7b-32768"

// Store conversation histories in memory (per-session, not persisted)
const conversations = new Map()

// ── Simple per-session rate limiter ─────────────────────────────────────────
const rateLimiter = new Map()
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10   // max 10 messages per minute per session

function isRateLimited(sessionId) {
    const now = Date.now()
    if (!rateLimiter.has(sessionId)) {
        rateLimiter.set(sessionId, [])
    }
    const timestamps = rateLimiter.get(sessionId)
    while (timestamps.length > 0 && timestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
        timestamps.shift()
    }
    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        return true
    }
    timestamps.push(now)
    return false
}

// Try sending a message — primary model first, then fallback
async function tryWithFallback(message, history) {
    const models = [PRIMARY_MODEL, FALLBACK_MODEL]
    let lastError = null

    // Build OpenAI-format messages array
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map(msg => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.text,
        })),
        { role: "user", content: message },
    ]

    for (const modelName of models) {
        try {
            const completion = await groq.chat.completions.create({
                model: modelName,
                messages,
                temperature: 0.7,
                max_tokens: 512,
            })

            const reply = completion.choices[0]?.message?.content
            if (!reply) throw new Error("Empty response from model")

            console.log(`[Healix] ✅ Success with model: ${modelName}`)
            return reply
        } catch (error) {
            const errMsg = error.message || ""
            console.warn(`[Healix] ❌ Model ${modelName} failed:`, errMsg.substring(0, 150))
            lastError = error

            // If rate limited, don't try fallback (same API key quota)
            if (errMsg.includes("429") || errMsg.includes("rate_limit") || errMsg.includes("quota")) {
                console.warn("[Healix] Rate limited — skipping fallback models (same quota)")
                break
            }
        }
    }

    throw lastError
}

const chatWithHealix = asyncHandler(async (req, res) => {
    const { message, sessionId } = req.body

    // Check if API key is configured
    if (!groq) {
        console.error("[Healix] Cannot process chat — GROQ_API_KEY not configured")
        return res.status(503).json(
            new ApiResponse(503, null, "Healix is not configured yet. The admin needs to set up the API key.")
        )
    }

    if (!message || !message.trim()) {
        return res.status(400).json(
            new ApiResponse(400, null, "Message is required")
        )
    }

    // Per-session rate limiting
    if (isRateLimited(sessionId)) {
        return res.status(429).json(
            new ApiResponse(429, null, "You're sending messages too fast! 😅 Please wait a moment and try again.")
        )
    }

    // Get or create conversation history for this session
    if (!conversations.has(sessionId)) {
        conversations.set(sessionId, [])
    }
    const history = conversations.get(sessionId)

    try {
        const reply = await tryWithFallback(message, history)

        // Save to history
        history.push({ role: "user", text: message })
        history.push({ role: "model", text: reply })

        // Limit history to last 20 messages to prevent memory bloat
        if (history.length > 20) {
            history.splice(0, history.length - 20)
        }

        return res.status(200).json(
            new ApiResponse(200, { reply }, "Response generated successfully")
        )
    } catch (error) {
        console.error("[Healix] All models failed:", error.message)

        const errMsg = error.message || ""
        const isQuota = errMsg.includes("429") || errMsg.includes("rate_limit") || errMsg.includes("quota")
        const isAuth = errMsg.includes("401") || errMsg.includes("invalid_api_key") || errMsg.includes("authentication")

        let userMessage
        if (isQuota) {
            userMessage = "I've reached my usage limit for now 😴 Please try again in a minute!"
        } else if (isAuth) {
            userMessage = "Healix needs a valid API key to work. Please contact the admin."
        } else {
            userMessage = "Healix is having trouble thinking right now. Please try again."
        }

        return res.status(isQuota ? 429 : 500).json(
            new ApiResponse(isQuota ? 429 : 500, null, userMessage)
        )
    }
})

// Clear a session's history
const clearChat = asyncHandler(async (req, res) => {
    const { sessionId } = req.body
    if (sessionId && conversations.has(sessionId)) {
        conversations.delete(sessionId)
    }
    return res.status(200).json(
        new ApiResponse(200, null, "Chat history cleared")
    )
})

export { chatWithHealix, clearChat }

