/* eslint-disable @typescript-eslint/no-explicit-any */
/** Import our server libraries */
import Router from "koa-router";
import { PrivateKey, UserAuth } from "@textile/hub";
import { getAPISig } from './hub-helpers';

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
  const auth = await getAPISig()

  /** Include the token in the auth payload */
  const credentials: UserAuth = {
    ...auth,
    key: process.env.USER_API_KEY as string,
  };

  /** Return the auth in a JSON object */
  ctx.body = credentials

  await next();
});

api.get('/identity', async (ctx, next: () => Promise<any>) => {
  /** Get API authorization for the user */
  const userKey = process.env.APP_USER_KEY as string;

  ctx.body = PrivateKey.fromString(userKey);

  await next();
});

export default api;
