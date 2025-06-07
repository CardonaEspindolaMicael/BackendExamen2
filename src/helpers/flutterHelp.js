
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