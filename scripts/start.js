const { spawn } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('  College Entry System - Starting...');
console.log('========================================\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Start backend
function startBackend() {
  console.log(colors.blue + '[Backend]' + colors.reset + ' Starting server on port 5001...');
  
  const backendDir = path.join(__dirname, 'backend');
  const backend = spawn('npm', ['start'], {
    cwd: backendDir,
    shell: true,
    env: { ...process.env, PORT: 5001 }
  });

  backend.stdout.on('data', (data) => {
    console.log(colors.green + '[Backend]' + colors.reset + ' ' + data.toString().trim());
  });

  backend.stderr.on('data', (data) => {
    console.error(colors.red + '[Backend Error]' + colors.reset + ' ' + data.toString().trim());
  });

  backend.on('error', (error) => {
    console.error(colors.red + '[Backend Error]' + colors.reset + ' Failed to start: ' + error.message);
  });

  return backend;
}

// Start frontend
function startFrontend() {
  console.log(colors.blue + '[Frontend]' + colors.reset + ' Starting Next.js on port 3000...');
  
  const frontendDir = path.join(__dirname, 'frontend');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: frontendDir,
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    // Look for "Ready" message from Next.js
    if (output.includes('Ready') || output.includes('started server')) {
      console.log(colors.green + '[Frontend]' + colors.reset + ' Application ready!');
      console.log(colors.yellow + '========================================');
      console.log('  Access the application at:');
      console.log('  http://localhost:3000');
      console.log('========================================' + colors.reset + '\n');
    } else {
      console.log(colors.green + '[Frontend]' + colors.reset + ' ' + output.trim());
    }
  });

  frontend.stderr.on('data', (data) => {
    console.error(colors.red + '[Frontend Error]' + colors.reset + ' ' + data.toString().trim());
  });

  frontend.on('error', (error) => {
    console.error(colors.red + '[Frontend Error]' + colors.reset + ' Failed to start: ' + error.message);
  });

  return frontend;
}

// Handle process termination
function cleanup() {
  console.log('\n\nShutting down servers...');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start both servers
console.log('Starting Backend and Frontend simultaneously...\n');
const backendProcess = startBackend();
const frontendProcess = startFrontend();

// Keep the script running
process.on('exit', () => {
  backendProcess.kill();
  frontendProcess.kill();
});

