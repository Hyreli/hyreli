const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "AUTH_SECRET",
] as const;

export function getMissingEnvVars(): string[] {
  return REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
}

export function isConfigured(): boolean {
  return getMissingEnvVars().length === 0;
}
