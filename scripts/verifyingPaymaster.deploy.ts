const fs = require('fs');
import { ethers } from "hardhat";
import { Blob, File, Web3Storage } from "web3.storage";
import { VerifyingPaymaster } from "../typechain-types";
import { defaultAbiCoder, hexConcat, parseEther } from "ethers/lib/utils";
import { sign } from "crypto";
import { EntryPoint__factory } from "../typechain-types";

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const unlockTime = currentTimestampInSeconds + 60;

  // const lockedAmount = ethers.parseEther("0.001");

  // const lock = await ethers.deployContract("Lock", [unlockTime], {
  //   value: lockedAmount,
  // });

  // await lock.waitForDeployment();

  // console.log(
  //   `Lock with ${ethers.formatEther(
  //     lockedAmount
  //   )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  // );

  console.log("Deploying VerificationPaymaster")
  const entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
  
  const entryPoint = await (await ethers.getContractFactory("EntryPoint")).attach(entryPointAddress)
  const [deployerWallet] = await ethers.getSigners();
  console.log(`Verifying Paymaster Signer : ${deployerWallet.address}`)
	
  const VerifyingPaymasterArtifacts = await ethers.getContractFactory("VerifyingPaymaster");
  const verifyingPaymaster =  VerifyingPaymasterArtifacts.attach("0xE9866C87082Bac6a08a1F7CbBc2697d137fC5dfc")
	//await VerifyingPaymasterArtifacts.deploy(entryPointAddress,deployerWallet.address,{ maxFeePerGas: 10e9 });
  console.log(`Verfiying Paymaster Address: ${verifyingPaymaster.address}`)
	await verifyingPaymaster.addStake(1, { value: parseEther('2'),maxFeePerGas: 10e9  })
	console.log(`VerifyingPaymaster added 2 ETH Stake on EntryPoint Contract `)
	await entryPoint.depositTo(verifyingPaymaster.address, { value: parseEther('2'),maxFeePerGas: 10e9  });
	console.log(`VerifyingPaymaster deposited 2 ETH on EntryPoint Contract for transaction gas fee `)
	console.log(await entryPoint.balanceOf(verifyingPaymaster.address))



}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
