const fs = require('fs');
import { ethers } from "hardhat";

async function main() {
  const [deployerWallet] = await ethers.getSigners();
  console.log(`SimpleZkSessionAccount Factory Deployer : ${deployerWallet.address}`)

  const entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
  const entryPoint = await (await ethers.getContractFactory("EntryPoint")).attach(entryPointAddress)
	
  console.log("Deploying SessionVerifier")

  const zkSessionAccountVerifierArtifact = await ethers.getContractFactory("SimpleZkSessionAccountVerifier");
  const zkSessionAccountVerifier = await zkSessionAccountVerifierArtifact.deploy({ gasPrice: 10e10  });
  console.log(`SimpleZkSessionAccountVerifier contract address: ${zkSessionAccountVerifier.address} \n`)

  console.log("Deploying SimpleZkSessionAccountFactory")
  const simpleZkSessionAccountFactoryArtifacts = await ethers.getContractFactory("SimpleZkSessionAccountFactory");
  const simpleZkSessionAccountFactory = await simpleZkSessionAccountFactoryArtifacts.deploy(entryPointAddress,zkSessionAccountVerifier.address,{ gasPrice: 10e10  })
  console.log(`SimpleZkSeesionAccountFactory contract address: ${simpleZkSessionAccountFactory.address} \n`)

  const deployerSCWAddress = await simpleZkSessionAccountFactory.getAddress(deployerWallet.address,0)
  console.log(`Deployer SCW address: ${deployerSCWAddress}`)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
