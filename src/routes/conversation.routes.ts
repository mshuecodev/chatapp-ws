import { Router } from "express"
import * as ctrl from "../controllers/coversation.controller"
import { requireUser } from "../middlewares/requireUser"
import { validate } from "../middlewares/validate"
import { z } from "zod"
import { requireAuth } from "../middlewares/auth"

const router = Router()

const createSchema = z.object({
	title: z.string().nullable().optional(),
	memberIds: z.array(z.string().uuid()).min(1)
})

// router.use(requireUser)
router.post("/", validate(createSchema), requireAuth, ctrl.createConversation)
router.get("/", requireAuth, ctrl.listConversations)

export default router
