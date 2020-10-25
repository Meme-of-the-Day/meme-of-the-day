import { Buckets, KeyInfo, PrivateKey, WithKeyInfoOptions } from '@textile/hub'
import { MemeIndex, MemeMetadata } from './Types'

export class Textile {
  private apiKey: string;
  private userKey: string;
  private identity: PrivateKey;
  private keyInfo: KeyInfo;
  private keyInfoOptions: WithKeyInfoOptions;
  private memeIndex: MemeIndex;
  private bucketInfo: {
    bucket?: Buckets,
    bucketKey?: string
  };

  private static singletonInstace: Textile;

  public static async getInstance(): Promise<Textile> {
    if (!Textile.singletonInstace) {
      Textile.singletonInstace = new Textile();
      await Textile.singletonInstace.init();
    }

    return Textile.singletonInstace;
  }

  private constructor(apiKey?: string, userKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    } else {
      this.apiKey = process.env.REACT_APP_API_KEY as string;
    }

    if (userKey) {
      this.userKey = userKey;
    } else {
      this.userKey = process.env.REACT_APP_USER_KEY as string;
    }

    this.keyInfo = {
      key: this.apiKey
    };

    this.keyInfoOptions = {
      debug: false
    };

    this.identity = this.getIdentity(this.userKey);
    this.bucketInfo = {};
    this.memeIndex = {
      paths: new Array<string>()
    };
  }

  private async init() {
    if (!this.identity) {
      throw new Error('Identity not set');
    }
    const buckets = await Buckets.withKeyInfo(this.keyInfo, this.keyInfoOptions);
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(this.identity);

    const buck = await buckets.getOrCreate('memeoftheday');

    if (!buck.root) {
      throw new Error('Failed to get or create bucket');
    }

    this.bucketInfo = {
      bucket: buckets,
      bucketKey: buck.root.key
    };

    this.memeIndex = await this.getIndexAtKey();
  }

  public async getAllMemes() {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
      throw new Error('No bucket client or root key');
    }

    let memes: Array<MemeMetadata> = [];

    for (let path of this.memeIndex.paths) {
      const metadata = await this.bucketInfo.bucket.pullPath(this.bucketInfo.bucketKey, path)

      const { value } = await metadata.next();
      let str = "";
      for (var i = 0; i < value.length; i++) {
        str += String.fromCharCode(parseInt(value[i]));
      }

      const meme: MemeMetadata = JSON.parse(str)
      memes.push(meme);
    }

    return memes;
  }

  public async uploadMeme(file: File): Promise<MemeMetadata> {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
      throw new Error('No bucket client or root key');
    }

    const now = new Date().getTime();
    const fileName = `${file.name}`;
    const uploadName = `${now}_${fileName}`;
    const location = `memes/${uploadName}`;

    const buf = await file.arrayBuffer();
    const raw = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, location, buf);

    return {
      cid: raw.path.cid.toString(),
      name: fileName,
      path: location,
      date: now.toString()
    };
  }

  public async uploadMemeMetadata(metadata: MemeMetadata) {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
      throw new Error('No bucket client or root key');
    }

    const metaBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    const metaname = `${metadata.date}_${metadata.name}.json`;
    const path = `metadata/${metaname}`;
    await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, path, metaBuffer);

    await this.syncDatabase();
    this.memeIndex.paths.push(path);
    await this.storeIndex(this.memeIndex);
  }

  private async syncDatabase() {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
      throw new Error('No bucket client or root key');
    }

    this.memeIndex = await this.getIndexAtKey();
  }
  
  private getIdentity(key?: string): PrivateKey {
    if (key) {
      return PrivateKey.fromString(key);
    }

    const identity = PrivateKey.fromRandom();
    this.userKey = identity.toString();

    return identity;
  }

  private async getIndexAtKey() {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
      throw new Error('No bucket client or root key');
    }

    try {
      const metadata = this.bucketInfo.bucket.pullPath(this.bucketInfo.bucketKey, 'index.json');
      const { value } = await metadata.next();

      let str = "";
      for (var i = 0; i < value.length; i++) {
        str += String.fromCharCode(parseInt(value[i]));
      }

      const index: MemeIndex = JSON.parse(str);
      return index;
    } catch (error) {
      const index = {
        paths: new Array<string>()
      };

      await this.storeIndex(index);

      return index;
    }
  }

  private async storeIndex(index: MemeIndex) {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
      throw new Error('No bucket client or root key');
    }

    const buf = Buffer.from(JSON.stringify(index, null, 2));
    const path = `index.json`;

    await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, path, buf);
  }
}
