"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const helpers_1 = __importDefault(require("./helpers"));
const { logger } = (0, helpers_1.default)();
dotenv_1.default.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const INDEX_FILE = "./data/index.json";
// Load existing index
function loadIndex() {
    try {
        const data = fs_1.default.readFileSync(INDEX_FILE, "utf8");
        return data ? JSON.parse(data) : {};
    }
    catch (error) {
        logger(`Could not load index file: ${error}`, "error");
        return {};
    }
}
// Save index to file
function saveIndex(index) {
    fs_1.default.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), "utf8");
}
// Format and update the pinned message
function updatePinnedMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        const index = loadIndex();
        // Sort alphabetically by caption or file name
        const sortedEntries = Object.values(index)
            .sort((a, b) => a.text.localeCompare(b.text))
            .map((item) => `📌 [${item.text}](https://t.me/c/${CHANNEL_ID.replace("-100", "")}/${item.message_id})`)
            .join("\n");
        if (!sortedEntries)
            return;
        const pinnedMessage = `🎥 **Indice dei film:**\n\n${sortedEntries}`;
        try {
            // Get chat details, including pinned message (if it exists)
            const chat = yield bot.getChat(CHANNEL_ID);
            const pinnedMsg = chat.pinned_message;
            if (pinnedMsg) {
                logger(`Updating existing pinned message: ${pinnedMsg.message_id}`);
                yield bot.editMessageText(pinnedMessage, {
                    chat_id: CHANNEL_ID,
                    message_id: pinnedMsg.message_id,
                    parse_mode: "Markdown",
                    disable_web_page_preview: true,
                });
            }
            else {
                console.log("No pinned message found. Creating a new one.");
                const sentMessage = yield bot.sendMessage(CHANNEL_ID, pinnedMessage, {
                    parse_mode: "Markdown",
                    disable_web_page_preview: true,
                });
                yield bot.pinChatMessage(CHANNEL_ID, sentMessage.message_id);
            }
        }
        catch (error) {
            logger(`Error updating pinned message: ${error}`, "error");
        }
    });
}
// Handel direct messages
bot.on("message", (msg) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Full msg object:', msg);
    if (msg.chat.type === "private") {
        // This is a private message sent directly to the bot
        logger(`Received a private message from ${msg.chat.username || msg.chat.first_name}: ${msg.text}`);
        console.log(`Received a private message from ${msg.chat.username || msg.chat.first_name}: ${msg.text}`);
        const response = "This is not a chat bot.\nThis bot generates an index of messages in a channel. If you want to know more, contact @Zono_ciapponeesee";
        yield bot.sendMessage(msg.chat.id, response);
    }
}));
// Handle new messages
bot.on("channel_post", (msg) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Full msg object:', msg);
    if (msg.chat.id.toString() !== CHANNEL_ID)
        return;
    const document = msg.document;
    const video = msg.video;
    if (!document && !video)
        return;
    // Check if it's a Matroska file or any video
    const isMatroska = (document === null || document === void 0 ? void 0 : document.mime_type) === "video/x-matroska";
    const isVideo = !!video;
    if (!isMatroska && !isVideo)
        return;
    // Extract text
    const text = msg.caption && msg.caption.trim() !== "" ? msg.caption : (document === null || document === void 0 ? void 0 : document.file_name) || (video === null || video === void 0 ? void 0 : video.file_name);
    if (!text)
        return;
    // Create entry
    const index = loadIndex();
    index[msg.message_id] = {
        message_id: msg.message_id,
        text,
        date: msg.date,
        sender: msg.chat.title || "Unknown",
    };
    // Save and update pinned message
    saveIndex(index);
    yield updatePinnedMessage();
}));
logger('Bot is running...');
