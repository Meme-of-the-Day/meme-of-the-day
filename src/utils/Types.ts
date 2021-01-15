export interface MemeMetadata {
  _id?: string;
  _mod?: number;
  tokenID?: string; // NFT tokenID
  cid: string; // IPFS CID
  previewCID?: string;
  path: string; // Bucket path
  previewPath?: string;
  tokenMetadataURL?: string;
  tokenMetadataPath?: string;
  name: string; // meme Name
  txHash: string; // blockchain tx hash
  date: string; // created date
  likes: number;
  dislikes: number;
  owner?: string; // account address
  user?: string; // public key
  tags: Array<string>;
  price?: number;
  likedBy: Array<string>; // set of user ids who liked this meme.
  dislikedBy: Array<string>; // set of user ids who disliked this meme.
  onSale?: boolean;
  description?: string;
  sellApprovalSignature?: string;
}

export interface TokenMetadata {
  /**
   * Identifies the asset to which this token represents
   */
  name?: string;
  /**
   * The number of decimal places that the token amount should display - e.g. 18, means to divide the token amount by 1000000000000000000 to get its user representation.
   */
  decimals?: number;
  /**
   * Describes the asset to which this token represents
   */
  description?: string;
  /**
   * A URI pointing to a resource with mime type image/* representing the asset to which this token represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.
   */
  image?: string;
  /**
   * Arbitrary properties. Values may be strings, numbers, object or arrays.
   */
  properties?: {
    [k: string]: unknown;
  };
  localization?: {
    /**
     * The URI pattern to fetch localized data from. This URI should contain the substring `{locale}` which will be replaced with the appropriate locale value before sending the request.
     */
    uri: string;
    /**
     * The locale of the default data within the base JSON
     */
    default: string;
    /**
     * The list of locales for which data is available. These locales should conform to those defined in the Unicode Common Locale Data Repository (http://cldr.unicode.org/).
     */
    locales: unknown[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

export const Schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $ref: "#/definitions/MemeMetadata",
  definitions: {
    MemeMetadata: {
      type: "object",
      title: "Meme Metadata",
      properties: {
        _id: {
          type: "string",
          description: "The instance's id."
        },
        _mod: {
          type: "number",
          description: "unknown"
        },
        tokenID: {
          type: "string",
          description: "NFT TokenID."
        },
        cid: {
          type: "string",
          description: "Meme IPFS CID."
        },
        previewCID: {
          type: "string",
          description: "Meme Token Metadata IPFS CID."
        },
        path: {
          type: "string",
          description: "Meme bucket path."
        },
        previewPath: {
          type: "string",
          description: "Meme Token metadata preview image bucket path."
        },
        tokenMetadataURL: {
          type: "string",
          description: "ERC1155 compliant token metadata URL."
        },
        tokenMetadataPath: {
          type: "string",
          description: "Bucket path for the token metadata resource."
        },
        name: {
          type: "string",
          description: "Name of the meme."
        },
        txHash: {
          type: "string",
          description: "Blockchain transaction hash."
        },
        date: {
          type: "string",
          description: "The date at which meme is created at."
        },
        likes: {
          type: "number",
          description: "Number of upvotes or likes to this meme."
        },
        dislikes: {
          type: "number",
          description: "Number of downvotes or dislikes to this meme."
        },
        owner: {
          type: "string",
          description: "Address of the meme owner."
        },
        user: {
          type: "string",
          description: "User public key."
        },
        tags: {
          type: "array",
          description: "Tag for this meme.",
          items: {
            type: "string"
          }
        },
        price: {
          type: "number",
          description: "Selling price set by the owner."
        },
        likedBy: {
          type: "array",
          description: "List of users who liked the meme.",
          items: {
            type: "string"
          }
        },
        dislikedBy: {
          type: "array",
          description: "List of users who dis-liked the meme.",
          items: {
            type: "string"
          }
        },
        description: {
          type: "string",
          description: "Description for the meme"
        },
        onSale: {
          type: "boolean",
          description: "Is the meme on sale"
        }
      },
      required: ["cid", "path", "name", "date"],
      additionalProperties: false
    }
  }
};
