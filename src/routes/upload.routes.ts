import { Router } from "express"
import * as ctrl from "../controllers/upload.controller"
import { validate } from "../middlewares/validate"
import { z } from "zod"
import { requireAuth } from "../middlewares/auth"

const router = Router()
router.use(requireAuth)

const signUploadSchema = z.object({
	conversationId: z.string().uuid(),
	filename: z.string().min(1)
})

const signDownloadSchema = z.object({
	path: z.string().min(1)
})

router.post("/sign-upload", validate(signUploadSchema), ctrl.signUpload)
router.post("/sign-download", validate(signDownloadSchema), ctrl.signDownload)

export default router
