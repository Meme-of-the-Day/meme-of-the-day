import { Buckets, Identity, UserAuth } from '@textile/hub'

export interface MemeMetadata {
    _id?: string,
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

export const Schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/MemeMetadata",
    "definitions": {
        "MemeMetadata": {
            "type": "object",
            "title": 'Meme Metadata',
            "properties": {
                "_id": {
                    "type": 'string',
                    "description": "The instance's id.",
                },
                "tokenID": {
                    "type": "string",
                    "description": "NFT TokenID."
                },
                "cid": {
                    "type": "string",
                    "description": "Meme IPFS CID."
                },
                "path": {
                    "type": "string",
                    "description": "Meme bucket path."
                },
                "name": {
                    "type": "string",
                    "description": "Name of the meme."
                },
                "txHash": {
                    "type": "string",
                    "description": "Blockchain transaction hash."
                },
                "date": {
                    "type": "string",
                    "description": "The date at which meme is created at."
                },
                "likes": {
                    "type": "number",
                    "description": "Number of upvotes or likes to this meme."
                },
                "dislikes": {
                    "type": "number",
                    "description": "Number of downvotes or dislikes to this meme."
                },
                "owner": {
                    "type": "string",
                    "description": "Address of the meme owner."
                },
                "user": {
                    "type": "string",
                    "description": "User public key."
                },
                "tags": {
                    "type": "array",
                    "description": "Tag for this meme.",
                    "items": {
                        "type": "string"
                    }
                },
                "price": {
                    "type": "number",
                    "description": "Selling price set by the owner."
                }
            },
            "required": [
                "cid",
                "path",
                "name",
                "date"
            ],
            "additionalProperties": false
        }
    }
};