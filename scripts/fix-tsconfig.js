/**
 * Stellt sicher, dass tsconfig.json korrekt konfiguriert ist
 * Läuft vor jedem Build
 */

const fs = require('fs');
const path = require('path');

const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

const correctConfig = {
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "scripts", ".next", "out"]
};

try {
  // Lese existierende tsconfig.json
  let existingConfig = {};
  if (fs.existsSync(tsconfigPath)) {
    const content = fs.readFileSync(tsconfigPath, 'utf-8');
    try {
      existingConfig = JSON.parse(content);
    } catch (e) {
      console.log('⚠️  Konnte tsconfig.json nicht parsen, erstelle neue...');
    }
  }

  // Prüfe ob baseUrl und paths korrekt sind
  const needsFix = !existingConfig.compilerOptions?.baseUrl || 
                   !existingConfig.compilerOptions?.paths?.['@/*'];

  if (needsFix) {
    console.log('🔧 Repariere tsconfig.json für @ path alias...');
    fs.writeFileSync(tsconfigPath, JSON.stringify(correctConfig, null, 2) + '\n');
    console.log('✅ tsconfig.json wurde korrigiert');
  } else {
    console.log('✅ tsconfig.json ist korrekt konfiguriert');
  }
} catch (error) {
  console.error('❌ Fehler beim Reparieren von tsconfig.json:', error.message);
  // Trotzdem fortfahren
  process.exit(0);
}
