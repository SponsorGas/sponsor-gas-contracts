import { ethers } from "hardhat";
import { XSuperhack } from "../typechain-types";

async function main() {
    const xSuperhackContract = await ethers.getContractFactory("xSuperhack")
    const metadataFile = 'bafybeic2xgf4xjw745wjxuicknjhcn7hsxcwgyvndk64bvhboljp42wbje'
    const xSuperhack = await xSuperhackContract.attach('0x04f726034cEBb6DaBC6dC6a57f4aBe0B342e02A1') as XSuperhack
    const owner = new ethers.Wallet(process.env.PAYMASTERSIGNER_PRIVATE_KEY!)
    const tx = await xSuperhack.mintNFT('0xbf420e56cb86ffdca88903ea0d117b5f250bd3c9',metadataFile,{gasPrice:10e10})
    console.log("Minted a new xSuperhack NFT :", tx.hash)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  