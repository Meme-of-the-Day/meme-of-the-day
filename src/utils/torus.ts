import { Buckets, Client, PrivateKey, ThreadID, Where, UserAuth, KeyInfo } from '@textile/hub'
// @ts-ignore
import { UserMetadata, TokenMetadata, Schema } from './torusTypes'

export class Torus {
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
  private memeCollectionName = 'usertoursdata';
  private ipfsGateway = 'https://hub.textile.io';

  private tokenImageConfig = {
    maxWidth: 800,
    maxHeigth: 800
  };

  private static singletonInstace: Torus;

  public static async getInstance(): Promise<Torus> {
    if (!Torus.singletonInstace) {
      Torus.singletonInstace = new Torus();
      await Torus.singletonInstace.init();
    }

    return Torus.singletonInstace;
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

    const buck = await buckets.getOrCreate('ahrammemebuck');


    console.log("new    Creation ");

    //  let createCol = await this.client.newCollection(ThreadID.fromString(this.dbThreadID), { name: this.memeCollectionName, schema : Schema }); 

    let list = await this.client.listCollections(ThreadID.fromString(this.dbThreadID));
    console.log(list);

    // await this.client.updateCollection(ThreadID.fromString(this.dbThreadID), { name: this.memeCollectionName, schema: Schema });

    if (!buck.root) {
      throw new Error('Failed to get or create bucket');
    }

    this.bucketInfo = {
      bucket: buckets,
      bucketKey: buck.root.key
    };
  }

  public async getUserData(verifierId: string) {
    if (!this.client || !verifierId) {
      throw new Error('No client or owner address');
    }

    const query = new Where('_id').eq(verifierId);
    const userList = await this.client.find<UserMetadata>(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, query);

    return userList;
  }

  public async getUserMetadata(cid: string) {
    if (!this.client) {
      throw new Error('No client');
    }

    const query = new Where('cid').eq(cid);
    const userList = await this.client.find<UserMetadata>(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, query);

    return userList[0];
  }

  public async updateUserMetadata(userdata: UserMetadata) {
    if (!this.client || !userdata._id) {
      throw new Error("No client or meme doesn't contain a valid id property");
    }

    await this.client.save(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, [userdata]);
  }

  public async createUserMetadata(userdata: UserMetadata) {
    if (!this.bucketInfo.bucket || !this.bucketInfo.bucketKey || !this.client) {
      throw new Error('No bucket or client or root key');
    }

    await this.client.create(ThreadID.fromString(this.dbThreadID), this.memeCollectionName, [userdata]);
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
