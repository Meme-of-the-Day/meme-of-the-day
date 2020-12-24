/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/** Provides nodejs access to a global Websocket value, required by Hub API */

;(global as any).WebSocket = require('isomorphic-ws');  // Needed to enable web sockets for textile

import koa from "koa";
import Router from "koa-router";
import logger from "koa-logger";
import json from "koa-json";
import bodyParser from "koa-bodyparser";
import websockify from "koa-websocket";
import cors from "@koa/cors";
import dotenv from "dotenv";
import api from "./api";

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  if (!process.env.APP_PROD_API_KEY || !process.env.APP_PROD_API_SECRET) {
    process.exit(1);
  }
} else {
  if (!process.env.APP_TEST_API_KEY || !process.env.APP_TEST_USER_KEY) {
    process.exit(1);
  }
}

const PORT = parseInt(process.env.PORT as string, 10) || 3001;

const app = websockify(new koa());

/** Middlewares */
app.use( json() );
app.use( logger() );
app.use( bodyParser() );
app.use( cors() );

/**
 * Start HTTP Routes
 */
const router = new Router();
app.use( router.routes() ).use( router.allowedMethods() );

/**
 * Create Rest endpoint for server-side token issue
 * See ./api.ts
 */
app.use( api.routes() );
app.use( api.allowedMethods() );

/** Start the server! */
app.listen(PORT, () => console.log("Server started."));
