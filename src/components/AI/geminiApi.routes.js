import {Router} from "express"
import { getModelGemini, getZipGenerate, postHtmlToDart, postImgToHtml } from "./geminiApi.controllers.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const geminiApiRouter = Router() ;

geminiApiRouter.get('/:apiKey', getModelGemini)
geminiApiRouter.post('/image-to-html/:apiKey', upload.single('image'),postImgToHtml)
geminiApiRouter.post('/html-to-dart/:apiKey',postHtmlToDart)
geminiApiRouter.post('/generate-zip', getZipGenerate)


export default geminiApiRouter; 