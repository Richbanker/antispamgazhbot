#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env file');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('❌ WEBHOOK_URL not found in .env file');
  console.log('💡 Set WEBHOOK_URL=https://yourdomain.com/bot in .env');
  process.exit(1);
}

console.log('🔗 Setting up Telegram webhook...\n');

const setWebhook = () => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
  const data = JSON.stringify({
    url: WEBHOOK_URL,
    allowed_updates: ['message', 'callback_query', 'chat_member'],
    drop_pending_updates: true
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(url, options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(responseData);
      
      if (response.ok) {
        console.log('✅ Webhook set successfully!');
        console.log(`🌐 URL: ${WEBHOOK_URL}`);
        console.log('📝 Description:', response.description);
        
        // Get webhook info to verify
        getWebhookInfo();
      } else {
        console.error('❌ Failed to set webhook:');
        console.error(response.description);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Network error:', error.message);
    process.exit(1);
  });

  req.write(data);
  req.end();
};

const getWebhookInfo = () => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
  
  https.get(url, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(responseData);
      
      if (response.ok) {
        const info = response.result;
        console.log('\n📊 Webhook Status:');
        console.log(`• URL: ${info.url || 'Not set'}`);
        console.log(`• Has custom certificate: ${info.has_custom_certificate}`);
        console.log(`• Pending updates: ${info.pending_update_count}`);
        console.log(`• Max connections: ${info.max_connections || 40}`);
        console.log(`• Allowed updates: ${info.allowed_updates?.join(', ') || 'All'}`);
        
        if (info.last_error_date) {
          console.log(`\n⚠️ Last error: ${new Date(info.last_error_date * 1000).toISOString()}`);
          console.log(`   Message: ${info.last_error_message}`);
        } else {
          console.log('\n✅ No recent errors');
        }
        
        console.log('\n🎉 Webhook is ready! Your bot will now receive updates via webhook.');
      }
    });
  });
};

// Check bot token first
const testBot = () => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
  
  https.get(url, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(responseData);
      
      if (response.ok) {
        const bot = response.result;
        console.log(`🤖 Bot authenticated: @${bot.username}`);
        console.log(`📛 Name: ${bot.first_name}`);
        console.log(`🆔 ID: ${bot.id}\n`);
        
        setWebhook();
      } else {
        console.error('❌ Invalid BOT_TOKEN');
        console.error('💡 Get a new token from @BotFather');
        process.exit(1);
      }
    });
  }).on('error', (error) => {
    console.error('❌ Network error:', error.message);
    process.exit(1);
  });
};

// Start the process
testBot(); 