const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const allFiles = walkSync('./src');
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  const authPath = path.resolve('./src/pages/auth/auth.ts');
  const fileDir = path.dirname(path.resolve(file));
  let relativePath = path.relative(fileDir, authPath).replace(/\\/g, '/');
  if (relativePath.endsWith('.ts')) relativePath = relativePath.slice(0, -3);
  if (!relativePath.startsWith('.')) relativePath = './' + relativePath;

  content = content.replace(/from '[\.\/]+services\/auth'/g, "from '" + relativePath + "'");
  content = content.replace(/from '\.\/auth'/g, "from '" + relativePath + "'");
  
  if (file.includes('pages\\auth\\auth.ts') || file.includes('pages/auth/auth.ts')) {
    content = original; // revert
  } else if (file.includes('pages\\auth\\') || file.includes('pages/auth/')) {
    content = content.replace(new RegExp("from '" + relativePath + "'", 'g'), "from './auth'");
  }

  // Adding the missing React import for JSX errors (only if JSX is used and React isn't imported)
  if (file.endsWith('.tsx') && !content.includes("import React") && !content.includes("import * as React") && content.includes("<")) {
    // wait, actually vite handles JSX transform, it's just the tsconfig.json that needs 'jsx': 'react-jsx'.
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file, 'using', relativePath);
  }
});
