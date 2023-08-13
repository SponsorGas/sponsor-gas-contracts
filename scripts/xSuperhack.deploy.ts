import { ethers } from "hardhat";

async function main() {
    const xSuperhackContract = await ethers.getContractFactory("xSuperhack")
  
    // Start deployment, returning a promise that resolves to a contract object
    const xSuperhack = await xSuperhackContract.deploy({ gasPrice: 10e10  })
    await xSuperhack.deployed()
    console.log("xSuperhack Contract deployed to address:", xSuperhack.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  