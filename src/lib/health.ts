import { Pool } from "pg";

export interface HealthError {
  type: "config" | "server";
  title: string;
  message: string;
}

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "AUTH_SECRET",
] as const;

export function isConfigured(): boolean {
  return REQUIRED_ENV_VARS.every((key) => !!process.env[key]);
}

export async function getStartupError(): Promise<HealthError | null> {
  if (!isConfigured()) {
    return {
      type: "config",
      title: "Not configured!",
      message:
        "Hyreli is missing required environment variables and cannot start. Copy .env.example to .env and fill in the values, then restart the application.",
    };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
  } catch {
    return {
      type: "server",
      title: "Server Error",
      message:
        "Hyreli could not connect to the database. The server may be temporarily unavailable. Please try again later or contact the administrator.",
    };
  } finally {
    await pool.end();
  }

  return null;
}
