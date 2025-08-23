// Centralized config for public environment variables
// Do not put secrets here. Only NEXT_PUBLIC_* vars are accessible on the client.

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ,
  appName: process.env.NEXT_PUBLIC_APP_NAME ,
  env: process.env.NEXT_PUBLIC_ENV ,
} as const;

export type AppConfig = typeof config;
