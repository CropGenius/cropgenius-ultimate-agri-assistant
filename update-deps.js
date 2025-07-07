const { execSync } = require('child_process');

// Update esbuild in the nested dependency
execSync('npm install vite/esbuild@latest', { stdio: 'inherit' });
