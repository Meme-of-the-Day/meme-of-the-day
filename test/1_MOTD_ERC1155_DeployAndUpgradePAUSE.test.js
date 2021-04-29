var assert = require('assert');

const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { TruffleContract } = require('@openzeppelin/truffle-upgrades/dist/truffle');

const MTDV3Pause = artifacts.require('MemeOfTheDayV3Pause');
const MTDV4Pause = artifacts.require('MemeOfTheDayV4Pause');


const Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

let TokenID;


contract('MemeOfTheDay upgradeSafe Pause', function(accounts) {
    it('should mints token with given hash', async function () {
        console.log("Deploying Proxy...");
        this.meme1 = await deployProxy(MTDV3Pause, {initializer: 'initialize'});
        console.log("OWNER: " + await this.meme1.owner());
        console.log("ADDRESS MEME1: " + this.meme1.address);

        console.log("Minting Token with 'testhash'...");
        const tokenMintedRes = await this.meme1.mint("testhash", -1, {
            from: accounts[0],
          });
        
          //console.log("MemesCount After Minting: " + await this.meme1.getMemesCount());
        const [tokenMintedEvent] = tokenMintedRes.logs.filter(
        ({ event }) => event === "MemeMinted"
        );
        var tokenId = await this.meme1.getTokenID("testhash");
     //   var tokenId = web3.utils.BN(tokenMintedEvent.args.tokenId).toNumber();
        TokenID = tokenId;  //Used for URI Data Test, look ahead
        //CHECK MEMES COUNT
        assert.strictEqual(parseInt(await this.meme1.getMemesCount()), 1);
        //console.log("MEMES COUNT:" + parseInt(await this.meme1.getMemesCount()));

        //CHECK CREATOR OF TOKENID
        assert.strictEqual(await this.meme1.creatorOf(tokenId), accounts[0]);

        //CHECK OWNER OF TOKENID
        assert.strictEqual(await this.meme1.ownerOf(tokenId), accounts[0]);        
        
    })

    it("doesn't mint a token if given hash is already used", async () => {
      this.meme1 = await deployProxy(MTDV3Pause, {initializer: 'initialize'});
        console.log("OWNER: " + await this.meme1.owner());
        console.log("ADDRESS MEME1: " + this.meme1.address);
      try {
        await this.meme1.mint("testhash", -1, {
          from: accounts[0],
        });
      } catch (err) {
        console.log(err);
      }

      //CHECK MEMES COUNT
      assert.strictEqual(parseInt(await this.meme1.getMemesCount()), 1);
      //console.log("MEMES COUNT:" + parseInt(await this.meme1.getMemesCount()));

    })

    it("uri metadata retrieval check", async () => {
      this.meme1 = await deployProxy(MTDV3Pause, {initializer: 'initialize'});

      const matedataUri = await this.meme1.uri(TokenID);
  
      assert.strictEqual(matedataUri, "https://hub.textile.io/ipfs/bafybeiaz4sqwracygsux7moam3tcd7zng53f6gh4khzhsrlhkto473c5rq/tokenmetadata/{id}.json");
    });

    it('should return right pause state', async () => {
      this.meme1 = await deployProxy(MTDV3Pause, {initializer: 'initialize'});

      const pauseState = await this.meme1.paused();

      assert.strictEqual(pauseState, false);

    });

    it('should allow to pause contract and not allow to mint when paused and unpause', async () => {
      this.meme1 = await deployProxy(MTDV3Pause, {initializer: 'initialize'});

      //PAUSING CONTRACT
      await this.meme1.pause();

      var pauseState = await this.meme1.paused();

      try{
        await this.meme1.mint("testhash", -1, {
          from: accounts[0],
        });
      }catch(errPause){
        console.log(errPause.reason);
      }

      assert.strictEqual(pauseState, true);

      await this.meme1.unpause();

      pauseState = await this.meme1.paused();

      assert.strictEqual(pauseState, false);
    });
  

    it('should keep MemesCount after upgradeProxy', async function () {
        console.log("Upgrading Proxy...");
        this.meme2 = await upgradeProxy(this.meme1.address, MTDV4Pause, {initializer: 'initialize'});
        console.log("OWNER: " + await this.meme2.owner());
        console.log("ADDRESS MEME 2: " + this.meme2.address);

        //CHECK IF MEMESCOUNT IS STILL CORRECT AFTER UPGRADE!
        assert.strictEqual(parseInt(await this.meme2.getMemesCount()), 1);
        //console.log("MEMESCount After Upgrade: " + parseInt(await this.meme2.getMemesCount()));

        //RUN NEW FUNCTION IMPLEMENTED WITH UPGRADE, SHOULD SAY "HELLO"
        console.log(await this.meme2.sayHello() + " from after the upgrade!");

        //CHECK IF MINT STILL WORKS AFTER UPGRADE
        console.log("Minting Token with 'testhash2' AFTER UPGRADE...");
        const tokenMintedRes2 = await this.meme2.mint("testhash2", -1, {
            from: accounts[0],
          });

        const [tokenMintedEvent2] = tokenMintedRes2.logs.filter(
        ({ event }) => event === "MemeMinted"
        );
          var tokenId2 = await this.meme2.getTokenID("testhash2");
       // var tokenId2 = web3.utils.BN(tokenMintedEvent2.args.tokenId).toNumber();

         //CHECK MEMES COUNT AFTER UPGRADE MINT, SHOULD BE 2
         assert.strictEqual(parseInt(await this.meme2.getMemesCount()), 2);
         //console.log("Mint after upgrade, new MEMESCount :" + await this.meme2.getMemesCount());
 
         //CHECK CREATOR OF TOKENID
         assert.strictEqual(await this.meme2.creatorOf(tokenId2), accounts[0]);
 
         //CHECK OWNER OF TOKENID
         assert.strictEqual(await this.meme2.ownerOf(tokenId2), accounts[0]);
    })

})


