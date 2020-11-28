import { APISig, createAPISig } from '@textile/hub';

/**
 * getAPISig uses helper function to create a new sig
 *
 * seconds (300) time until the sig expires
 */
export async function getAPISig(seconds = 300): Promise<APISig> {
  const expiration = new Date(Date.now() + 1000 * seconds)
  return await createAPISig(process.env.USER_API_SECRET as string, expiration)
}
