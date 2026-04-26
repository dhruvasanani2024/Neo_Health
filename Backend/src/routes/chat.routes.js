import { Router } from "express"
import { chatWithHealix, clearChat } from "../controllers/chat.controller.js"

const router = Router()

// POST /api/v1/chat — Send a message to Healix
router.post("/", chatWithHealix)

// POST /api/v1/chat/clear — Clear conversation history
router.post("/clear", clearChat)

export default router
