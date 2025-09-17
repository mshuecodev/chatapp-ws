import { Router } from "express"
import { AdminController } from "../controllers/admin.controller"
import { authenticate } from "../middlewares/auth"
import { authorize } from "../middlewares/authorize"
import { asyncHandler } from "../utils/asyncHandler"

const router = Router()

router.post("/users", authenticate, authorize("admin"), asyncHandler(AdminController.createUser))
router.post("/roles", authenticate, authorize("admin"), asyncHandler(AdminController.assignRole))

router.get("/users", authenticate, authorize("admin"), asyncHandler(AdminController.getAllProfiles))

export default router
