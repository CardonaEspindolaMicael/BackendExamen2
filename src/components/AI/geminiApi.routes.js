import {Router} from "express"
import { getModelGemini, postImgToHtml } from "./geminiApi.controllers.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const geminiApiRouter = Router() ;

geminiApiRouter.get('/:apiKey', getModelGemini)
geminiApiRouter.post('/image-to-html/:apiKey', upload.single('image'),postImgToHtml)


export default geminiApiRouter; 