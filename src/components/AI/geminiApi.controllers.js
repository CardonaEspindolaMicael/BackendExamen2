import { GoogleGenAI } from "@google/genai";
import axios from "axios";
//import fs from "fs";
import fs from "fs-extra";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";
import { extractClassName, formatAndIndentHtml, formatEscapedHtml, generateMainDart, toKebabCase, toPascalCase, toSnakeCase } from "../../helpers/flutterHelp.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const getModelGemini = async (req, res) => {
  try {
    const { apiKey } = req.params;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    const response = await axios.get(url);

    const imageModels = response.data.models.filter(model =>
      model.supportedGenerationMethods.includes("generateContent")
    );

    res.status(200).json(imageModels);
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Failed to retrieve models" });
  }
};

export const postImgToHtml = async (req, res) => {
  try {
    const { apiKey } = req.params;
    console.log(req.file)
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Check supported image formats
    const supportedFormats = ['image/jpeg', 'image/png'];
    if (!supportedFormats.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Unsupported image format. Please upload JPG or PNG images only."
      });
    }

    // Read uploaded file as base64
    const filePath = req.file.path;
    const base64Image = fs.readFileSync(filePath, { encoding: "base64" });

    // Initialize Gemini API with provided key
    const ai = new GoogleGenAI({ apiKey });

    // Create prompt based on image content type analysis
    const contents = [
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: base64Image,
        },
      },
      {
        text: `First determine if this image shows a mobile app design, a mobile app sketch/wireframe, or a class diagram/UML.

If it's a mobile app design, provide ONLY the complete HTML code with Tailwind CSS classes that would recreate this mobile interface mimicking Flutter's Material Design aesthetic with proper responsive behavior.

If it's a mobile app sketch/wireframe, provide ONLY the production-ready HTML code with Tailwind CSS that transforms this sketch into a professional mobile application layout following Material Design principles. Pay special attention to:
- Convert sketched elements to HTML elements that mimic Flutter Material widgets (nav bars, cards, floating action buttons)
- Use Tailwind's padding/margin utilities to match Material Design spacing (p-4, my-3, etc.)
- Implement mobile-first responsive design with Tailwind's breakpoint classes (sm:, md:, lg:)
- Create typography that matches Material Design standards using Tailwind's font utilities
- Use Tailwind's flex and grid classes to maintain proper alignment from the sketch
- Add Material Design touches like shadows (shadow-md), rounded corners (rounded-lg), and transitions where appropriate
- Apply a Material Design color palette using Tailwind's color classes
Include NOTHING but the HTML/Tailwind code.

If it's a class diagram or UML, provide ONLY the HTML and Tailwind CSS code that would visually represent this diagram with Material Design styled components.

Return ONLY the complete HTML code with no explanations, introductions, or any other text.`
      },
    ];

    // Generate content with Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
    });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Send only the HTML response
    res.send(response.text);

  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image", details: error.message });
  }
}



export const postHtmlToDart = async (req, res) => {
  try {
    const { apiKey } = req.params;
    const { htmlCode } = req.body;
    console.log(apiKey)
    console.log(htmlCode)

    // Validate input
    if (!htmlCode || !Array.isArray(htmlCode)) {
      return res.status(400).json({
        error: "Please provide htmlCode as an array of page objects."
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: "API key is required."
      });
    }

    // Initialize Gemini API with provided key (using same pattern as your imgToHtml endpoint)
    // OR: import { GoogleGenAI } from "@google/genai";

    const ai = new GoogleGenAI({ apiKey });

    // Create the enhanced Gemini prompt
    const prompt = `You are an expert Flutter developer. Convert the following HTML/CSS pages into Flutter Dart code.

**INPUT FORMAT:**
I will provide a JSON array of page objects:
[
  {
    "id": "page-1",
    "name": "Home Page",
    "html": "<body>...</body>",
    "css": "...CSS content..."
  }
]

**CONVERSION RULES:**

1. **HTML to Flutter Widget Mapping:**
   - <div> → Column, Row, Container (decide based on flex/grid class)
   - <input> → TextField (never place inside Expanded directly)
   - <button> → ElevatedButton or TextButton
   - <label>, <span> → Text
   - <svg> → Prefer placeholder Icon(Icons.image) unless clearly defined

2. **Styling:**
   - Map CSS styles to Flutter equivalents using:
     - color → Color(...)
     - padding/margin → EdgeInsets
     - flex → Row/Column + MainAxisAlignment/CrossAxisAlignment
     - border-radius → BorderRadius.circular
     - font styles → TextStyle
     - shadows → BoxShadow
   - If Tailwind classes exist, infer intent (e.g., bg-blue-500 → Colors.blue.shade500)

3. **Layout Rules:**
   - Use Scaffold as root widget.
   - Wrap body with SafeArea.
   - Wrap long content with SingleChildScrollView.
   - For horizontal/vertical layouts, ensure:
     - Use Flexible or Expanded only when inside Row/Column and with proper sibling balance.
     - Avoid nesting Expanded directly inside Padding.

4. **Error-Prevention:**
   - Do NOT place Expanded around TextField unless wrapped properly in a Row with clear constraints.
   - Always close Containers and parent widgets properly.
   - Make sure every widget has required params.
   - Avoid overflow by using Flexible, Wrap, or Expanded responsibly.

5. **Responsive Design:**
   - Use MediaQuery.of(context).size for width/height calculations if needed.
   - Use LayoutBuilder for dynamic layouts if breakpoint-based behavior is detected.
   - Use Flexible or Wrap instead of fixed widths when in doubt.

6. **Output Format:**
   Return a JSON array like:
   [
     {
       "id": "page-1",
       "name": "Home Page",
       "flutterCode": "import 'package:flutter/material.dart'; class HomePage extends StatelessWidget { @override Widget build(BuildContext context) { return Scaffold( body: SafeArea( child: SingleChildScrollView( child: Column( children: [ Container( padding: EdgeInsets.all(16), child: Text('Example') ) ] ) ) ) ); } }"
     }
   ]

**IMPORTANT:**
- Return ONLY a valid JSON array (no markdown, no explanation).
- Return flutterCode as a SINGLE LINE string (no \n or line breaks).
- Use single spaces between code tokens.
- Escape all quotes as \\" inside the string.
- No trailing characters, headers, or explanations.
- Validate that Flutter code is syntactically correct and free of common layout/compile errors.

**INPUT DATA TO CONVERT:**
${JSON.stringify(htmlCode, null, 2)}`;


    // Generate content from Gemini (using same pattern as your imgToHtml)
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // or "gemini-2.0-flash" if that's what works for you
      contents: [{ text: prompt }],
    });
    let generatedText = response.text;

    // Clean up the response - remove markdown code blocks if present
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to parse as JSON to validate
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedText);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          return res.status(500).json({
            error: "Failed to parse AI response as JSON",
            details: secondParseError.message,
            rawResponse: generatedText
          });
        }
      } else {
        return res.status(500).json({
          error: "No valid JSON found in AI response",
          rawResponse: generatedText
        });
      }
    }

    // Validate the response structure
    if (!Array.isArray(parsedResponse)) {
      return res.status(500).json({
        error: "AI response is not an array",
        response: parsedResponse
      });
    }
    parsedResponse = await correctDartCode(parsedResponse, apiKey);
    // Send the parsed response
    res.json(parsedResponse);

  } catch (error) {
    console.error("Error processing code:", error);
    res.status(500).json({
      error: "Failed to process code",
      details: error.message
    });
  }
};
export async function getZipGenerate(req, res) {
  const { dartCode } = req.body;

  const templatePath = path.join(__dirname, "flutter");
  const tempProjectPath = path.join(__dirname, `temp_${Date.now()}`);

  try {
    // Validate that dartCode is an array
    if (!Array.isArray(dartCode)) {
      return res.status(400).json({ error: "dartCode must be an array of page objects" });
    }

    // Verify template exists
    if (!await fs.pathExists(templatePath)) {
      return res.status(500).json({ error: "Template folder not found" });
    }

    // Copy template
    await fs.copy(templatePath, tempProjectPath);
    console.log("Template copied from:", templatePath);
    console.log("To temp folder:", tempProjectPath);

    // Find the correct lib folder path
    let libPath = path.join(tempProjectPath, "lib");

    if (!await fs.pathExists(libPath)) {
      console.log("lib/ not found in root, searching in subfolders...");

      const possiblePaths = [
        path.join(tempProjectPath, "my_skeleton", "lib"),
        path.join(tempProjectPath, "flutter_app", "lib")
      ];

      let foundLibPath = null;
      for (const possiblePath of possiblePaths) {
        if (await fs.pathExists(possiblePath)) {
          foundLibPath = possiblePath;
          break;
        }
      }

      if (!foundLibPath) {
        throw new Error("No lib folder found in project structure");
      }

      libPath = foundLibPath;
    }

    console.log("lib folder found at:", libPath);

    // Create pages directory
    const pagesPath = path.join(libPath, "pages");
    await fs.ensureDir(pagesPath);

    // Generate individual page files
    const pageImports = [];
    const routeEntries = [];

    for (const page of dartCode) {
      const { id, name, flutterCode } = page;

      // Create filename from class name or id
      const className = extractClassName(flutterCode) || toPascalCase(name) || toPascalCase(id);
      const fileName = toSnakeCase(className) + '.dart';
      const filePath = path.join(pagesPath, fileName);

      // Write page file
      await fs.writeFile(filePath, flutterCode, "utf8");

      // Add to imports and routes
      pageImports.push(`import 'pages/${fileName}';`);
      routeEntries.push(`  '/${toKebabCase(id)}': (context) => ${className}(),`);

      console.log(`Created page file: ${fileName} for ${name}`);
    }

    // Generate main.dart with routing
    const mainDartContent = generateMainDart(pageImports, routeEntries, dartCode[0]);

    // Write main.dart
    const mainPath = path.join(libPath, "main.dart");
    await fs.writeFile(mainPath, mainDartContent, "utf8");

    console.log("main.dart updated with routing successfully");

    // Set headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=flutter_project.zip");

    // Create ZIP
    await new Promise((resolve, reject) => {
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on('error', (err) => {
        console.error('Archive error:', err);
        reject(err);
      });

      archive.on('warning', (err) => {
        console.warn('Archive warning:', err);
      });

      archive.on('end', () => {
        console.log('Archive finalized successfully');
        console.log('Total bytes:', archive.pointer());
        resolve();
      });

      archive.pipe(res);
      archive.directory(tempProjectPath, false);
      archive.finalize();
    });

    console.log("ZIP sent successfully");

  } catch (err) {
    console.error("Error in getZipGenerate:", err);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Error generating project",
        details: err.message
      });
    }
  } finally {
    // Cleanup
    if (await fs.pathExists(tempProjectPath)) {
      setTimeout(async () => {
        try {
          await fs.remove(tempProjectPath);
          console.log("Temp folder deleted:", tempProjectPath);
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }, 2000);
    }
  }
}



/* Real Time Chat*/

export const realTimeHtmlEditor = async (req, res) => {
  try {
    const { apiKey } = req.params;
    const { htmlCode, clientPrompt } = req.body;

    // Validaciones
    if (!clientPrompt) {
      return res.status(400).json({
        error: "El mensaje no puede estar vacío"
      });
    }
    const wordCount = clientPrompt.trim().split(/\s+/).length;

    if (wordCount > 100) {
      return res.status(400).json({
        error: "El mensaje es demasiado largo. Por favor resume tu solicitud en 100 palabras o menos."
      });
    }
    if (clientPrompt.length < 10) {
      return res.status(400).json({
        error: "Tu mensaje es muy breve. Por favor proporciona un poco más de contexto para poder generar un diseño preciso y útil"
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: "API key es requerida."
      });
    }

    const ai = new GoogleGenAI({ apiKey }); // Corrección: pasar apiKey directamente

    const prompt = `
You are an expert UI developer specialized in HTML and TailwindCSS. Your main task is to create or edit mobile-friendly UI components **strictly based on the Material 3 design system**, like Flutter Material 3, using only HTML and TailwindCSS.

You will receive two inputs:
1. Existing HTML code (can be empty).
${htmlCode || "<!-- Empty -->"}
2. A client prompt (modification or design request):
${clientPrompt}

Your job:
- If the HTML is empty, generate a fresh Material 3-inspired layout based on the client prompt.
- If HTML is provided, **keep the existing layout and style** as much as possible and only apply the changes requested.
- Use TailwindCSS exclusively. The output must look like Material 3 (rounded corners, elevation, padding, spacing, button styles, color hierarchy, etc.).
- Do not include explanations, markdown syntax, or extra content. Return only **valid JSON** in the exact format shown below.


Format (strictly follow this JSON response model):
{
  "newHtml": "<!-- updated or newly created HTML using Tailwind -->",
  "AIResponse": "Brief description of what was modified or added"
}

CRITICAL FORMATTING RULES:
- Return clean, unescaped HTML in the "newHtml" field
- DO NOT escape quotes with backslashes in the HTML
- DO NOT use \\n or line break escapes
- DO NOT escape forward slashes (/) 
- The HTML should be ready to copy-paste directly into a file
- Example: Use class="flex items-center" NOT class=\\"flex items-center\\"

Important:
- Reject or ignore unrelated or off-topic client prompts (e.g., jokes, general chat), but do so politely.
- Be concise and deterministic. Do not redesign the layout unless explicitly asked.
- Prioritize Material 3 principles such as spacing, color hierarchy, surface elevation, shadows, and typography.
- Respond in the same language as the client prompt. If the client writes in Spanish, respond in Spanish. If in English, respond in English.
- Return the "newHtml" value as a SINGLE-LINE string (no "\n", no line breaks) just raw html.
- The "AIResponse" must:
  - Be written for a **non-technical client**.
  - Never mention TailwindCSS, Material 3, or technical implementation details.
  - Always end with the phrase: **"{client request summarized} y fue agregado al diagrama"** (e.g., "Se añadió un formulario de contacto y fue agregado al diagrama").
`;

    // Generar contenido usando Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // or "gemini-2.0-flash" if that's what works for you
      contents: [{ text: prompt }],
    });
    let generatedText = response.text;
    

    // Intentar parsear como JSON para validar
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedText);
    } catch (parseError) {
      // Si el parsing falla, intentar extraer JSON de la respuesta
      // Buscar tanto objetos {} como arrays []
      const objectMatch = generatedText.match(/\{[\s\S]*\}/);
      const arrayMatch = generatedText.match(/\[[\s\S]*\]/);

      const jsonMatch = objectMatch || arrayMatch;

      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          return res.status(500).json({
            error: "Failed to parse AI response as JSON",
            details: secondParseError.message,
            rawResponse: generatedText
          });
        }
      } else {
        return res.status(500).json({
          error: "No valid JSON found in AI response",
          rawResponse: generatedText
        });
      }
    }

    // Validar que la respuesta tenga la estructura esperada
    if (!parsedResponse.newHtml || !parsedResponse.AIResponse) {
      return res.status(500).json({
        error: "Invalid response structure from AI",
        rawResponse: generatedText
      });
    }

    res.json(parsedResponse);

  } catch (error) {
    console.error("Error processing code:", error);
    res.status(500).json({
      error: "Failed to process code",
      details: error.message
    });
  }
};

export const correctDartCode = async (dartResponse, apiKey) => {
  try {
    if (!dartResponse || !Array.isArray(dartResponse)) {
      throw new Error("dartResponse must be an array");
    }

    if (!apiKey) {
      throw new Error("API key is required");
    }

    const ai = new GoogleGenAI({ apiKey });
    const correctedPages = [];

    // Procesar cada página individualmente
    for (const page of dartResponse) {
      const { id, name, flutterCode } = page;

      const correctionPrompt = `Corrige este código Flutter Dart y devuelve SOLO el código corregido sin explicaciones ni markdown:

${flutterCode}
- Return ONLY a valid JSON array (no markdown, no explanation).

Corrige errores de sintaxis, layout, widgets mal usados, y mejora el código siguiendo las mejores prácticas de Flutter`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ text: correctionPrompt }],
      });

      let correctedCode = response.text.trim();
      
      // Limpiar markdown si existe
      correctedCode = correctedCode.replace(/```dart\n?/g, '').replace(/```\n?/g, '').trim();

      // Reagregar al array con la misma estructura
      correctedPages.push({
        id,
        name,
        flutterCode: correctedCode
      });
    }
    console.log(correctedPages)
    return correctedPages;
    

  } catch (error) {
    console.error("Error correcting Dart code:", error);
    throw error;
  }
};