import sqlite3 from "sqlite3";
import botHelpers from "./common";
import fs from "fs";
const { logger } = botHelpers();

const DB_PATH = "/app/data/index-bot.db";
// const DB_DIR = "/app/data";

const db = new sqlite3.Database(DB_PATH, (err: any) => {
  if (err) {
    console.error(`❌ Error opening database: ${err.message}`);
    logger(`Error opening database: ${err.message}`, "error");
  } else {
    console.log(`✅ Connected to SQLite database at ${DB_PATH}`);
    logger(`Connected to SQLite database at ${DB_PATH}`);
  }
});

console.log('Attempting to create table...');
db.run(
  `CREATE TABLE IF NOT EXISTS index_entries (
    message_id INTEGER PRIMARY KEY,
    text TEXT,
    date INTEGER,
    sender TEXT
  );`,
  (err: any) => {
    if (err) {
      console.error("❌ Error creating table:", err.message);
      logger(`Error creating table: ${err.message}`, "error");
    } else {
      console.log("✅ Table 'index_entries' is ready.");
      logger("Table 'index_entries' is ready.");
    }
  }
);

// Main function that returns database methods
const dbHelpers = () => {
  const debugLogger = (message: string) => {
    console.log(message);
    logger(message);
  }

  // Function to load index from SQLite
  // const loadIndex = (): Promise<Record<string, any>> => {
  //   return new Promise((resolve, reject) => {
  //     db.all("SELECT * FROM index_entries", (err, rows) => {
  //       if (err) {
  //         console.log(`❌ Error loading index: ${err.message}`);
  //         logger(`Error loading index: ${err.message}`, "error");
  //         reject(err);
  //       } else {
  //         console.log(`✅ Loaded ${rows.length} entries from the database.`);
  //         logger(`Loaded ${rows.length} entries from the database.`);
  //         const index: Record<string, any> = {};
  //         rows.forEach((row: any) => {
  //           index[row.message_id] = {
  //             message_id: row.message_id,
  //             text: row.text,
  //             date: row.date,
  //             sender: row.sender,
  //           };
  //         });
  //         resolve(index);
  //       }
  //     });
  //   });
  // };
  //
  // // Function to save the index to SQLite
  // const saveIndex = (index: Record<string, any>) => {
  //   for (const message_id in index) {
  //     const entry = index[message_id];
  //     db.run(
  //       `INSERT OR REPLACE INTO index_entries (message_id, text, date, sender) VALUES (?, ?, ?, ?)`,
  //       [entry.message_id, entry.text, entry.date, entry.sender],
  //       (err) => {
  //         if (err) {
  //           console.log(`❌ Error saving entry ${entry.message_id}: ${err.message}`);
  //           logger(`Error saving entry ${entry.message_id}: ${err.message}`, "error");
  //         } else {
  //           console.log(`✅ Saved message_id ${entry.message_id} to database.`);
  //           logger(`Saved message_id ${entry.message_id} to database.`);
  //         }
  //       }
  //     );
  //   }
  // };


  return {
    // loadIndex,
    // saveIndex,
    debugLogger,
  };
};

export default dbHelpers;
