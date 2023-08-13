import { ethers } from "hardhat";
import { XSuperhack } from "../typechain-types";

async function main() {
    const xSuperhackContract = await ethers.getContractFactory("xSuperhack")
    const metadataFile = 'bafybeic2xgf4xjw745wjxuicknjhcn7hsxcwgyvndk64bvhboljp42wbje'
    const xSuperhack = await xSuperhackContract.attach('0x36d07d0b52eab491d714732c7cc79dc39e3ab373') as XSuperhack
    const owner = new ethers.Wallet(process.env.PAYMASTERSIGNER_PRIVATE_KEY!)
    const tx = await xSuperhack.mintNFT(owner.address,metadataFile,{gasPrice:10e10})
    console.log("Minted a new xSuperhack NFT :", tx.hash)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  