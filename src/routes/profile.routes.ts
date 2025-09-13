import { Router } from "express"
import { ProfileController } from "../controllers/profile.controller"
import { authenticate } from "../middlewares/auth"
import { asyncHandler } from "../utils/asyncHandler"

const router = Router()

router.get("/me", authenticate, asyncHandler(ProfileController.getMe))

export default router
