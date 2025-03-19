import TelegramBot, { Video } from "node-telegram-bot-api";
import dotenv from "dotenv";
import { botHelpers, dbHelpers } from './helpers';

const { logger } = botHelpers();
const { loadIndex, saveIndex } = dbHelpers();

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;

// Format and update the pinned message
async function updatePinnedMessage() {
  const index = await loadIndex();

  // Sort alphabetically by caption or file name
  const sortedEntries = Object.values(index)
    .sort((a: any, b: any) => a.text.localeCompare(b.text))
    .map(
      (item: any) => `📌 [${item.text}](https://t.me/c/${CHANNEL_ID.replace("-100", "")}/${item.message_id})`
    )
    .join("\n");

  if (!sortedEntries) return;

  const pinnedMessage = `🎥 **Indice dei film:**\n\n${sortedEntries}`;

  try {
    // Get chat details, including pinned message (if it exists)
    const chat = await bot.getChat(CHANNEL_ID);
    const pinnedMsg = chat.pinned_message;

    if (pinnedMsg) {
      logger(`Updating existing pinned message: ${pinnedMsg.message_id}`);
      await bot.editMessageText(pinnedMessage, {
        chat_id: CHANNEL_ID,
        message_id: pinnedMsg.message_id,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });
    } else {
      logger("No pinned message found. Creating a new one.");
      const sentMessage = await bot.sendMessage(CHANNEL_ID, pinnedMessage, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });
      await bot.pinChatMessage(CHANNEL_ID, sentMessage.message_id);
    }
  } catch (error) {
    logger(`Error updating pinned message: ${error}`, "error");
  }
}

// Handle direct messages
bot.on("message", async (msg) => {
  if (msg.chat.type === "private") {
    // This is a private message sent directly to the bot
    logger(`Received a private message from ${msg.chat.username || msg.chat.first_name}: ${msg.text}`);

    const response = "This is not a chat bot.\nThis bot generates an index of messages with mkv files in a channel. If you want to know more, contact @Zono_ciapponeesee";
    await bot.sendMessage(msg.chat.id, response);
  }
});

// Handle new messages
bot.on("channel_post", async (msg) => {
  if (msg.chat.id.toString() !== CHANNEL_ID) return;

  const document = msg.document;
  const video: Video | undefined = msg.video;
  if (!document && !video) return;

  // Check if it's a Matroska file or any video
  const isMatroska = document?.mime_type === "video/x-matroska";
  const isVideo = !!video;

  if (!isMatroska && !isVideo) return;

  // Extract text
  const text = msg.caption && msg.caption.trim() !== "" ? msg.caption : document?.file_name || video?.file_name;

  if (!text) return;

  // Create entry
  const index = await loadIndex();
  index[msg.message_id] = {
    message_id: msg.message_id,
    text,
    date: msg.date,
    sender: msg.chat.title || "Unknown",
  };
  logger(`New entry added: ${text}`);

  // Save and update pinned message
  saveIndex(index);
  await updatePinnedMessage();
});

logger('Bot is running...');
