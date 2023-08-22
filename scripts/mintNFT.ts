import { ethers } from "hardhat";
import { XSuperhack } from "../typechain-types";

async function main() {
    // const xSuperhackContract = await ethers.getContractFactory("xSuperhack")
    // const metadataFile = 'bafybeic2xgf4xjw745wjxuicknjhcn7hsxcwgyvndk64bvhboljp42wbje'
    // const xSuperhack = await xSuperhackContract.attach('0x04f726034cEBb6DaBC6dC6a57f4aBe0B342e02A1') as XSuperhack
    // const owner = new ethers.Wallet(process.env.PAYMASTERSIGNER_PRIVATE_KEY!)
    // const tx = await xSuperhack.mintNFT('0xbf420e56cb86ffdca88903ea0d117b5f250bd3c9',metadataFile,{gasPrice:10e10})
    // console.log("Minted a new xSuperhack NFT :", tx.hash)

    const navhHackerNFTContract = await ethers.getContractFactory("NAVHHackerNFT")
    const metadataFile = 'bafybeihiawt2btyclrj7hvihmpfrqlf6pcje6qfmwxlydql3k3lsfc7u7m'
    const navhHackerNFT = await navhHackerNFTContract.attach('0x2CEb1c6626Da4cD3C2d48ed99536A59B7F8241B9') as XSuperhack
    const owner = new ethers.Wallet(process.env.PAYMASTERSIGNER_PRIVATE_KEY!)
    // const tx = await navhHackerNFT.mintNFT('0xbf420e56cb86ffdca88903ea0d117b5f250bd3c9',metadataFile,{gasPrice:10e10})
    // console.log("Minted a new navhHacker NFT :", tx.hash)

    console.log(await navhHackerNFT.balanceOf('0xBF420E56cB86Ffdca88903EA0d117b5f250Bd3c9'))
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  