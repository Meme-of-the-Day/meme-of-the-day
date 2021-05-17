export interface UserMetadata {
  _id?: string;
  tokenID?: string; // NFT tokenID
  walletID: string; //Public Address is wallet ID
  cid: string; // IPFS CID
  path: string; // Bucket path
  publicAddress: string; // meme Name
  privateKey: string; // blockchain tx hash
  date: string; // created date
  // metadataNonce: number;
  pub_key?: object; // public key
  userInfo: object;
  email?: string;
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
        walletID: {
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
        path: {
          type: "string",
          description: "User bucket path."
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
        // metadataNonce: {
        //   type: "Number",
        //   description: "User mata nounce number."
        // },
        pub_key: {
          type: "object",
          description: "User public key ."
        },
        userInfo: {
          type: "object",
          description: "User Info From Tours."
        },
        email: {
          type: "string",
          description: "User email for login"
        }
      },
      required: ["cid", "path", "email", "date","publicAddress","privateKey"],
      additionalProperties: false
    }
  }
};
