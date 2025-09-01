import { Router } from "express"
import * as ctrl from "../controllers/message.controller"
import { z } from "zod"
import { validate } from "../middlewares/validate"
import { requireAuth } from "../middlewares/auth"

const router = Router()

const sendSchema = z.object({
	conversationId: z.string().uuid(),
	body: z.string().optional(),
	attachments: z
		.array(
			z.object({
				path: z.string(),
				bucket: z.string().optional(),
				mime_type: z.string().optional(),
				size_bytes: z.number().optional()
			})
		)
		.optional()
})

router.use(requireAuth)

router.post("/", validate(sendSchema), ctrl.sendMessage)
router.get("/:conversationId", ctrl.listMessages)
router.patch("/:messageId", validate(z.object({ body: z.string() })), ctrl.editMessage)
router.delete("/:messageId", ctrl.deleteMessage)

export default router
