import { ethers } from "hardhat";
import { PaymasterApplicationsRegistry } from "../typechain-types";

async function main() {
  const PaymastersRegistryFactory = await ethers.getContractFactory("PaymasterApplicationsRegistry");
  let paymastersRegistry:PaymasterApplicationsRegistry  = await PaymastersRegistryFactory.deploy();
  console.log(`Paymaster Registry Contract : ${await paymastersRegistry.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
