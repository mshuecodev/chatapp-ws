import { Router } from "express"
import { postSignUp, postSignIn, postRefresh, postSignOut } from "../controllers/auth.controller"
import { requireAuth } from "../middlewares/auth"

const router = Router()

// Auth routes
router.post("/signup", postSignUp)
router.post("/signin", postSignIn)
router.post("/refresh", postRefresh)

// Protected routes
router.post("/signout", requireAuth, postSignOut)

// Example: a test route that requires authentication
router.get("/me", requireAuth, (req, res) => {
	res.json({ user: (req as any).user })
})

export default router
