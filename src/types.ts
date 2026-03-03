import { Hono } from 'hono';

export type Bindings = {
  DB: D1Database;
  UPLOADS?: R2Bucket; // Optional - enable after R2 bucket created
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REMEMBER_TOKEN_EXPIRES_IN: string;
  NODE_ENV: string;
  CORS_ORIGINS: string;
};

export type Variables = {
  user: {
    id_user: number;
    email: string;
    username: string;
    role: string;
  };
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

export const createApp = () => {
  return new Hono<{ Bindings: Bindings; Variables: Variables }>();
};

export default createApp;
