
// Helper function to extract class name from Flutter code
export function extractClassName(flutterCode) {
  const match = flutterCode.match(/class\s+(\w+)\s+extends/);
  return match ? match[1] : null;
}

// Helper function to convert string to PascalCase
export function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Helper function to convert string to snake_case
export function toSnakeCase(str) {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

// Helper function to convert string to kebab-case
export function toKebabCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

// Generate main.dart content with routing
export function generateMainDart(pageImports, routeEntries, firstPage) {
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


// Función para limpiar y formatear HTML escapado
export const formatEscapedHtml = async (escapedHtml) => {
  if (!escapedHtml || typeof escapedHtml !== 'string') {
    return escapedHtml;
  }

  let cleanHtml = escapedHtml
    // Limpiar comillas escapadas
    .replace(/\\"/g, '"')
    // Limpiar slashes escapados
    .replace(/\\\//g, '/')
    // Limpiar saltos de línea escapados
    .replace(/\\n/g, '\n')
    // Limpiar tabs escapados
    .replace(/\\t/g, '\t')
    // Limpiar backslashes dobles
    .replace(/\\\\/g, '\\');

  return cleanHtml;
};

// Función más completa que también formatea el HTML con indentación
export const formatAndIndentHtml = (escapedHtml, indentSize = 2) => {
  console.log(escapedHtml)
  // Primero limpiar caracteres escapados
  let cleanHtml = formatEscapedHtml(escapedHtml);
  
  // Formatear con indentación básica
  let formatted = '';
  let indent = 0;
  const indentStr = ' '.repeat(indentSize);
  
  // Dividir por tags para formatear
  const tags = cleanHtml.match(/<\/?[^>]+>/g) || [];
  let currentPos = 0;
  
  tags.forEach(tag => {
    const tagStart = cleanHtml.indexOf(tag, currentPos);
    
    // Agregar contenido antes del tag
    if (tagStart > currentPos) {
      const content = cleanHtml.substring(currentPos, tagStart).trim();
      if (content) {
        formatted += indentStr.repeat(indent) + content + '\n';
      }
    }
    
    // Procesar el tag
    if (tag.startsWith('</')) {
      // Tag de cierre - reducir indentación
      indent = Math.max(0, indent - 1);
      formatted += indentStr.repeat(indent) + tag + '\n';
    } else if (tag.endsWith('/>')) {
      // Tag auto-cerrado
      formatted += indentStr.repeat(indent) + tag + '\n';
    } else {
      // Tag de apertura
      formatted += indentStr.repeat(indent) + tag + '\n';
      // Solo aumentar indent si no es un tag inline común
      const tagName = tag.match(/<(\w+)/)?.[1]?.toLowerCase();
      const inlineTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
      if (!inlineTags.includes(tagName)) {
        indent++;
      }
    }
    
    currentPos = tagStart + tag.length;
  });
  
  // Agregar contenido restante
  if (currentPos < cleanHtml.length) {
    const content = cleanHtml.substring(currentPos).trim();
    if (content) {
      formatted += indentStr.repeat(indent) + content + '\n';
    }
  }
  
  return formatted.trim();
};

