import { Buckets, Client, KeyInfo, PrivateKey, ThreadID, Where, WithKeyInfoOptions } from '@textile/hub'
import { MemeMetadata, TokenMetadata } from './Types'

export class Textile {
  private apiKey: string;
  private userKey: string;
  private identity: PrivateKey;
  private keyInfo: KeyInfo;
  private keyInfoOptions: WithKeyInfoOptions;
  private client: Client;
  private threadID: ThreadID;
  private bucketInfo: {
    bucket?: Buckets,
    bucketKey?: string
  };

  private dbThreadID = 'bafktwlstng3ix7pveabwrnxpg7pn55pw6dxzqyblmlvusyuqf7h4ori';
  private dbName = 'memeofthedaydb';
  private memeCollectionName = 'mememetadata';
  private ipfsGateway = 'https://hub.textile.io';

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
  }

  private async init() {
    if (!this.identity) {
      throw new Error('Identity not set');
    }
    const buckets = await Buckets.withKeyInfo(this.keyInfo, this.keyInfoOptions);
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(this.identity);

    this.client = await Client.withKeyInfo(this.keyInfo);
    await this.client.getToken(this.identity);

    const buck = await buckets.getOrCreate('memeoftheday');

    if (!buck.root) {
      throw new Error('Failed to get or create bucket');
    }

    this.bucketInfo = {
      bucket: buckets,
      bucketKey: buck.root.key
    };
  }

  public async getAllMemes() {
    if (!this.client) {
      throw new Error('No client');
    }

    // TODO: Implement a pagination logic to query only liited data.
    const memeList = await this.client.find<MemeMetadata>(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, {});

    return memeList;
  }

  public async getUserMemes(owner: string) {
    if (!this.client || !owner) {
      throw new Error('No client or owner address');
    }

    const query = new Where('owner').eq(owner);
    const memeList = await this.client.find<MemeMetadata>(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, query);

    return memeList;
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
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey || !this.client) {
      throw new Error('No bucket or client or root key');
    }

    await this.client.create(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, [metadata]);
  }

  public async uploadTokenMetadata(metadata: TokenMetadata) {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
      throw new Error('No bucket client or root key');
    }

    const now = new Date().getTime();
    const fileName = `${metadata.name}`;
    const uploadName = `${now}_${fileName}`;
    const location = `tokenmetadata/${uploadName}`;

    const buf = Buffer.from(JSON.stringify(metadata, null, 2))
    const raw = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, location, buf);

    return `${this.ipfsGateway}/ipfs/${raw.path.cid.toString()}`;
  }

  private getIdentity(key?: string): PrivateKey {
    if (key) {
      return PrivateKey.fromString(key);
    }

    const identity = PrivateKey.fromRandom();
    this.userKey = identity.toString();

    return identity;
  }
}
