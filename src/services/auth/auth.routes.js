import { Router } from "express";
import { loginUser } from "./auth.controllers.js";

const authRouter = Router() ; 

authRouter.post('/login', loginUser );

export default authRouter;

