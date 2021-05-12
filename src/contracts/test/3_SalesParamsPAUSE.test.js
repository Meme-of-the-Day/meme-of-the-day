const SalesParamV3Pause = artifacts.require('MOTDSaleParametersProviderV3Pause');
const SalesParamV4Pause = artifacts.require('MOTDSaleParametersProviderV4Pause');
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');

const Web3 = require("web3");
//using GanacheGUI because CLI would not work correctly on my system
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

contract('SaleParametersProvider upgradeSafe Pause', async function (accounts) {
    it('should initialize correctly', async function () {
        this.salesparams1 = await deployProxy(SalesParamV3Pause, {initializer: 'initialize'});

        //GETTING STATE CONSTANTS
        let defCreFeePerInd = await this.salesparams1.DEFAULT_CREATOR_FEE_PERCENT_INDEX();
        let votFeePerInd = await this.salesparams1.VOTERS_FEE_PERCENT_INDEX();
        let plaFeePerInd = await this.salesparams1.PLATFORM_FEE_PERCENT_INDEX();
        let totFeePerInd = await this.salesparams1.TOTAL_FEES_PERCENT_INDEX();

        //GETTING VALUES FROM MAPPING
        let defCreatorFee = await this.salesparams1.parameters(0);
        let votersFee = await this.salesparams1.parameters(1);
        let platformFee = await this.salesparams1.parameters(2);
        let totalFee = await this.salesparams1.parameters(3);

        //STATE CONSTANTS
        // console.log(await this.salesparams1.DEFAULT_CREATOR_FEE_PERCENT_INDEX());
        // console.log(await this.salesparams1.VOTERS_FEE_PERCENT_INDEX());
        // console.log(await this.salesparams1.PLATFORM_FEE_PERCENT_INDEX());
        // console.log(await this.salesparams1.TOTAL_FEES_PERCENT_INDEX());

        //MAPPING SHOULD BE INITIALIZED CORRECTLY
        // console.log("DEFAULT CREATOR FEE: " + await this.salesparams1.parameters(0));
        // console.log("VOTERS FEE: " + await this.salesparams1.parameters(1));
        // console.log("PLATFORM FEE: " + await this.salesparams1.parameters(2));
        // console.log("TOTAL FEE: " + await this.salesparams1.parameters(3));
        
        //CHECK IF STATE CONSTANTS ARE CORRECT
        assert.equal(defCreFeePerInd.toString(), 0);
        assert.equal(votFeePerInd.toString(), 1);
        assert.equal(plaFeePerInd.toString(), 2);
        assert.equal(totFeePerInd.toString(), 3);

        //CHECK IF INITIAL MAPPING VALUES ARE CORRECT
        assert.equal(defCreatorFee.toString(), 100);
        assert.equal(votersFee.toString(), 5);
        assert.equal(platformFee.toString(), 19);
        assert.equal(totalFee.toString(), 24);

    });

    it('should return correct pause state', async function () {
        var pauseState = await this.salesparams1.paused();

        assert.equal(pauseState.toString(), "false");
    });

    it('should allow to pause, not allow to changeParameters whenPaused and unpause', async function () {
        await this.salesparams1.pause();
        var pauseState = await this.salesparams1.paused();
        assert.equal(pauseState.toString(), "true");

        try{
            await this.salesparams1.changeParameter(0, 150, {from: accounts[0]});
        }catch(errPaused){
            console.log(errPaused.reason);
        }

        await this.salesparams1.unpause();
        pauseState = await this.salesparams1.paused();
        assert.equal(pauseState.toString(), "false");
    });

    it('should keep state after upgrade', async function () {
        this.salesparams2 = await upgradeProxy(this.salesparams1.address, SalesParamV4Pause, {initializer: 'initialize'});

        console.log(await this.salesparams2.sayHello());

        //GETTING STATE CONSTANTS
        let defCreFeePerInd = await this.salesparams2.DEFAULT_CREATOR_FEE_PERCENT_INDEX();
        let votFeePerInd = await this.salesparams2.VOTERS_FEE_PERCENT_INDEX();
        let plaFeePerInd = await this.salesparams2.PLATFORM_FEE_PERCENT_INDEX();
        let totFeePerInd = await this.salesparams2.TOTAL_FEES_PERCENT_INDEX();

        //GETTING VALUES FROM MAPPING
        let defCreatorFee = await this.salesparams2.parameters(0);
        let votersFee = await this.salesparams2.parameters(1);
        let platformFee = await this.salesparams2.parameters(2);
        let totalFee = await this.salesparams2.parameters(3);
        
        // //STATE CONSTANTS
        // console.log(await this.salesparams2.DEFAULT_CREATOR_FEE_PERCENT_INDEX());
        // console.log(await this.salesparams2.VOTERS_FEE_PERCENT_INDEX());
        // console.log(await this.salesparams2.PLATFORM_FEE_PERCENT_INDEX());
        // console.log(await this.salesparams2.TOTAL_FEES_PERCENT_INDEX());

        // //MAPPING SHOULD STAY THE SAME AFTER UPGRADE
        // console.log("DEFAULT CREATOR FEE: " + await this.salesparams2.parameters(0));
        // console.log("VOTERS FEE: " + await this.salesparams2.parameters(1));
        // console.log("PLATFORM FEE: " + await this.salesparams2.parameters(2));
        // console.log("TOTAL FEE: " + await this.salesparams2.parameters(3));

         //CHECK IF STATE CONSTANTS ARE CORRECT
         assert.equal(defCreFeePerInd.toString(), 0);
         assert.equal(votFeePerInd.toString(), 1);
         assert.equal(plaFeePerInd.toString(), 2);
         assert.equal(totFeePerInd.toString(), 3);
 
         //CHECK IF INITIAL MAPPING VALUES ARE CORRECT
         assert.equal(defCreatorFee.toString(), 100);
         assert.equal(votersFee.toString(), 5);
         assert.equal(platformFee.toString(), 19);
         assert.equal(totalFee.toString(), 24);

    });

    it('should allow to change parameters by owner', async function () {
        // console.log(await this.salesparams2.owner());
        //console.log("Creator fee before change: " + await this.salesparams2.parameters(0));
        console.log("Changing creator fee...");
        await this.salesparams2.changeParameter(0, 150, {from: accounts[0]});
        //console.log("Creator fee after change: " + await this.salesparams2.parameters(0));

        //console.log("Voters fee before change: " + await this.salesparams2.parameters(1));
        console.log("Changing voters fee...");
        await this.salesparams2.changeParameter(1, 10, {from: accounts[0]});
        //console.log("Voters fee after change: " + await this.salesparams2.parameters(1));

        //console.log("Platform fee before change: " + await this.salesparams2.parameters(2));
        console.log("Changing Platform fee...");
        await this.salesparams2.changeParameter(2, 21, {from: accounts[0]});
        //console.log("Platform fee after change: " + await this.salesparams2.parameters(2));

        //GETTING VALUES FROM MAPPING
        let defCreatorFee = await this.salesparams2.parameters(0);
        let votersFee = await this.salesparams2.parameters(1);
        let platformFee = await this.salesparams2.parameters(2);
        let totalFee = await this.salesparams2.parameters(3);

        //CHECK IF CHANGES ARE CORRECT
        assert.equal(defCreatorFee.toString(), 150);
        assert.equal(votersFee.toString(), 10);
        assert.equal(platformFee.toString(), 21);
        assert.equal(totalFee.toString(), 31);

    });
    
})