const fs = require('fs');
const path = require('path');

const replacements = {
  // Backgrounds
  'bg-white': 'bg-surface',
  'bg-slate-50': 'bg-background',
  'bg-gray-50': 'bg-background',
  'bg-background-light': 'bg-background',
  
  // Texts
  'text-[#1b0d0d]': 'text-text',
  'text-gray-900': 'text-text',
  'text-slate-900': 'text-text',
  'text-gray-800': 'text-text',
  'text-gray-600': 'text-muted',
  'text-gray-500': 'text-muted',
  'text-slate-600': 'text-muted',
  'text-slate-500': 'text-muted',
  
  // Borders
  'border-gray-100': 'border-border',
  'border-gray-200': 'border-border',
  'border-slate-100': 'border-border',
  'border-slate-200': 'border-border',
  'border-white/40': 'border-border',
  
  // Shadows
  'shadow-sm': 'shadow-soft',
  'shadow-[0_8px_30px_rgb(0,0,0,0.04)]': 'shadow-soft',
  'shadow-soft-red': 'shadow-soft',
};

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const [search, replace] of Object.entries(replacements)) {
        // Replace exact word matches for tailwind classes
        const regex = new RegExp(`(?<=['"\\s\`])${search.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}(?=['"\\s\`])`, 'g');
        content = content.replace(regex, replace);
      }

      // Also standard string replace for things that might not be surrounded exactly by space/quotes (like string interpolations)
      for (const [search, replace] of Object.entries(replacements)) {
         content = content.split(search).join(replace);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Class replacement complete.');
