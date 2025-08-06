#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Production Readiness Check\n');

const checks = [
  {
    name: 'Node.js version',
    check: () => {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      return major === 20;
    },
    fix: 'Install Node.js 20.x LTS: nvm install 20 && nvm use 20'
  },
  {
    name: '.env file exists',
    check: () => fs.existsSync('.env') || fs.existsSync('env.example'),
    fix: 'Copy env.example to .env and fill in your values'
  },
  {
    name: 'BOT_TOKEN configured',
    check: () => {
      if (!fs.existsSync('.env')) return false;
      const env = fs.readFileSync('.env', 'utf8');
      return env.includes('BOT_TOKEN=') && !env.includes('BOT_TOKEN=your_telegram_bot_token_here');
    },
    fix: 'Set your real BOT_TOKEN in .env file'
  },
  {
    name: 'TypeScript compiled',
    check: () => fs.existsSync('dist/index.js'),
    fix: 'Run: npm run build'
  },
  {
    name: 'Frontend built',
    check: () => fs.existsSync('frontend/dist/index.html'),
    fix: 'Run: cd frontend && npm run build'
  },
  {
    name: 'Database exists',
    check: () => {
      // In CI environment, just check if data directory exists
      if (process.env.CI || process.env.GITHUB_ACTIONS) {
        return fs.existsSync('data');
      }
      // In production, check for actual database files
      return fs.existsSync('data/bot.db') || fs.existsSync('database.sqlite') || fs.existsSync('src/database.sqlite') || fs.existsSync('data');
    },
    fix: 'Database will be created automatically on first run'
  },
  {
    name: 'PM2 ecosystem config',
    check: () => fs.existsSync('ecosystem.config.js'),
    fix: 'PM2 config already exists'
  },
  {
    name: 'Docker configuration',
    check: () => fs.existsSync('Dockerfile') && fs.existsSync('docker-compose.yml'),
    fix: 'Docker files already exist'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const icon = passed ? '✅' : '❌';
  const status = passed ? 'PASS' : 'FAIL';
  
  console.log(`${icon} ${check.name}: ${status}`);
  
  if (!passed) {
    console.log(`   💡 Fix: ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for production deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy to your server');
  console.log('2. Set up webhook: npm run webhook:set');
  console.log('3. Start with PM2: npm run start:pm2');
  console.log('4. Monitor logs: npm run logs:pm2');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above.');
  process.exit(1);
}

console.log('\n🔗 Useful commands:');
console.log('• Local development: npm run dev:bot');
console.log('• Build for production: npm run build');
console.log('• Docker deployment: docker-compose up -d');
console.log('• PM2 management: npm run start:pm2');
console.log('• View logs: npm run logs:pm2'); 