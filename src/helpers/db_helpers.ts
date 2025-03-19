import { Client } from "pg";
import botHelpers from "./common";
import dotenv from "dotenv";

dotenv.config();
const { logger } = botHelpers();

const postgresUser = process.env.POSTGRES_USER;
const postgresPassword = process.env.POSTGRES_PASSWORD;
const postgresHost = process.env.POSTGRES_HOST;
const postgresPort = process.env.POSTGRES_PORT;
const postgresDb = process.env.POSTGRES_DB;

// Get database URL from environment
const DB_URL = `postgresql://${postgresUser}:${postgresPassword}@${postgresHost}:${postgresPort}/${postgresDb}`;

if (!DB_URL) {
  console.error("❌ DATABASE_URL is not set in the environment.");
  process.exit(1);
}

// Initialize PostgreSQL client
const client = new Client({ connectionString: DB_URL });

client
  .connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL database!");
    logger("Connected to PostgreSQL database");

    // Ensure the table exists
    client.query(
      `CREATE TABLE IF NOT EXISTS index_entries (
        message_id BIGINT PRIMARY KEY,
        text TEXT,
        date TIMESTAMP,
        sender TEXT
      );`
    )
      .then(() => console.log("✅ Table 'index_entries' is ready."))
      .catch((err: any) => console.error("❌ Error creating table:", err.message));
  })
  .catch((err: any) => {
    console.error("❌ Error connecting to PostgreSQL:", err.message);
    process.exit(1);
  });

const dbHelpers = () => {
  // Load index from PostgreSQL
  const loadIndex = async (): Promise<Record<string, any>> => {
    try {
      const res = await client.query("SELECT * FROM index_entries");
      console.log(`✅ Loaded ${res.rows.length} entries from the database.`);
      logger(`Loaded ${res.rows.length} entries from the database.`);

      const index: Record<string, any> = {};
      res.rows.forEach((row: any) => {
        index[row.message_id] = {
          message_id: row.message_id,
          text: row.text,
          date: row.date,
          sender: row.sender,
        };
      });

      return index;
    } catch (err: any) {
      console.error(`❌ Error loading index: ${err.message}`);
      logger(`Error loading index: ${err.message}`, "error");
      return {};
    }
  };

  // Save the index to PostgreSQL
  const saveIndex = async (index: Record<string, any>) => {
    try {
      for (const message_id in index) {
        const entry = index[message_id];
        const unixTimestamp = entry.date;
        const timestamp = new Date(unixTimestamp * 1000);
        await client.query(
          `INSERT INTO index_entries (message_id, text, date, sender) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (message_id) DO UPDATE 
           SET text = EXCLUDED.text, date = EXCLUDED.date, sender = EXCLUDED.sender`,
          [entry.message_id, entry.text, timestamp, entry.sender]
        );
        console.log(`✅ Saved message_id ${entry.message_id} to database.`);
        logger(`Saved message_id ${entry.message_id} to database.`);
      }
    } catch (err: any) {
      console.error(`❌ Error saving entries: ${err.message}`);
      logger(`Error saving entries: ${err.message}`, "error");
    }
  };

  return {
    loadIndex,
    saveIndex,
  };
};

export default dbHelpers;
