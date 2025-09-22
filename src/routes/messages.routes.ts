import { Router } from "express"
import { MessageController } from "../controllers/message.controller"
import { authenticate } from "../middlewares/auth"
import { asyncHandler } from "../utils/asyncHandler"
import { authorize } from "../middlewares/authorize"

const router = Router()

router.get("/:id", authenticate, authorize(["admin", "user"]), asyncHandler(MessageController.getMessages))

export default router
