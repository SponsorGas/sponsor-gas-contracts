import { expect } from "chai";
import { ethers } from "hardhat";
import { PaymasterApplicationsRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { encodeBytes32String } from "ethers";

describe("PaymasterApplicationsRegistry", function () {
  let paymastersRegistry: PaymasterApplicationsRegistry;
  let owner: HardhatEthersSigner;
  let applicationAddress: string;
  let paymasterAddress: string;

  before(async function () {
    const PaymastersRegistryFactory = await ethers.getContractFactory("PaymasterApplicationsRegistry");
    paymastersRegistry = await PaymastersRegistryFactory.deploy();
    [owner] = await ethers.getSigners();

    applicationAddress = ethers.getAddress("0xEA68b3eFbBf63BB837F36A90AA97Df27bBF9B864");
    paymasterAddress = ethers.getAddress("0xd6F6bA8025366300822Dae5008762074bC72F1B5");
  });

  it("should register a paymaster", async function () {
    const paymasterMetadataCID = encodeBytes32String("metadataCID");
    await paymastersRegistry.registerPaymaster(paymasterAddress, paymasterMetadataCID);

    const paymaster = await paymastersRegistry.paymastersMap(paymasterAddress);
    expect(paymaster.isActive).to.be.true;
    expect(paymaster.owner).to.equal(owner.address);
    expect(await paymastersRegistry.isApplicationSupported(paymasterAddress, applicationAddress)).to.be.false;
  });

  it("should not register the same paymaster again", async () => {
    const paymasterMetadataCID = ethers.encodeBytes32String("metadataCID");
    await expect(paymastersRegistry.registerPaymaster(paymasterAddress, paymasterMetadataCID)).to.be.revertedWith(
      "Paymaster already registered"
    );
  });

  it("should add an application to a paymaster", async function () {
    await paymastersRegistry.connect(owner).addApplicationToPaymaster(paymasterAddress, applicationAddress);

    const isSupported = await paymastersRegistry.isApplicationSupported(paymasterAddress, applicationAddress);
    expect(isSupported).to.be.true;
  });

  it("should remove an application from a paymaster", async function () {
    await paymastersRegistry.connect(owner).removeApplicationFromPaymaster(paymasterAddress, applicationAddress);

    const isSupported = await paymastersRegistry.isApplicationSupported(paymasterAddress, applicationAddress);
    expect(isSupported).to.be.false;
  });

  it("should not unregister a paymaster if not the owner", async () => {
    const [account1, account2] = await ethers.getSigners();
    await expect(paymastersRegistry.connect(account2).unregisterPaymaster(paymasterAddress)).to.be.revertedWith(
      "Not the paymaster owner"
    );
  });

  it("should unregister a paymaster correctly", async () => {
    const paymaster1 = await paymastersRegistry.paymastersMap(paymasterAddress);
    expect(paymaster1.isActive).to.be.true;

    await paymastersRegistry.unregisterPaymaster(paymasterAddress);

    const paymaster = await paymastersRegistry.paymastersMap(paymasterAddress);
    expect(paymaster.isActive).to.be.false;
  });
});
