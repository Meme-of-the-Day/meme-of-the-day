import { Buckets, KeyInfo, PrivateKey, PushPathResult, WithKeyInfoOptions } from '@textile/hub'
import { Meme } from './Types'

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
   * and then open our custom bucket named, 'meme-of-the-day'
   */
  export async function getBucketKey(keyInfo: KeyInfo, options: WithKeyInfoOptions, identity: PrivateKey) {
    if (!identity) {
      throw new Error('Identity not set');
    }
    const buckets = await Buckets.withKeyInfo(keyInfo, options);
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(identity);

    const buck = await buckets.getOrCreate('memeoftheday');

    if (!buck.root) {
      throw new Error('Failed to get or create bucket');
    }

    return {buckets: buckets, bucketKey: buck.root.key};
  }

  export async function getBucketLinks(buckets: Buckets, key: string) {
      if (!buckets || !key) {
          throw new Error('No bucket client or root key');
      }

      const links = await buckets.links(key);

      return links;
  }

  export async function getIndexAtKey(buckets: Buckets, key: string) {
    if (!buckets || !key) {
        throw new Error('No bucket client or root key');
    }

    try {
        const metadata = buckets.pullPath(key, 'index.json');
        const { value } = await metadata.next();

        let str = "";
        for (var i = 0; i < value.length; i++) {
            str += String.fromCharCode(parseInt(value[i]));
        }

        const index = JSON.parse(str);
        return index;
    } catch (error) {
        const index = initIndex();
        await storeIndex(index, buckets, key);

        return index;
    }
  }

  export async function uploadMeme(buckets: Buckets, key: string, file: File, path: string, name: string, metadata: Meme) {
    if (!buckets || !key) {
        throw new Error('No bucket client or root key');
    }

    const location = `${path}${name}`;
    const raw = await buckets.pushPath(key, location, file.stream());

    return {
        ...metadata,
        cid: raw.path.cid.toString(),
        name: name,
        path: location
    }
  }

  function initIndex() {
      const index = {
          date: (new Date()).getTime(),
          paths: []
      };

      return index;
  }

  async function storeIndex(index: any, buckets: Buckets, key: string) {
    const buf = Buffer.from(JSON.stringify(index, null, 2));
    const path = `index.json`;

    await buckets.pushPath(key, path, buf);
  }