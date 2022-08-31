const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Owner Mint", function () {
    it("Should Mint Owner NFT's", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const nftContract = await ethers.getContractFactory("Dev");
        const NFT = await nftContract.deploy("test", "test", "test");
        await NFT.deployed();
        await NFT.pause(false)
        const provider = ethers.provider;



        await NFT.ownerAddressChange(owner.address)
        await NFT.ownerMint(95);
        wallet = await NFT.walletOfOwner(owner.address)
        let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
        //No duplicates
        expect(findDuplicates(wallet).length).to.equal(0)
        expect(await NFT.balanceOf(owner.address)).to.equal(95)

        //Check that owner can withdraw funds
        let previousBalance = await provider.getBalance(owner.address); 
        previousBalance = parseInt(previousBalance) / 10 ** 18
        let newBalance = previousBalance + 15
        await NFT.connect(addr1).mint(5, {value: '15000000000000000000'})
        await NFT.withdraw();
        let balance = await provider.getBalance(owner.address);
        balance = balance / 10 ** 18
        balance = Math.ceil(balance)
        newBalance = Math.ceil(newBalance)
        expect(await NFT.balanceOf(addr1.address)).to.equal(5)
        expect(balance).to.equal(newBalance)

    });
})