import { Router } from "express";
import routerUser from "../components/user/user.routes.js";
import authRouter from "../services/auth/auth.routes.js";
import routerSala from "../components/sala/sala.routes.js";
import geminiApiRouter from "../components/AI/geminiApi.routes.js";

const router = Router(); 
router.use('/usuario', routerUser); 
router.use('/sala', routerSala); 
router.use('/auth', authRouter);
router.use('/ai-gemini',geminiApiRouter)

export default router ;


