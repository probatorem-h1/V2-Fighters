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
    ] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy("", "", "");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy();
    const fighters = await ethers.getContractFactory("V2Fighters");
    const v2 = await fighters.deploy(
      "",
      "",
      "test",
      marketplace.address,
      ebisusPaymentAddress.address,
      nft.address,
      dwsPaymentAddress.address,
      fightersPaymentAddress.address,
      (10 * 10 ** 18).toString()
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
  describe("Supports", function () {
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
      } = await loadFixture(deployContracts);
      await v2.setV1Address(testAddress.address);
      expect(await v2.V1Address.call()).to.equal(testAddress.address);
    });
  });
});
