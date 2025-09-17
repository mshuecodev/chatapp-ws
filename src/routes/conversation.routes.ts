import { Router } from "express"
import { ConversationController } from "../controllers/conversation.controller"
import { authenticate } from "../middlewares/auth"
import { asyncHandler } from "../utils/asyncHandler"

const router = Router()

router.get("/", authenticate, asyncHandler(ConversationController.getConversations))
router.post("/", authenticate, asyncHandler(ConversationController.createConversation))
router.post("/:id/attachments/sign", asyncHandler(ConversationController.signAttachmentUrl))

export default router
