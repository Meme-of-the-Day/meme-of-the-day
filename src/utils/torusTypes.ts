export interface UserMetadata {
  _id?: string;
  tokenID?: string; // NFT tokenID
  cid: string; // IPFS CID
  path: string; // Bucket path
  tokenMetadataURL?: string;
  tokenMetadataPath?: string;
  publicAddress: string; // meme Name
  privateKey: string; // blockchain tx hash
  date: string; // created date
  metadataNonce: number;
  pub_key_X?: string; // account address
  pub_key_Y?: string; // public key
  userInfo: Array<string>;
  email?: string;
  username: string; // set of user name we get from auth.
  profileImage: string; // set of user ids who disliked this meme.
  verifier?: string;
  verifierId?: string;
  typeOfLogin?: string;
  accessToken?: string;
  idToken?: string;
  instanceId?: string;
  token_type?: string;
  expires_in?: string;
  scope?: string;
  authuser?: string;
  prompt?: string;
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
  $ref: "#/definitions/UserMetadata",
  definitions: {
    UserMetadata: {
      type: "object",
      title: "User Metadata",
      properties: {
        _id: {
          type: "string",
          description: "The Users's id."
        },
        tokenID: {
          type: "string",
          description: "NFT TokenID."
        },
        cid: {
          type: "string",
          description: "User IPFS CID."
        },
        previewCID: {
          type: "string",
          description: "User Token Metadata IPFS CID."
        },
        path: {
          type: "string",
          description: "User bucket path."
        },
        previewPath: {
          type: "string",
          description: "User image Token metadata preview image bucket path."
        },
        tokenMetadataURL: {
          type: "string",
          description: "ERC1155 compliant token metadata URL."
        },
        tokenMetadataPath: {
          type: "string",
          description: "Bucket path for the token metadata resource."
        },
        date: {
          type: "string",
          description: "The date at which user is created at."
        },
        publicAddress: {
          type: "string",
          description: "User public key."
        },
        privateKey: {
          type: "string",
          description: "User private key."
        },
        metadataNonce: {
          type: "Number",
          description: "User mata nounce number."
        },
        pub_key_X: {
          type: "string",
          description: "User public key X."
        },
        pub_key_Y: {
          type: "string",
          description: "User public key Y."
        },
        email: {
          type: "string",
          description: "User email for login"
        },
        username: {
          type: "string",
          description: "User name."
        },
        profileImage: {
          type: "string",
          description: "User profile image path."
        },
        verifier: {
          type: "string",
          description: "User verifier name like google-lrc."
        },
        verifierId: {
          type: "string",
          description: "User verifier id genrated by verifier."
        },
        typeOfLogin: {
          type: "string",
          description: "User login provider."
        },
        accessToken: {
          type: "string",
          description: "Access token returned by verifier."
        },
        idToken: {
          type: "string",
          description: "User ID token."
        },
        instanceId: {
          type: "string",
          description: "Verifier instance id."
        },
        token_type: {
          type: "string",
          description: "Type of token like Bearer."
        }
      },
      required: ["cid", "path", "email", "date","publicAddress","privateKey",],
      additionalProperties: false
    }
  }
};
