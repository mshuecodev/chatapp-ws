import { Router } from "express"
// import { register, login } from "../controllers/auth.controller"
import { AuthController } from "../controllers/auth.controller"
import { asyncHandler } from "../utils/asyncHandler"

const router = Router()

router.post("/signup", asyncHandler(AuthController.signup))
router.post("/signin", asyncHandler(AuthController.signin))

export default router
