import { ethers } from "hardhat";

async function main() {
    // const xSuperhackContract = await ethers.getContractFactory("xSuperhack")
  
    // // Start deployment, returning a promise that resolves to a contract object
    // const xSuperhack = await xSuperhackContract.deploy({ gasPrice: 10e10  })
    // await xSuperhack.deployed()
    // console.log("xSuperhack Contract deployed to address:", xSuperhack.address)
    const navhHackerNFTContract = await ethers.getContractFactory("NAVHHackerNFT")
  
    // Start deployment, returning a promise that resolves to a contract object
    const navhHackerNFT = await navhHackerNFTContract.deploy({ gasPrice: 10e10  })
    await navhHackerNFT.deployed()
    console.log("xSuperhack Contract deployed to address:", navhHackerNFT.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  