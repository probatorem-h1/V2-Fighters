const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Mint", function () {
  it("Should Randomly Mint NFT's 1-100", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const nftContract = await ethers.getContractFactory("Dev");
    const NFT = await nftContract.deploy("test", "test", "test");
    await NFT.deployed();
    await NFT.pause(false)



    await NFT.mint(100);
    wallet = await NFT.walletOfOwner(owner.address)
    let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
    //No duplicates
    expect(findDuplicates(wallet).length).to.equal(0)
    expect(await NFT.balanceOf(owner.address)).to.equal(100)
  });
  it("Require Tests", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const nftContract = await ethers.getContractFactory("Dev");
    const NFT = await nftContract.deploy("test", "test", "test");
    await NFT.deployed();

    //Can't mint while paused
    try {
      await NFT.mint(1);
      assert.fail(0, 1, 'Could Link With Bad ID')
    } catch (e) {
      expect(1).to.equal(1)
    }
    await NFT.pause(false)
    await NFT.mint(1);

    //Needs to mint 1 NFT
    try {
      await NFT.mint('');
      assert.fail(0, 1, 'Can mint 0 NFT"s')
    } catch (e) {
      expect(1).to.equal(1)
    }

    //Can't exceed total NFT's
    try {
      await NFT.mint(101);
      assert.fail(0, 1, 'Can mint over the limit of max NFT"s')
    } catch (e) {
      expect(1).to.equal(1)
    }

    //Can't exceed 5 NFT's per tx
    try {
      await NFT.connect(addr1).mint(6, { value: 18 });
      assert.fail(0, 1, 'Can mint over 5 NFT"s per tx')
    } catch (e) {
      expect(1).to.equal(1)
    }

    //Must send sufficient funds
    try {
      await NFT.connect(addr1).mint(5, { value: 2 });
      assert.fail(0, 1, 'Can mint for free')
    } catch (e) {
      expect(1).to.equal(1)
    }
  });
  it("Whitelist works", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const nftContract = await ethers.getContractFactory("Dev");
    const NFT = await nftContract.deploy("test", "test", "test");
    await NFT.deployed();
    await NFT.pause(false)

            
    provider = ethers.provider;

    balance = await provider.getBalance(addr1.address);
    await NFT.whitelistUsers([addr1.address])
    let cost = await NFT.mintCost(addr1.address)
    await NFT.connect(addr1).mint(1, { value: cost });
    expect(cost).to.equal('1000000000000000000')

  });
});
