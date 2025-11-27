#!/usr/bin/env node
/**
 * Import Checker for verbatimModuleSyntax
 * 
 * Detects mixed type/value imports that violate TypeScript's verbatimModuleSyntax mode.
 * Run: node check-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');
const TYPE_KEYWORDS = ['type', 'interface', 'enum'];
const VALUE_PATTERNS = [/Api$/, /^use[A-Z]/, /^create/, /^api/];

// Common type names that should use 'import type'
const KNOWN_TYPES = new Set([
  'Card', 'Deck', 'Tag', 'QueueStats', 'ReviewCard', 'RatingResponse',
  'CardListResponse', 'CardFilters', 'CardCreateRequest', 'CardUpdateRequest',
  'UserSettings', 'UserSettingsUpdate', 'ImportResponse', 'ImportStatus'
]);

function isLikelyType(name) {
  return KNOWN_TYPES.has(name);
}

function isLikelyValue(name) {
  return VALUE_PATTERNS.some(pattern => pattern.test(name));
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    // Check for mixed imports: import { value, Type } from '...'
    const importMatch = line.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
    
    if (importMatch && !line.includes('import type')) {
      const imports = importMatch[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]);
      const source = importMatch[2];
      
      // Check if mixing types and values
      const hasTypes = imports.some(isLikelyType);
      const hasValues = imports.some(isLikelyValue);
      
      if (hasTypes && !line.includes('import type')) {
        const typeImports = imports.filter(isLikelyType);
        issues.push({
          line: index + 1,
          content: line.trim(),
          issue: `Possible type imports without 'import type': ${typeImports.join(', ')}`,
          suggestion: `Split into:\nimport { ${imports.filter(isLikelyValue).join(', ')} } from '${source}';\nimport type { ${typeImports.join(', ')} } from '${source}';`
        });
      }
    }
  });

  return issues;
}

function scanDirectory(dir) {
  const allIssues = [];
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        scan(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        const issues = checkFile(fullPath);
        if (issues.length > 0) {
          allIssues.push({
            file: path.relative(SRC_DIR, fullPath),
            issues
          });
        }
      }
    }
  }
  
  scan(dir);
  return allIssues;
}

function main() {
  console.log('🔍 Checking for import issues with verbatimModuleSyntax...\n');
  
  const results = scanDirectory(SRC_DIR);
  
  if (results.length === 0) {
    console.log('✅ No import issues detected!\n');
    return;
  }
  
  console.log(`⚠️  Found potential issues in ${results.length} file(s):\n`);
  
  results.forEach(({ file, issues }) => {
    console.log(`📄 ${file}`);
    issues.forEach(({ line, content, issue, suggestion }) => {
      console.log(`  Line ${line}: ${issue}`);
      console.log(`    Current: ${content}`);
      if (suggestion) {
        console.log(`    Suggested:\n${suggestion.split('\n').map(l => `      ${l}`).join('\n')}`);
      }
      console.log('');
    });
  });
  
  console.log('\n💡 Tip: With verbatimModuleSyntax enabled, always use "import type" for type-only imports.\n');
}

main();
