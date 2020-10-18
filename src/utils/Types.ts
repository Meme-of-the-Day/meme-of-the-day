import { Buckets, Identity, UserAuth } from '@textile/hub'

export interface MemeMetadata {
    tokenID?: string,    // NFT tokenID
    cid: string,    // IPFS CID
    path: string,   // Bucket path
    name: string,   // meme Name
    txHash?: string, // blockchain tx hash
    date: string,   // created date
    likes?: number,
    dislikes?: number,
    owner?: string,  // account address
    user?: string,   // public key
    tags?: Array<string>,
    price?: number
}

export interface MemeIndex {
    paths: Array<string>
}

export interface AppState {
    metadata: Array<MemeMetadata>,
    index: MemeIndex,
    identity?: Identity,
    userAuth?: UserAuth,
    buckets?: Buckets,
    bucketKey?: string,
    www?: string,
    url?: string,
    ipns?: string,
  }