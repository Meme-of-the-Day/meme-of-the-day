import { Buckets, KeyInfo, PrivateKey, WithKeyInfoOptions } from '@textile/hub'

/**
   * getIdentity uses a basic private key identity.
   * The user's identity will be cached client side. This is long
   * but ephemeral storage not sufficient for production apps.
   * 
   * Read more here:
   * https://docs.textile.io/tutorials/hub/libp2p-identities/
   */
  export async function getIdentity(): Promise<PrivateKey> {
    try {
      var storedIdent = localStorage.getItem("identity");
      if (storedIdent === null) {
        throw new Error('No identity');
      }

      const restored = PrivateKey.fromString(storedIdent);
      return restored;
    } catch (e) {
      /**
       * If any error, create a new identity.
       */
      try {
        const identity = PrivateKey.fromRandom();
        const identityString = identity.toString();
        localStorage.setItem("identity", identityString);

        return identity;
      } catch (err) {
        return err.message
      }
    }
  }

  /**
   * getBucketKey will create a new Buckets client with the UserAuth
   * and then open our custom bucket named, 'io.textile.dropzone'
   */
  export async function getBucketKey(keyInfo: KeyInfo, options: WithKeyInfoOptions, identity: PrivateKey) {
    if (!identity) {
      throw new Error('Identity not set');
    }
    const buckets = await Buckets.withKeyInfo(keyInfo, options);
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(identity);

    const buck = await buckets.getOrCreate('meme-of-the-day');

    if (!buck.root) {
      throw new Error('Failed to get or create bucket');
    }

    return {buckets: buckets, bucketKey: buck.root.key};
  }