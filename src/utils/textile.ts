import { Buckets, Client, PrivateKey, ThreadID, Where, UserAuth, KeyInfo } from '@textile/hub'
// @ts-ignore
import { readAndCompressImage } from 'browser-image-resizer'
import { MemeMetadata, TokenMetadata, Schema } from './Types'

export class Textile {
  private identity: PrivateKey;
  private userAuth: UserAuth;
  private keyInfo: KeyInfo;
  private client: Client;
  private threadID: ThreadID;
  private bucketInfo: {
    bucket?: Buckets,
    bucketKey?: string
  };

  private dbThreadID: string;
  private hubAuthURL: string;
  private dbName = 'memeofthedaydb';
  private memeCollectionName = 'mememetadata';
  private ipfsGateway = 'https://hub.textile.io';

  private tokenImageConfig = {
    maxWidth: 800,
    maxHeigth: 800
  };
 
  private static singletonInstace: Textile;

  public static async getInstance(): Promise<Textile> {
    if (!Textile.singletonInstace) {
      Textile.singletonInstace = new Textile();
      await Textile.singletonInstace.init();
    }

    return Textile.singletonInstace;
  }

  private async init() {
    const env = process.env.REACT_APP_ENV;
    console.log(env);

    this.hubAuthURL = env !== 'production' ? process.env.REACT_APP_TEST_HUB_BROWSER_AUTH_URL as string
     : process.env.REACT_APP_PROD_HUB_BROWSER_AUTH_URL as string;

    this.identity = await this.getIdentity();
    let buckets: Buckets;

    if (env !== "production") {
      this.dbThreadID = process.env.REACT_APP_TEST_THREADID as string;
      this.keyInfo = await this.getKeyInfo();
      buckets = await Buckets.withKeyInfo(this.keyInfo);
      this.client = await Client.withKeyInfo(this.keyInfo);
    } else {
      this.dbThreadID = process.env.REACT_APP_PROD_THREADID as string;
      this.userAuth = await this.getUserAuth();

      buckets = await Buckets.withUserAuth(this.userAuth);
      this.client = await Client.withUserAuth(this.userAuth);
    }

    await buckets.getToken(this.identity);
    await this.client.getToken(this.identity);

    const buck = await buckets.getOrCreate('memeoftheday');
    //await this.client.updateCollection(ThreadID.fromString(this.dbThreadID), {name: this.memeCollectionName, schema: Schema});
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

    // TODO: Implement a pagination logic to query only limited data.
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

  public async getMemeMetadata(cid: string) {
    if (!this.client) {
      throw new Error('No client');
    }

    const query = new Where('cid').eq(cid);
    const memeList = await this.client.find<MemeMetadata>(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, query);

    return memeList[0];
  }

  public async updateMemeMetadata(meme: MemeMetadata) {
    if (!this.client || !meme._id) {
      throw new Error("No client or meme doesn't contain a valid id property");
    }

    await this.client.save(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, [meme]);
  }

  public async uploadMeme(file: File, memeName: string = "", description: string = ""): Promise<MemeMetadata> {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
      throw new Error('No bucket client or root key');
    }

    const now = new Date().getTime();
    const fileName = `${file.name}`;
    const uploadName = `${now}_${fileName}`;
    const location = `memes/${uploadName}`;
    const previewLocation = `preview/${uploadName}`;

    const previewImage = await readAndCompressImage(file, this.tokenImageConfig);

    const previewBuf = await previewImage.arrayBuffer();
    const buf = await file.arrayBuffer();
    const raw = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, location, buf);
    const previewRaw = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, previewLocation, previewBuf);

    return {
      cid: raw.path.cid.toString(),
      previewCID: previewRaw.path.cid.toString(),
      name: memeName,
      description: description,
      path: location,
      previewPath: previewLocation,
      //tokenMetadataURL: tokenMetadata.url,
      //tokenMetadataPath: tokenMetadata.path,
      date: now.toString(),
      txHash: "",
      likes: 0,
      dislikes: 0,
      likedBy: new Array<string>(),
      dislikedBy: new Array<string>(),
      owner: "",
      tags: new Array<string>()
    };
  }

  public async uploadMemeMetadata(metadata: MemeMetadata) {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey || !this.client) {
      throw new Error('No bucket or client or root key');
    }

    await this.client.create(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, [metadata]);
  }

  public async updateMemeVotes(userId: string, cid: string, isLiked: boolean, isAdd: boolean): Promise<boolean> {
    if (!this.client) {
      throw new Error('No client');
    }

    // Ideally we need not query the instance here to update.
    // TODO, use collections write-validator to run validations on writes.
    const query = new Where('cid').eq(cid);
    const memeList = await this.client.find<MemeMetadata>(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, query);

    if (memeList[0].owner === userId) {
      return false;
    }

    let voteList = isLiked ? memeList[0].likedBy : memeList[0].dislikedBy;

    if (!voteList) {
      memeList[0].likedBy = new Array<string>();
      memeList[0].dislikedBy = new Array<string>();

      voteList = isLiked ? memeList[0].likedBy : memeList[0].dislikedBy;
    }

    if (isAdd) {
      if (voteList.includes(userId)) {
        return false;
      } else {
        voteList.push(userId);
      }
    } else {
      const index = voteList.indexOf(userId);
      if (index > -1) {
        voteList.splice(index, 1);
      } else {
        return false;
      }
    }

    memeList[0].likes = memeList[0].likedBy.length;
    memeList[0].dislikes = memeList[0].dislikedBy.length;

    await this.client.save(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, memeList);
    return true;
  }

  public async deleteMemeFromBucket(meme: MemeMetadata) {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey) {
      throw new Error('No bucket client or root key');
    }

    await this.bucketInfo.bucket.removePath(this.bucketInfo.bucketKey, meme.path);

    if (meme.previewPath) {
      await this.bucketInfo.bucket.removePath(this.bucketInfo.bucketKey, meme.previewPath);
    }

    if (meme.tokenMetadataPath) {
      await this.bucketInfo.bucket.removePath(this.bucketInfo.bucketKey, meme.tokenMetadataPath);
    }
  }

  public async uploadTokenMetadata(meme: MemeMetadata) {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey || !meme.tokenID || !meme.previewCID) {
      throw new Error('No bucket client or root key or tokenID');
    }

    const tokenMeta: TokenMetadata = {
      name: meme.name,
      description: meme.description,
      image: `${this.ipfsGateway}/ipfs/${meme.previewCID}`
    };

    const uploadName = `${meme.tokenID}.json`;
    const location = `tokenmetadata/${uploadName}`;

    const buf = Buffer.from(JSON.stringify(tokenMeta, null, 2))
    const raw = await this.bucketInfo.bucket.pushPath(this.bucketInfo.bucketKey, location, buf);

    meme.tokenMetadataPath = location;
    meme.tokenMetadataURL = `${this.ipfsGateway}/ipfs/${raw.path.cid.toString()}`;
  }

  private async getKeyInfo(): Promise<KeyInfo> {
    const hubKeyURL = `${this.hubAuthURL}/keyinfo`;

    const response = await fetch(hubKeyURL, {
      method: 'GET'
    });

    const auth: KeyInfo = await response.json();

    return auth;
  }

  private async getUserAuth(): Promise<UserAuth> {
    const hubAuthURL = `${this.hubAuthURL}/userauth`;

    const response = await fetch(hubAuthURL, {
      method: 'GET'
    });

    const auth: UserAuth = await response.json();

    return auth;
  }

  private async getIdentity(): Promise<PrivateKey> {
    const hubIdentityURL = process.env.REACT_APP_ENV !== 'production' ? `${this.hubAuthURL}/testidentity` : `${this.hubAuthURL}/identity`;

    const response = await fetch(hubIdentityURL, {
      method: 'GET'
    });

    let userKey = await response.text();
    if (!userKey) {
      userKey = PrivateKey.fromRandom().toString();
    }

    const key: PrivateKey = PrivateKey.fromString(userKey);

    return key;
  }
}
