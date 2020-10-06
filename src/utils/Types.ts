import { Buckets, Identity, UserAuth } from '@textile/hub'

export interface Meme {
    tokenID: string,
    cid: string,
    name: string,
    txHash: string,
    date: string,
    likes: Number,
    dislikes: Number,
    owner: string,
    user: string,
    tags: Array<string>,
    price: Number
}

export interface MemeIndex {
    user: string,
    paths: Array<string>
}

export interface AppState {
    metadata: Array<Meme>,
    index: MemeIndex,
    identity?: Identity,
    userAuth?: UserAuth,
    buckets?: Buckets,
    bucketKey?: string,
    www?: string,
    url?: string,
    ipns?: string,
  }