export interface AppConfig {
  port: number;
  frontendUrl: string;
  databaseUrl: string;
  jwt: {
    accessSecret: string;
    accessExpiresIn: number;
    refreshSecret: string;
    refreshExpiresIn: number;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
}

function parseDurationToSeconds(
  value: string | undefined,
  fallbackSeconds: number,
): number {
  if (!value) return fallbackSeconds;
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(value.trim());
  if (!match) return fallbackSeconds;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const secondsPerUnit: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return amount * secondsPerUnit[unit];
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    accessExpiresIn: parseDurationToSeconds(
      process.env.JWT_ACCESS_EXPIRES_IN,
      15 * 60, // 15m
    ),
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    refreshExpiresIn: parseDurationToSeconds(
      process.env.JWT_REFRESH_EXPIRES_IN,
      7 * 86400, // 7d
    ),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ??
      'http://localhost:3001/api/v1/auth/google/callback',
  },
});
