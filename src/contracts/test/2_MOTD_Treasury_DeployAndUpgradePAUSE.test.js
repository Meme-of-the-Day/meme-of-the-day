const TreasuryV3Pause = artifacts.require('MOTDTreasuryV3Pause');
const TreasuryV4Pause = artifacts.require('MOTDTreasuryV4Pause');

const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');

//var assert = require("assert");

//const truffleAssert = require('truffle-assertions');


const Web3 = require("web3");
//using GanacheGUI because CLI would not work correctly on my system
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));  // 

contract('Treasury upgradeSafe Pause', async function (accounts) {
    it('should deploy proxy and set owner to accounts[0]', async function () {
        console.log("Deploying Proxy...");
        this.treasury1 = await deployProxy(TreasuryV3Pause, {initializer: 'initialize'});
        console.log("Treasury1 Proxy Address: " + this.treasury1.address);
        let owner = await this.treasury1.owner();
        console.log("Owner is: " + owner);

        //CHECK IF OWNER IS EQUAl TO DEPLOYER ACCOUNT
        assert.equal(owner, accounts[0]);
    });

    it('should allow to deposit ETH', async function() {
        let treasBalance = await web3.eth.getBalance(this.treasury1.address);
      //  console.log("Balance Treasury1 BEFORE TX: " + treasBalance);

     //   acc1Balance = await web3.eth.getBalance(accounts[1]);
     //   console.log("Balance accounts[1] BEFORE TX: " + acc1Balance);

        console.log("Sending 2 Ether from accounts[1] to treasury");

        await web3.eth.sendTransaction({
            from: accounts[1],
            to: this.treasury1.address,
            value: web3.utils.toWei("2", "ether"),
        });

     //   console.log("New Balance accounts[1]: " + await web3.eth.getBalance(accounts[1]));
        treasBalance = await web3.eth.getBalance(this.treasury1.address);
        assert.equal(
            treasBalance.toString(), web3.utils.toWei("2", "ether")
        );
    });

    it('stores Eth', async function () {
        // console.log("TREASURY ADDRESS STORES ETH TEST:" + this.treasury1.address);
        let treasuryBalance = await web3.eth.getBalance(this.treasury1.address);
        // console.log("Treasury1 Balance: " + treasuryBalance);

        assert.equal(
            treasuryBalance.toString(), web3.utils.toWei("2", "ether")
        );
    });

    it('should revert if withdraw by not owner!', async function () {
        let treasuryBalance = await web3.eth.getBalance(this.treasury1.address);
        //console.log("Balance Treasury1 BEFORE withdraw: " + treasuryBalance);
        try {
            await this.treasury1.withdraw(web3.utils.toWei('1'), {from: accounts[1]});
        } catch(err){
            console.log(err.reason);
        }
      //  console.log("Balance should stay the same");
      //  console.log("Balance Treasury AFTER: " + treasuryBalance);
        assert.equal(
            treasuryBalance.toString(), web3.utils.toWei("2", "ether")
        );
    });

    it('should revert if withdraw amount is too high', async function () {
        let treasuryBalance = await web3.eth.getBalance(this.treasury1.address);
        // console.log("Balance Treasury BEFORE: " + treasuryBalance);
        try {
            await this.treasury1.withdraw(web3.utils.toWei("5", "ether"), {from: accounts[0]});
        }
        catch (err2){
            console.log("Err2" + err2);
        }
        // console.log("Balance should stay the same");
        // console.log("Balance Treasury1 AFTER: " + treasuryBalance);

        assert.equal(
            treasuryBalance.toString(), web3.utils.toWei("2", "ether")
        );
    });

    it('should allow to withdraw by owner', async function () {
        
        try{
            await this.treasury1.withdraw(web3.utils.toWei("2", "ether"), {from: accounts[0]});
        }
        catch(err){
            console.log(err)
        }

       let treasuryBalance = await web3.eth.getBalance(this.treasury1.address);
       // console.log("Balance after withdraw: " + await web3.eth.getBalance(this.treasury1.address));
       assert.equal(
           treasuryBalance.toString(), web3.utils.toWei("0", "ether")
           );

        console.log("New Deposit of 2 ETH before upgrade...");

        await web3.eth.sendTransaction({
            from: accounts[1],
            to: this.treasury1.address,
            value: web3.utils.toWei("2", "ether"),
        });
    });

    it('should return correct pause state', async function () {
        var pauseState = await this.treasury1.paused();

        assert.equal(pauseState.toString(), "false");
    });

    it('should allow to pause, prevent withdraw whenPaused, and unpause', async function () {
        await this.treasury1.pause();
        var pauseState = await this.treasury1.paused();
        assert.equal(pauseState.toString(), "true");

        try{
            await this.treasury1.withdraw(web3.utils.toWei("1", "ether"), {from: accounts[0]});
        }catch(errPause){
            console.log(errPause.reason);
        }

        await this.treasury1.unpause();
        pauseState = await this.treasury1.paused();
        assert.equal(pauseState.toString(), "false");
    });

    it('should keep balance after proxy upgrade and have right owner', async function () {
        console.log("Upgrading Proxy...");
        this.treasury2 = await upgradeProxy(this.treasury1.address, TreasuryV4Pause, {initializer: 'initialize'});

        //TESTING NEW FUNCTION!
        console.log(await this.treasury2.sayHello());
      
        //  console.log("Treasury2 Address: " + this.treasury2.address);
        
        owner = await this.treasury2.owner();
        
      // console.log("Owner is: " + owner);
      // console.log("Balance should still be 2 ETH:");
       
      // console.log("Treasury2 Balance: " + await web3.eth.getBalance(this.treasury2.address));
        let treasBalance = await web3.eth.getBalance(this.treasury2.address);
        //CHECK IF OWNER IS STILL DEPLOYER ACCOUNT
        assert.equal(owner, accounts[0]);
        //CHECK IF BALANCE IS CORRECT AFTER UPGRADE
        assert.equal(
            treasBalance.toString(), web3.utils.toWei("2", "ether")
        );

    })

    it('should still allow owner to withdraw', async function () {
       let tresInst = await TreasuryV4Pause.at(this.treasury2.address); 
       try{
            await tresInst.withdraw(web3.utils.toWei("1", "ether"), {from: accounts[0]});
        } catch(err){
            console.log(err.data);
        }
        let treasBalance = await web3.eth.getBalance(this.treasury2.address);
        
        //CHECK IF BALANCE HAS DECREASED AFTER OWNER WITHDRAW
        assert.equal(treasBalance.toString(), web3.utils.toWei("1", "ether"));

       // console.log("Balance after withdraw after upgrade (should be 1 ETH): " + await web3.eth.getBalance(this.treasury2.address));
    })
})