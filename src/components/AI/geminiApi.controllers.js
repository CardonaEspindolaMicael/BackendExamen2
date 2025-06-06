import { GoogleGenAI } from "@google/genai";
import axios from "axios";
//import fs from "fs";
import fs from "fs-extra";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";
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
I will provide a JSON array with pages in this format:
[
  {
    "id": "page-1",
    "name": "Home Page", 
    "html": "<body>...HTML content...</body>",
    "css": "...CSS content..."
  }
]

**CONVERSION RULES:**

1. **HTML to Flutter Widget Mapping:**
   - <div> → Container, Column, Row (based on CSS classes)
   - <input> → TextField, TextFormField
   - <button> → ElevatedButton, OutlinedButton, TextButton
   - <label> → Text widget
   - <span> → Text widget
   - <svg> → Icon widget or custom painter

2. **CSS/Tailwind to Flutter Styling:**
   - flex → Column/Row with MainAxis/CrossAxis alignment
   - bg-color → Container decoration with color
   - text-color → TextStyle color
   - padding/margin → EdgeInsets
   - border-radius → BorderRadius
   - shadow → BoxShadow
   - Media queries → MediaQuery.of(context).size.width conditions

3. **Layout Guidelines:**
   - Use Scaffold as root widget
   - Wrap content in SafeArea if needed
   - Use SingleChildScrollView for scrollable content
   - Implement responsive design with MediaQuery
   - Use proper Flutter color constants (Colors.blue, Color(0xFF...))

4. **Code Quality:**
   - Use StatelessWidget unless state management is clearly needed
   - Add proper imports
   - Use meaningful widget names based on page names
   - Add basic comments for complex layouts
   - Follow Flutter naming conventions (PascalCase for classes)

**OUTPUT FORMAT:**
Return ONLY a valid JSON array (no markdown, no explanation):

[
  {
    "id": "page-1",
    "name": "Home Page",
    "flutterCode": "import 'package:flutter/material.dart'; class HomePage extends StatelessWidget { @override Widget build(BuildContext context) { return Scaffold( body: SafeArea( child: // your widgets here ), ); } }"
  }
]

**IMPORTANT:** 
- Return Flutter code as a SINGLE LINE string with NO line breaks or \\n characters
- Use single spaces between code elements instead of newlines
- Escape quotes as \\" only
- Make responsive layouts using MediaQuery
- Don't add extra explanations, just return the JSON array
- Keep all Flutter code in one continuous line per flutterCode field

**INPUT DATA TO CONVERT:**
${JSON.stringify(htmlCode, null, 2)}`;

    // Generate content from Gemini (using same pattern as your imgToHtml)
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // or "gemini-2.0-flash" if that's what works for you
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

// Helper function to extract class name from Flutter code
function extractClassName(flutterCode) {
  const match = flutterCode.match(/class\s+(\w+)\s+extends/);
  return match ? match[1] : null;
}

// Helper function to convert string to PascalCase
function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Helper function to convert string to snake_case
function toSnakeCase(str) {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

// Helper function to convert string to kebab-case
function toKebabCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

// Generate main.dart content with routing
function generateMainDart(pageImports, routeEntries, firstPage) {
  const firstPageClassName = extractClassName(firstPage.flutterCode) || 'HomePage';
  
  return `import 'package:flutter/material.dart';
${pageImports.join('\n')}

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: ${firstPageClassName}(),
      routes: {
${routeEntries.join('\n')}
      },
    );
  }
}`;
}