import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

// Your Telegram bot token
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN in .env file');
}

const bot = new TelegramBot(TOKEN, { polling: true });

// Store the indexed messages
let messageIndex: { [key: string]: string } = {};

// Replace with your channel ID (should be in the format "-100xxxxxxxxxx")
const CHANNEL_ID = '@your_channel_or_id';

bot.on('message', (msg) => {
  console.log('msg object', msg)
  console.log('channel id', msg.chat.id.toString())
  return;
  // // Check if the message is from the correct channel and if it's sent by you
  // if (msg.chat.id.toString() === process.env.TELEGRAM_CHANNEL_ID) {
  //   if (msg.from && msg.from?.id && msg.from?.id === Number(process.env.TELEGRAM_PULE_USER_ID)) {
  //     // Save the message content in the index
  //     messageIndex[msg.message_id] = msg.text || msg.caption || "No text";
  //
  //     // Optionally, log the index to see the collected messages
  //     console.log('Updated Message Index:', messageIndex);
  //   }
  // }
});

console.log('Bot is monitoring the channel...');
