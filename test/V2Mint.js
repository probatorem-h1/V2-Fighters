const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

describe("V2 Fighters", function () {
  async function deployContracts() {
    // Contracts are deployed using the first signer/account by default
    const [
      owner,
      ebisusPaymentAddress,
      dwsPaymentAddress,
      fightersPaymentAddress,
      testAddress,
      testAddress2,
    ] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy("", "", "");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(owner.address);
    const fighters = await ethers.getContractFactory("V2Fighters");
    const v2 = await fighters.deploy(
      "",
      "",
      "test",
      marketplace.address,
      ebisusPaymentAddress.address,
      nft.address,
      dwsPaymentAddress.address,
      fightersPaymentAddress.address
    );
    return {
      owner,
      ebisusPaymentAddress,
      dwsPaymentAddress,
      fightersPaymentAddress,
      nft,
      marketplace,
      v2,
      testAddress,
      testAddress2,
    };
  }
  describe("Deployment", function () {
    it("Should set the right contract addresses", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      expect(await v2.marketAddress.call()).to.equal(marketplace.address);
      expect(await v2.ebisusPaymentAddress.call()).to.equal(
        ebisusPaymentAddress.address
      );
      expect(await v2.dwsPaymentAddress.call()).to.equal(
        dwsPaymentAddress.address
      );
      expect(await v2.fightersPaymentAddress.call()).to.equal(
        fightersPaymentAddress.address
      );
      expect(await v2.V1Address.call()).to.equal(nft.address);
    });
  });
  describe("Owner Contract Update Functions", function () {
    it("Should Update All Info", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.setDWSAddress(testAddress.address);
      expect(await v2.dwsPaymentAddress.call()).to.equal(testAddress.address);
      await v2.setDWSPaymentTotal(1);
      expect(await v2.dwsPaymentTotal.call()).to.equal(1);
      await v2.setMemCost("1");
      expect(await v2.memCost.call()).to.equal(1);
      await v2.setWhiteCost("1");
      expect(await v2.whiteCost.call()).to.equal(1);
      await v2.setRegCost("1");
      expect(await v2.regCost.call()).to.equal(1);
      await v2.setBaseURI("lol");
      expect(await v2.baseURI.call()).to.equal("lol");
      await v2.mintPause(false);
      expect(await v2.mintPaused.call()).to.equal(false);
      await v2.claimPause(false);
      expect(await v2.claimPaused.call()).to.equal(false);
    });
  });
  describe("Whitelist", function () {
    it("Should Update Whitelist", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.addWhiteList([owner.address, testAddress.address]);
      expect(await v2.whitelistedAddresses(owner.address)).to.equal(true);
      expect(await v2.whitelistedAddresses(testAddress.address)).to.equal(true);
    });
    it("Should Remove Addresses From Whitelist", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.addWhiteList([owner.address, testAddress.address]);
      await v2.removeWhiteList(testAddress.address);
      expect(await v2.whitelistedAddresses(owner.address)).to.equal(true);
      expect(await v2.whitelistedAddresses(testAddress.address)).to.equal(
        false
      );
    });
  });
  describe("Owner Mints", function () {
    it("Correctly Mints Owner Tokens", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.reserveMint(await v2.reserveMintEnd.call(), owner.address);
      expect(await v2.balanceOf(owner.address)).to.equal(75);
    });
  });
  describe("EbisusBay Member Check", function () {
    it("Performs Membership Check", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      expect(await v2.isEbisusBayMember(testAddress.address)).to.equal(false);
      expect(await v2.isEbisusBayMember(owner.address)).to.equal(true);
    });
  });
  describe("Claim", function () {
    it("Can't Claim If Paused", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      try {
        await v2.claim();
        expect(1).to.equal(2);
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'Claim is paused'"
        );
      }
    });
    it("Balance: 0 -> Claims Nothing", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.claimPause(false);
      try {
        await v2.claim();
        expect(1).to.equal(2);
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'Insufficient Balance'"
        );
      }
    });
    it("Balance: 3 -> Claims 1", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.claimPause(false);

      await nft.mint(3);
      await v2.claim();
      expect(await v2.balanceOf(owner.address)).to.equal(1);
    });
    it("Balance: 4 -> Claims 1", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.claimPause(false);

      await nft.mint(4);
      await v2.claim();
      expect(await v2.balanceOf(owner.address)).to.equal(1);
    });
    it("Balance: 6 -> Claims 2", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.claimPause(false);

      await nft.mint(6);
      await v2.claim();
      expect(await v2.balanceOf(owner.address)).to.equal(2);
    });
    it("Balance: 9 -> Claims 3", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.claimPause(false);

      await nft.mint(9);
      await v2.claim();
      expect(await v2.balanceOf(owner.address)).to.equal(3);
    });
    it("Can't Claim Twice", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.claimPause(false);
      await nft.mint(4);
      await v2.claim();
      try {
        await v2.claim();
        expect(1).to.equal(2);
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'Nothing to Claim'"
        );
      }
    });
    it("Can't Claim Using Different Address Same Tokens", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.claimPause(false);
      await nft.mint(4);
      await v2.claim();
      await nft.transferFrom(owner.address, testAddress.address, 1);
      await nft.transferFrom(owner.address, testAddress.address, 2);
      await nft.transferFrom(owner.address, testAddress.address, 3);
      expect(await nft.balanceOf(testAddress.address)).to.equal(3);
      try {
        await v2.connect(testAddress).claim();
        expect(1).to.equal(2);
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'Nothing to Claim'"
        );
      }
    });
  });
  describe("Mint Cost", function () {
    it("Calculates Regular Cost", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      let cost = await v2.mintCost(testAddress.address);
      expect(cost).to.equal(await v2.regCost.call());
    });
    it("Calculates Member Cost", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      let cost = await v2.mintCost(owner.address);
      expect(cost).to.equal(await v2.memCost.call());
    });
    it("Calculates Whitelist Cost", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.addWhiteList([testAddress2.address]);
      let cost = await v2.mintCost(testAddress2.address);
      expect(cost).to.equal(await v2.whiteCost.call());
    });
    it("Returns Reg Cost After Whitelist Maximum Hit", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.addWhiteList([testAddress2.address]);
      await v2.mintPause(false);
      await v2.setWhiteCost(1);
      let nftPerWhitelistAddress = await v2.nftPerWhitelistAddress.call();
      await v2.connect(testAddress2).mint(nftPerWhitelistAddress, {
        value: parseInt(await v2.whiteCost.call()) * nftPerWhitelistAddress,
      });
      let cost = await v2.mintCost(testAddress2.address);
      expect(cost).to.equal(await v2.regCost.call());
    });
  });
  describe("Mint", function () {
    it("Can Only Mint While Unpaused", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      try {
        await v2.mint(1);
        expect(1).to.equal(2);
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'minting is paused'"
        );
      }
    });
    it("Have To Mint At Least 1", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      try {
        await v2.mint(0);
        expect(1).to.equal(2);
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'need to mint at least 1 NFT'"
        );
      }
    });
    it("Must Mint Less Than Amount Per Tx", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      try {
        await v2.mint((await v2.maxMintAmount.call()) + 1);
        expect(1).to.equal(2);
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'max mint amount per transaction exceeded'"
        );
      }
    });
    it("Can't Mint Above Limit", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      await v2.setMaxMintAmount(4001);
      try {
        await v2.mint(await v2.maxMintAmount.call());
        expect(1).to.equal(2);
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'max NFT limit exceeded'"
        );
      }
    });
    it("Must Send Proper Msg.Value", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      await v2.setRegCost((2 * 10 ** 18).toString());
      try {
        await v2
          .connect(testAddress2)
          .mint(1, { value: (1 * 10 ** 18).toString() });
        expect(1).to.equal(2);
      } catch (e) {
        expect(
          e.message.includes(
            "insufficient funds for intrinsic transaction cost"
          )
        ).to.equal(true);
      }
    });
    it("Mints Randomly", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      await v2.setRegCost((1 * 10 ** 18).toString());
      await v2
        .connect(testAddress2)
        .mint(5, { value: (5 * 10 ** 18).toString() });
      let balance = await v2.walletOfOwner(testAddress2.address);
      expect(parseInt(balance[0]) + 1 == parseInt(balance[2])).to.equal(false);
    });
  });
  describe("Payment", function () {
    it("Calculates Payment for DWS", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      await v2.setDWSPaymentTotal((5 * 10 ** 18).toString());
      await v2.setRegCost((1 * 10 ** 18).toString());
      await v2
        .connect(testAddress2)
        .mint(1, { value: (4 * 10 ** 18).toString() });
      expect(await v2["payments"](dwsPaymentAddress.address)).to.equal(
        "3000000000000000000"
      );
    });

    it("Stops At Total Amount For DWS", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      await v2.setDWSPaymentTotal((5 * 10 ** 18).toString());
      await v2.setRegCost((1 * 10 ** 18).toString());
      await v2
        .connect(testAddress2)
        .mint(1, { value: (1 * 10 ** 18).toString() });
      await v2
        .connect(testAddress2)
        .mint(1, { value: (7 * 10 ** 18).toString() });
      expect(await v2["payments"](dwsPaymentAddress.address)).to.equal(
        "5000000000000000000"
      );
    });
    it("Calculates Payment for EbisusBay", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      await v2.setRegCost((1 * 10 ** 18).toString());
      await v2
        .connect(testAddress2)
        .mint(1, { value: (1 * 10 ** 18).toString() });
      expect(await marketplace.payment(ebisusPaymentAddress.address)).to.equal(
        "100000000000000000"
      );
    });
    it("Calculates Payment for Fighters", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      await v2.setRegCost((1 * 10 ** 18).toString());
      await v2
        .connect(testAddress2)
        .mint(1, { value: (1 * 10 ** 18).toString() });
      expect(await ethers.provider.getBalance(v2.address)).to.equal(
        "150000000000000000"
      );
    });
    it("Allows DWS to Withdraw", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      await v2.setDWSPaymentTotal((5 * 10 ** 18).toString());
      await v2.setRegCost((1 * 10 ** 18).toString());
      await v2
        .connect(testAddress2)
        .mint(1, { value: (4 * 10 ** 18).toString() });
      priorBalance = await ethers.provider.getBalance(
        dwsPaymentAddress.address
      );
      await v2["withdrawPayments"](dwsPaymentAddress.address);
      expect(
        parseInt(await ethers.provider.getBalance(dwsPaymentAddress.address)) -
          parseInt(priorBalance) >
          parseInt("2000000000000000000")
      );
    });
    it("Allows Fighters To Withdraw", async function () {
      const {
        owner,
        ebisusPaymentAddress,
        dwsPaymentAddress,
        fightersPaymentAddress,
        nft,
        marketplace,
        v2,
        testAddress,
        testAddress2,
      } = await loadFixture(deployContracts);
      await v2.mintPause(false);
      await v2.setRegCost((1 * 10 ** 18).toString());
      priorBalance = await ethers.provider.getBalance(
        fightersPaymentAddress.address
      );
      await v2
        .connect(testAddress2)
        .mint(1, { value: (1 * 10 ** 18).toString() });
      await v2.withdraw();
      expect(
        parseInt(
          await ethers.provider.getBalance(fightersPaymentAddress.address)
        ) -
          parseInt(priorBalance) >
          parseInt("140000000000000000")
      );
    });
  });
});
