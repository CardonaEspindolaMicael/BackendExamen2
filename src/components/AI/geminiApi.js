import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";


export async function main(){
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const base64ImageFile = fs.readFileSync("C:\\Users\\micae\\OneDrive\\Escritorio\\Imagenes Grape\\Hero1.png", {
      encoding: "base64",
    });
    
    const contents = [
      {
        inlineData: {
          mimeType: "image/png",
          data: base64ImageFile,
        },
      },
      { text: "Caption this image." },
    ];
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
      });
      console.log(response.text);
}
//main()