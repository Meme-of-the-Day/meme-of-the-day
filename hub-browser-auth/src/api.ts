/* eslint-disable @typescript-eslint/no-explicit-any */
/** Import our server libraries */
import Router from "koa-router";
import { createUserAuth, KeyInfo } from '@textile/security';

/**
 * Start API Routes
 *
 * All prefixed with `/api/`
 */
const api = new Router({
  prefix: '/api'
});

/**
 * Create a REST API endpoint at /api/userauth
 * This endpoint will provide authorization for _any_ user.
 */
api.get( '/userauth', async (ctx, next: () => Promise<any>) => {
  /** Get API authorization for the user */
  const auth = await createUserAuth(
    process.env.APP_PROD_API_KEY as string, // User group key
    process.env.APP_PROD_API_SECRET as string  // User group key secret
  );

  /** Return the auth in a JSON object */
  ctx.body = auth

  await next();
});

api.get( '/keyinfo', async (ctx, next: () => Promise<any>) => {
  const keyInfo: KeyInfo = {
    key: process.env.APP_TEST_API_KEY as string
  }

  /** Return the auth in a JSON object */
  ctx.body = keyInfo

  await next();
});

api.get('/identity', async (ctx, next: () => Promise<any>) => {
  /** Get API authorization for the user */
  const userKey = process.env.APP_PROD_USER_KEY as string;

  ctx.body = userKey;

  await next();
});

api.get('/testidentity', async (ctx, next: () => Promise<any>) => {
  /** Get API authorization for the user */
  const userKey = process.env.APP_TEST_USER_KEY as string;

  ctx.body = userKey;

  await next();
});

export default api;
