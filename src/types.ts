import * as TelegramBot from "node-telegram-bot-api";

declare module "node-telegram-bot-api" {
  export interface Video {
    file_name?: string;
  }
}
