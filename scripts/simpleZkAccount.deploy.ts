const fs = require('fs');
import { ethers } from "hardhat";
import { Blob, File, Web3Storage } from "web3.storage";
import { VerifyingPaymaster } from "../typechain-types";
import { defaultAbiCoder, hexConcat, parseEther } from "ethers/lib/utils";
import { sign } from "crypto";
import { EntryPoint__factory } from "../typechain-types";

async function main() {
  const [deployerWallet] = await ethers.getSigners();
  console.log(`SimpleZkAccount Factory Deployer : ${deployerWallet.address}`)

  const entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
  const entryPoint = await (await ethers.getContractFactory("EntryPoint")).attach(entryPointAddress)
	
  console.log("Deploying SessionVerifier")

  const sessionVerifierArtifact = await ethers.getContractFactory("SessionVerifier");
  const sessionVerifier = await sessionVerifierArtifact.deploy({ gasPrice: 10e10  });
  console.log(`SessionVerifier contract address: ${sessionVerifier.address} \n`)

  console.log("Deploying SimpleZkAccountFactory")
  const simpleZkAccountFactoryArtifacts = await ethers.getContractFactory("SimpleZkAccountFactory");
  const simpleZkAccountFactory = await simpleZkAccountFactoryArtifacts.deploy(entryPointAddress,sessionVerifier.address,{ gasPrice: 10e10  })
  console.log(`SimpleZkAccountFactory contract address: ${simpleZkAccountFactory.address} \n`)

  const deployerSCWAddress = await simpleZkAccountFactory.getAddress(deployerWallet.address,0)
  console.log(`Deployer SCW address: ${deployerSCWAddress}`)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
