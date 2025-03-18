import fs from "fs";

type LogType = "info" | "error";

const botHelpers = () => {
  const logger = (message: string, type: LogType = "info") => {
    const logMessage = `${new Date().toISOString()} [${type.toUpperCase()}] - ${message}\n`;
    fs.appendFileSync('/app/logs/index-bot.log', logMessage, 'utf8');
  }

  return {
    logger
  }
}

export default botHelpers;
